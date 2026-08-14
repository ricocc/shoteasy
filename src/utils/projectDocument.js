import { getBackgroundDefinition, normalizeBackgroundKey } from '@utils/backgroundConfig';

const BACKGROUND_MODES = ['cover', 'fit', 'stretch'];
const BACKGROUND_ALIGNS = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

/**
 * V1 项目文档（ProjectDocument）
 *
 * 作为 V1 后续功能（历史、本地草稿等）共同依赖的可序列化事实来源。
 * 一个文档必须满足：纯 JSON 可序列化，不包含 LeaferJS App、Blob、object URL、
 * message 回调或 DOM 节点。放大镜快照（editor.snap）不属于文档，由 M5 独立管理。
 *
 * 文档结构：
 * {
 *   version: 1,
 *   option: { ...画框/背景/尺寸等配置 },
 *   shapes: [ { id, type, fill, strokeWidth, zIndex, x, y, width, height, rotation, scaleX, scaleY,
 *               points, text, textStyle, effect, editable } ]
 *   // text 携带 textStyle 子结构；blur/mosaic/spotlight 携带 effect 子结构；
 *   // 两者均经 normalizeShape 的 {...raw} 透传（非 NUMERIC_FIELDS，整体保留）。
 * }
 *
 * 视图缩放（editor.scale）、主题（editor.theme）、面板开合、导出格式与倍率等
 * 非内容状态不进入文档；这里只承载真正需要撤销/重做与持久化的内容。
 */

// 当前文档版本号；结构不兼容时递增并在 migrateDocument 中补充迁移逻辑。
export const PROJECT_VERSION = 1;

// 可读取的最低版本；低于此版本视为无法恢复。
export const MIN_VERSION = 1;

// 已知的标注类型；未知类型在规范化时不丢弃，保留原值，由渲染层忽略，
// 这样未来 M5 新增类型时旧文档读取不会被破坏。
export const SHAPE_TYPES = [
    'Square',
    'SquareFill',
    'Circle',
    'Slash',
    'MoveDownLeft',
    'Pencil',
    'Magnifier',
    'Step',
    'emoji',
    'text',
    'blur',
    'mosaic',
    'spotlight'
];

const NUMERIC_FIELDS = ['x', 'y', 'width', 'height', 'strokeWidth', 'zIndex', 'rotation', 'scaleX', 'scaleY'];

/**
 * 默认 option 快照。与 stores/option.js 的类字段保持一致；
 * 两者都是 V1 锁定的默认值，改动任一处时需同步。
 */
export function defaultOption() {
    return {
        scale: 1,
        scaleX: false,
        scaleY: false,
        rotation: 0,
        padding: 0,
        paddingBg: 'rgba(255,255,255, 100)',
        round: 10,
        shadow: 3,
        frame: 'none',
        frameMode: 'cover',
        background: 'default_1',
        backgroundAssetId: null,
        backgroundMode: 'cover',
        backgroundAlign: 'center',
        backgroundBlur: 0,
        backgroundMaskColor: '#000000',
        backgroundMaskOpacity: 0,
        backgroundNoise: 0,
        align: 'center',
        waterImg: null,
        waterIndex: 1,
        hdrEnabled: false,
        size: { type: 'auto', title: '自动' },
        frameConf: {
            width: 800,
            height: 600,
            background: {
                type: 'linear',
                from: 'left',
                to: 'right',
                stops: ['#6366f1', '#a855f7', '#ec4899']
            }
        }
    };
}

/** 全新默认文档。 */
export function defaultDocument() {
    return {
        version: PROJECT_VERSION,
        option: defaultOption(),
        image: null,
        shapes: []
    };
}

/**
 * 将单个 shape 规范化为 V1 统一结构。
 * 兼容读取当前旧 shape 字段：颜色回退 color/stroke，几何字段强转数字，
 * 缺失 id 的脏数据直接丢弃。这是新写入与历史恢复共用的单一入口。
 */
export function normalizeShape(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const shape = { ...raw };

    // 颜色：优先 fill，回退 color / stroke（旧实现部分类型用 stroke 承载颜色）
    if (shape.fill == null || shape.fill === '') {
        shape.fill = shape.color ?? shape.stroke ?? '#ff0000';
    }
    // 删除冗余的 color 别名，避免历史快照里出现重复来源
    delete shape.color;

    // 几何/数值字段统一转 number，过滤脏字符串
    for (const key of NUMERIC_FIELDS) {
        if (shape[key] != null && shape[key] !== '') {
            const n = Number(shape[key]);
            shape[key] = Number.isFinite(n) ? n : 0;
        }
    }

    // 变换默认值：rotation=0、scaleX/scaleY=1。
    // 编辑器移动/缩放/旋转后这些字段写回 shape，保证几何可被历史完整还原。
    if (shape.rotation == null) shape.rotation = 0;
    if (shape.scaleX == null) shape.scaleX = 1;
    if (shape.scaleY == null) shape.scaleY = 1;

    // points 仅对 Slash/MoveDownLeft/Pencil 有意义，统一保持为数组
    if (shape.points != null && !Array.isArray(shape.points)) {
        shape.points = [];
    }

    // 没有合法 id 无法被 Map 索引，直接丢弃
    if (!shape.id) return null;

    return shape;
}

/**
 * 用默认值补齐 option 缺失字段（浅层 + frameConf/size 两层）。
 * 用于从旧 store 数据或外部数据构建文档时保证结构完整。
 */
export function normalizeOption(raw) {
    const base = defaultOption();
    if (!raw || typeof raw !== 'object') return base;
    const out = { ...base, ...raw };
    const rawBackground = raw.background;
    const rawBackgroundKey = rawBackground && typeof rawBackground === 'object'
        ? (rawBackground.presetKey || rawBackground.key || rawBackground.id)
        : rawBackground;
    out.background = normalizeBackgroundKey(rawBackgroundKey);
    out.backgroundAssetId = raw.backgroundAssetId ?? rawBackground?.assetId ?? null;
    const rawBackgroundMode = raw.backgroundMode ?? rawBackground?.mode ?? raw.frameConf?.background?.mode;
    const rawBackgroundAlign = raw.backgroundAlign ?? rawBackground?.align ?? raw.frameConf?.background?.align;
    out.backgroundMode = BACKGROUND_MODES.includes(rawBackgroundMode) ? rawBackgroundMode : base.backgroundMode;
    out.backgroundAlign = BACKGROUND_ALIGNS.includes(rawBackgroundAlign) ? rawBackgroundAlign : base.backgroundAlign;
    const rotation = Number(raw.rotation);
    out.rotation = Number.isFinite(rotation) ? Math.max(-180, Math.min(180, rotation)) : base.rotation;
    const blur = Number(raw.backgroundBlur);
    out.backgroundBlur = Number.isFinite(blur) ? Math.max(0, Math.min(30, blur)) : base.backgroundBlur;
    const maskOpacity = Number(raw.backgroundMaskOpacity);
    out.backgroundMaskOpacity = Number.isFinite(maskOpacity) ? Math.max(0, Math.min(1, maskOpacity)) : base.backgroundMaskOpacity;
    const noise = Number(raw.backgroundNoise);
    out.backgroundNoise = Number.isFinite(noise) ? Math.max(0, Math.min(1, noise)) : base.backgroundNoise;
    out.backgroundMaskColor = (typeof raw.backgroundMaskColor === 'string' && raw.backgroundMaskColor) ? raw.backgroundMaskColor : base.backgroundMaskColor;
    out.size = { ...base.size, ...(raw.size || {}) };
    out.frameConf = { ...base.frameConf, ...(raw.frameConf || {}) };
    const rawFill = raw.frameConf?.background ?? (rawBackground && typeof rawBackground === 'object' ? rawBackground.fill : undefined);
    if (out.background === 'none' && rawFill == null) {
        out.frameConf.background = null;
    } else if (rawFill != null) {
        out.frameConf.background = rawFill;
    } else {
        out.frameConf.background = getBackgroundDefinition(out.background)?.fill ?? base.frameConf.background;
    }
    const definition = getBackgroundDefinition(out.background);
    if ((definition?.type === 'builtin-image' || definition?.type === 'upload-image') && out.frameConf.background?.type === 'image') {
        out.frameConf.background = {
            ...out.frameConf.background,
            mode: out.backgroundMode,
            align: out.backgroundAlign,
        };
    }
    return out;
}

/**
 * 规范化主图引用（M6）。{ assetId, width, height, type, name } 全为可序列化值；
 * 宽高强转数字。draftService 保存时填入 assetId（`image:<key>`）与 editor.img 元数据。
 */
export function normalizeImage(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const out = { ...raw };
    if (out.width != null) { const n = Number(out.width); out.width = Number.isFinite(n) ? n : 0; }
    if (out.height != null) { const n = Number(out.height); out.height = Number.isFinite(n) ? n : 0; }
    return out;
}

/**
 * 把当前 store 中的 option 与 shapes（已经是 toJS 后的纯数据）打包成 V1 文档。
 * 这是“旧 store 数据到 V1 文档”的迁移入口：旧 shape 经 normalizeShape 规范化，
 * 旧 option 经 normalizeOption 补齐。输入必须是纯值，调用方负责 toJS。
 */
export function createDocument({ option, shapes, image } = {}) {
    return {
        version: PROJECT_VERSION,
        option: normalizeOption(option),
        image: normalizeImage(image),
        shapes: Array.isArray(shapes) ? shapes.map(normalizeShape).filter(Boolean) : []
    };
}

/**
 * 轻量校验：只校验顶层结构与版本范围，字段级健壮性交给 normalize*。
 * 返回 { ok, doc, errors }；ok 为 false 时 doc 仍尽量给出可用的默认文档。
 */
export function validateDocument(input) {
    const errors = [];
    if (!input || typeof input !== 'object') {
        return { ok: false, doc: defaultDocument(), errors: ['document is not an object'] };
    }
    const version = Number(input.version);
    if (!Number.isFinite(version)) {
        errors.push('missing or invalid version');
    } else if (version < MIN_VERSION || version > PROJECT_VERSION) {
        errors.push(`unsupported version ${input.version}`);
    }
    if (input.option != null && typeof input.option !== 'object') {
        errors.push('option is not an object');
    }
    if (input.shapes != null && !Array.isArray(input.shapes)) {
        errors.push('shapes is not an array');
    }
    // 即使有小问题也尝试规范化出可用文档，避免一次格式瑕疵导致整份历史不可用
    const doc = {
        version: PROJECT_VERSION,
        option: normalizeOption(input.option),
        image: normalizeImage(input.image),
        shapes: Array.isArray(input.shapes) ? input.shapes.map(normalizeShape).filter(Boolean) : []
    };
    return { ok: errors.length === 0, doc, errors };
}

/**
 * 把任意支持版本迁移到当前 PROJECT_VERSION。
 * 目前只有 v1，这里做透传 + 规范化；未来新增版本时在此追加分支。
 */
export function migrateDocument(input) {
    const { doc, errors } = validateDocument(input);
    // 版本未知但结构可解析时仍返回规范化结果，由调用方决定是否接受
    if (errors.length && !doc.option && !doc.shapes.length) {
        return defaultDocument();
    }
    doc.version = PROJECT_VERSION;
    return doc;
}
