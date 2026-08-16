import { toJS } from 'mobx';
import option from './option';

/**
 * 共享底图快照服务（M5.1/M5.2）。
 *
 * 放大镜、模糊、马赛克等区域效果都需要「只含背景 + 外框 + 主截图、不含普通标注/水印/效果自身」
 * 的底图位图。本服务统一负责这张底图的请求、按 revision 缓存、防抖重生成与过期任务丢弃，
 * 避免每种效果各自导出整帧（technical-design.md「底图快照服务」）。
 *
 * - revision 由影响底图外观的 option 字段 + 图片源派生；未变化时复用快照。
 * - 基础内容变化后以防抖方式重新生成；旧任务返回时若 revision 已变则丢弃结果。
 * - 放大镜使用原始快照；模糊/马赛克通过 getVariant 缓存各自的「处理后变体」，底图变化时自动失效。
 *
 * 服务本身不持有 MobX 可观察状态：生成完成后通过 onUpdate 回调把快照写回 editor store 的
 * 可观察 `snap`，由既有 effect 驱动放大镜重绘。
 */

const DEBOUNCE_MS = 120;

/** 派生底图 revision：覆盖图片源、裁剪(→新 src)、翻转、HDR、背景、外框、画布尺寸与图片样式。 */
function computeRevision(editor) {
    const o = toJS(option);
    return JSON.stringify({
        img: editor?.img?.src || '',
        hdr: !!o.hdrEnabled,
        scale: o.scale,
        scaleX: o.scaleX,
        scaleY: o.scaleY,
        rotation: o.rotation,
        padding: o.padding,
        paddingBg: o.paddingBg,
        round: o.round,
        shadow: o.shadow,
        align: o.align,
        frame: o.frame,
        frameMode: o.frameMode,
        browserUrl: o.browserUrl,
        browserHeaderSize: o.browserHeaderSize,
        bg: o.frameConf?.background,
        width: o.frameConf?.width,
        height: o.frameConf?.height,
        // 背景轻量效果（模糊/遮罩/噪点）影响 Frame 底图外观，纳入 revision
        backgroundBlur: o.backgroundBlur,
        backgroundMaskColor: o.backgroundMaskColor,
        backgroundMaskOpacity: o.backgroundMaskOpacity,
        backgroundNoise: o.backgroundNoise,
    });
}

class BaseSnapshotService {
    constructor() {
        this.revision = null;          // 当前快照对应的 revision
        this.snapshot = null;          // 原始底图快照 { data, width, height } | null
        this.taskId = 0;               // 生成任务自增 id，用于丢弃过期结果
        this.timer = null;             // 防抖句柄
        this.onUpdate = null;          // (snapshot) => void，由 editor store 注入，写回可观察 snap
        this.variants = new Map();     // 处理后变体缓存：key -> { revision, snapshot }（M5.9/M5.10）
    }

    /** 当前原始底图快照（无则 null）。 */
    getSnapshot() {
        return this.snapshot;
    }

    /**
     * 请求一次（可能的）重新生成。
     * revision 未变且已有缓存时直接复用；否则防抖后重新导出。
     */
    schedule(editor, { force = false } = {}) {
        const revision = computeRevision(editor);
        if (!force && revision === this.revision && this.snapshot) return; // 内容未变，复用
        this.revision = revision;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this._generate(editor, revision), DEBOUNCE_MS);
    }

    async _generate(editor, revision) {
        const myTask = ++this.taskId;
        const frame = editor?.app?.tree?.children[0];
        if (!frame) return;
        // 仅保留主截图容器（背景 + 外框 + 截图），隐藏其余标注/水印/区域效果，避免递归捕获自身
        const hidden = [];
        frame.children.forEach((child) => {
            if (child.id !== 'screenshot-box') {
                child.visible = false;
                hidden.push(child);
            }
        });
        try {
            const image = await frame.export('png', { pixelRatio: 2 }).catch(() => null);
            // 过期任务或更新请求已到达：丢弃本次结果（M5.2 异步失效）
            if (myTask !== this.taskId || revision !== this.revision) return;
            this.snapshot = image;
            this.variants.clear(); // 底图变化 → 失效所有处理变体
            if (this.onUpdate) this.onUpdate(image);
        } finally {
            hidden.forEach((child) => { child.visible = true; });
        }
    }

    /**
     * 获取一个处理后的底图变体（模糊/马赛克）。revision 不变时复用缓存，否则用
     * generator(rawSnapshot) 重新生成并缓存。底图尚未就绪或不匹配时返回 null（调用方下一帧再取）。
     */
    async getVariant(editor, key, generator) {
        const revision = computeRevision(editor);
        const cached = this.variants.get(key);
        if (cached && cached.revision === revision && cached.snapshot) return cached.snapshot;
        if (!this.snapshot || revision !== this.revision) {
            // 底图缺失或已过期：触发重生成，本次返回 null
            this.schedule(editor, { force: revision !== this.revision });
            return null;
        }
        const variant = await generator(this.snapshot);
        if (revision !== this.revision) return null; // 生成期间底图已变，丢弃
        this.variants.set(key, { revision, snapshot: variant });
        return variant;
    }

    /** 丢弃快照、revision、变体缓存与在途任务（换图、销毁、无消费者时调用）。 */
    invalidate() {
        this.taskId += 1; // 使任何在途生成结果作废
        this.revision = null;
        this.snapshot = null;
        this.variants.clear();
        clearTimeout(this.timer);
    }
}

export default new BaseSnapshotService();
