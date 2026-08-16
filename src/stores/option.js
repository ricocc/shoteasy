import { makeAutoObservable, toJS, runInAction } from 'mobx';
import { getBackgroundDefinition, normalizeBackgroundKey } from '@utils/backgroundConfig';
import { normalizeOption, normalizeShadow, shadowFromIntensity } from '@utils/projectDocument';
import history from './history';
import assetStore from './assetStore';

const DEVICE_FRAMES = ['macbookpro16', 'macbookair', 'imacpro', 'ipadpro', 'iphonepro'];
const BACKGROUND_MODES = ['cover', 'fit', 'stretch'];
const BACKGROUND_ALIGNS = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
const isImageBackground = (definition) => definition?.type === 'builtin-image' || definition?.type === 'upload-image';

// 远程背景下载的取消控制器（模块级、非 observable，避免被 MobX 追踪）。
// 每次 _fetchImageBackground 创建新控制器并 abort 上一个，防止旧请求覆盖新选择（M4.14）。
let imageBackgroundAbort = null;

class Option {
    scale = 1;
    scaleX = false;
    scaleY = false;
    rotation = 0;
    padding = 0;
    paddingBg = 'rgba(255,255,255, 100)';
    round = 10;
    // 完整阴影配置（V1 由 0-6 强度档位迁移）；默认档 = 旧 shadow:3 的视觉
    shadow = shadowFromIntensity(3);
    frame = 'none';
    frameMode = 'cover';
    browserUrl = 'shoteasy.app';
    browserHeaderSize = 100;
    background = 'default_1';
    backgroundAssetId = null;
    backgroundMode = 'cover';
    backgroundAlign = 'center';
    backgroundLoading = false;
    // 背景轻量效果（M4.11/M4.12/M4.13），默认关闭
    backgroundBlur = 0;
    backgroundMaskColor = '#000000';
    backgroundMaskOpacity = 0;
    backgroundNoise = 0;
    align = 'center';
    waterImg = null;
    waterIndex = 1;
    hdrEnabled = false;
    size = {
        type: 'auto',
        title: '自动'
    };
    frameConf = {
        width: 800,
        height: 600,
        background: {
            type: 'linear',
            from: 'left',
            to: 'right',
            stops: ['#6366f1', '#a855f7', '#ec4899']
        }
    }
    constructor() {
        makeAutoObservable(this);
    }

    get waterSvg() {
        return toJS(this.waterImg);
    }

    get mode() {
        return DEVICE_FRAMES.includes(this.frame) ? this.frameMode : 'cover';
    }

    setScale(value) {
        this.scale = value;
        history.commit('slider:scale');
    }

    setPadding(value) {
        this.padding = value;
        history.commit('slider:padding');
    }

    setPaddingBg(value) {
        this.paddingBg = value;
        history.commit('slider:paddingBg');
    }

    setRound(value) {
        this.round = value;
        history.commit('slider:round');
    }

    setShadow(value) {
        // 兼容旧调用：number 档位整体替换；对象走 setShadowConf
        this.shadow = typeof value === 'number' ? shadowFromIntensity(value) : normalizeShadow(value);
        history.commit('slider:shadow');
    }

    /** 合并更新阴影配置的任意字段（x/y/blur/spread/color/visible），一次交互只提交一步历史。 */
    setShadowConf(partial) {
        this.shadow = { ...this.shadow, ...partial };
        history.commit('shadow:conf');
    }

    setFrame(value) {
        this.frame = value;
        history.commit();
    }

    setFrameMode(value) {
        this.frameMode = value;
        history.commit();
    }

    setBrowserUrl(value, { commit = true } = {}) {
        this.browserUrl = String(value ?? '').slice(0, 160);
        if (commit) history.commit('browser:url');
    }

    setBrowserHeaderSize(value, { commit = true } = {}) {
        const size = Number(value);
        if (!Number.isFinite(size)) return;
        this.browserHeaderSize = Math.max(50, Math.min(200, Math.round(size)));
        if (commit) history.commit('browser:header-size');
    }

    setFrameSize(width, height) {
        const nextWidth = Number(width);
        const nextHeight = Number(height);
        if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight) || nextWidth <= 0 || nextHeight <= 0) return;
        this.frameConf.width = Math.round(nextWidth);
        this.frameConf.height = Math.round(nextHeight);
    }

    setAlign(value) {
        this.align = value;
        history.commit();
    }

    setSize(value) {
        this.size.type = value.type;
        this.size.title = value.title;
        this.setFrameSize(value.width, value.height);
        history.commit();
    }

    setRotation(value) {
        const rotation = Number(value);
        if (!Number.isFinite(rotation)) return;
        this.rotation = Math.max(-180, Math.min(180, rotation));
        history.commit('rotation');
    }

    setBackground(value) {
        const key = normalizeBackgroundKey(value);
        const definition = getBackgroundDefinition(key);
        if (!definition) return false;
        this.releaseBackgroundAsset();
        this.background = key;
        this.backgroundAssetId = null;
        this.frameConf.background = this.getBackgroundFill(definition);
        history.commit();
        return true;
    }
    /**
     * 统一背景选择入口（M4.10）。
     * 非图片背景走同步 setBackground；内置图片背景先下载为 Blob 再应用——
     * 只有获取成功后才提交 store，失败时保留上一个有效背景（M4.14）。
     * 返回 true=成功，false=被更新的选择取消，抛错=下载失败（调用方提示）。
     */
    async applyBackground(value) {
        const key = normalizeBackgroundKey(value);
        const definition = getBackgroundDefinition(key);
        if (!definition) return false;
        if (definition.type === 'builtin-image') {
            return this._fetchImageBackground(key);
        }
        return this.setBackground(key);
    }
    async _fetchImageBackground(key, { commit = true } = {}) {
        const definition = getBackgroundDefinition(key);
        const remoteUrl = definition?.fill?.url;
        if (!remoteUrl) return this.setBackground(key);
        // 取消上一个未完成的远程下载
        if (imageBackgroundAbort) imageBackgroundAbort.abort();
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        imageBackgroundAbort = controller;
        runInAction(() => { this.backgroundLoading = true; });
        try {
            const asset = await assetStore.addFromUrl(remoteUrl, controller?.signal);
            // 下载期间用户又选了别的背景：放弃本次结果
            if (controller?.signal?.aborted || imageBackgroundAbort !== controller) return false;
            runInAction(() => {
                this.releaseBackgroundAsset();
                this.background = key;
                this.backgroundAssetId = asset.id;
                this.frameConf.background = {
                    type: 'image',
                    url: asset.url,
                    mode: this.backgroundMode,
                    align: this.backgroundAlign,
                };
                this.backgroundLoading = false;
            });
            if (commit) history.commit();
            return true;
        } catch (err) {
            // 被取消：静默返回（更新的选择会自行处理）
            if (controller?.signal?.aborted || imageBackgroundAbort !== controller) return false;
            runInAction(() => { this.backgroundLoading = false; });
            throw err;
        }
    }
    setBackgroundMode(value) {
        if (!BACKGROUND_MODES.includes(value)) return false;
        this.backgroundMode = value;
        this._syncImageBackgroundFill();
        history.commit('background:mode');
        return true;
    }
    setBackgroundAlign(value) {
        if (!BACKGROUND_ALIGNS.includes(value)) return false;
        this.backgroundAlign = value;
        this._syncImageBackgroundFill();
        history.commit('background:align');
        return true;
    }
    /**
     * 图片背景的 mode/align 变更后重建 frameConf.background。
     * 必须保留当前运行时 URL：上传背景的 blob: 不在静态定义里（definition.fill 为 null），
     * 内置图片背景运行时也已把远程 URL 替换为同源 blob:（M4.10，避免导出跨域）。
     * 若用静态定义（getBackgroundFill）重建会丢掉 blob:，导致背景消失或导出 canvas 被 tainted。
     */
    _syncImageBackgroundFill() {
        const definition = getBackgroundDefinition(this.background);
        if (!isImageBackground(definition)) return;
        const currentUrl = this.frameConf.background?.url;
        this.frameConf.background = {
            type: 'image',
            url: currentUrl || definition?.fill?.url || null,
            mode: this.backgroundMode,
            align: this.backgroundAlign,
        };
    }
    setBackgroundBlur(value) {
        const blur = Math.max(0, Math.min(30, Number(value) || 0));
        this.backgroundBlur = blur;
        history.commit('slider:bgblur');
        return true;
    }
    setBackgroundMaskColor(value) {
        this.backgroundMaskColor = typeof value === 'string' && value ? value : this.backgroundMaskColor;
        history.commit('bgmask');
        return true;
    }
    setBackgroundMaskOpacity(value) {
        const opacity = Math.max(0, Math.min(1, Number(value) || 0));
        this.backgroundMaskOpacity = opacity;
        history.commit('slider:bgmask');
        return true;
    }
    setBackgroundNoise(value) {
        const noise = Math.max(0, Math.min(1, Number(value) || 0));
        this.backgroundNoise = noise;
        history.commit('slider:bgnoise');
        return true;
    }
    setUploadedBackground(asset) {
        if (!asset?.id || !asset.url) return false;
        this.releaseBackgroundAsset();
        this.background = 'upload_image';
        this.backgroundAssetId = asset.id;
        this.frameConf.background = {
            type: 'image',
            url: asset.url,
            mode: this.backgroundMode,
            align: this.backgroundAlign,
        };
        history.commit();
        return true;
    }
    setCustomSolidBackground(color) {
        if (typeof color !== 'string' || !color) return false;
        this.releaseBackgroundAsset();
        this.background = 'custom_solid';
        this.backgroundAssetId = null;
        this.frameConf.background = { type: 'solid', color };
        history.commit();
        return true;
    }
    getBackgroundFill(definition) {
        if (!definition?.fill || !isImageBackground(definition)) return definition?.fill ?? null;
        return {
            ...definition.fill,
            mode: this.backgroundMode,
            align: this.backgroundAlign,
        };
    }
    toggleFlip(type) {
        if (type === 'x') {
            this.scaleX = !this.scaleX;
        }
        if (type === 'y') {
            this.scaleY = !this.scaleY;
        }
        history.commit();
    }
    setWaterImg(value) {
        this.waterImg = value;
        history.commit('water');
    }
    setWaterIndex(value) {
        this.waterIndex = value;
        history.commit('water');
    }
    setHdrEnabled(value) {
        this.hdrEnabled = value;
        history.commit();
    }

    /**
     * 导出当前 option 的可序列化快照。
     * 返回纯值副本，供 ProjectDocument 与历史快照使用；不包含任何方法或 MobX 包装。
     */
    toDocument() {
        const frameConf = toJS(this.frameConf);
        if (frameConf.background) {
            if (this.background === 'upload_image') {
                frameConf.background = { ...frameConf.background, url: null };
            } else if (getBackgroundDefinition(this.background)?.type === 'builtin-image') {
                // 内置图片背景运行时持有一次性 blob: URL；序列化时回写稳定的远程 URL，避免保存失效地址
                const remote = getBackgroundDefinition(this.background)?.fill?.url;
                if (remote) frameConf.background = { ...frameConf.background, url: remote };
            }
        }
        return toJS({
            scale: this.scale,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            rotation: this.rotation,
            padding: this.padding,
            paddingBg: this.paddingBg,
            round: this.round,
            shadow: this.shadow,
            frame: this.frame,
            frameMode: this.frameMode,
            browserUrl: this.browserUrl,
            browserHeaderSize: this.browserHeaderSize,
            background: this.background,
            backgroundAssetId: this.backgroundAssetId,
            backgroundMode: this.backgroundMode,
            backgroundAlign: this.backgroundAlign,
            backgroundBlur: this.backgroundBlur,
            backgroundMaskColor: this.backgroundMaskColor,
            backgroundMaskOpacity: this.backgroundMaskOpacity,
            backgroundNoise: this.backgroundNoise,
            align: this.align,
            waterImg: this.waterImg,
            waterIndex: this.waterIndex,
            hdrEnabled: this.hdrEnabled,
            size: this.size,
            frameConf
        });
    }

    /**
     * 从文档恢复 option。直接按文档快照赋值（文档已是权威值），不调用带副作用的
     * setter（如 setBackground 会重新派生 frameConf.background），以保证恢复结果
     * 与快照完全一致。缺失字段由 normalizeOption 用默认值补齐。
     */
    restoreFromDocument(doc) {
        const next = normalizeOption(doc?.option ?? doc);
        if (this.backgroundAssetId && this.backgroundAssetId !== next.backgroundAssetId) {
            assetStore.release(this.backgroundAssetId);
        }
        runInAction(() => {
            this.scale = next.scale;
            this.scaleX = next.scaleX;
            this.scaleY = next.scaleY;
            this.rotation = next.rotation;
            this.padding = next.padding;
            this.paddingBg = next.paddingBg;
            this.round = next.round;
            this.shadow = next.shadow;
            this.frame = next.frame;
            this.frameMode = next.frameMode;
            this.browserUrl = next.browserUrl;
            this.browserHeaderSize = next.browserHeaderSize;
            this.background = next.background;
            this.backgroundAssetId = next.backgroundAssetId;
            this.backgroundMode = next.backgroundMode;
            this.backgroundAlign = next.backgroundAlign;
            this.backgroundBlur = next.backgroundBlur;
            this.backgroundMaskColor = next.backgroundMaskColor;
            this.backgroundMaskOpacity = next.backgroundMaskOpacity;
            this.backgroundNoise = next.backgroundNoise;
            this.align = next.align;
            this.waterImg = next.waterImg;
            this.waterIndex = next.waterIndex;
            this.hdrEnabled = next.hdrEnabled;
            this.size = next.size;
            this.frameConf = next.frameConf;
            const asset = assetStore.get(this.backgroundAssetId);
            if (asset && this.background === 'upload_image' && this.frameConf.background?.type === 'image') {
                this.frameConf.background = { ...this.frameConf.background, url: asset.url };
            }
        });
        // 内置图片背景：恢复时使用的是远程 URL，异步重新下载为 Blob 以保证导出同源（M4.10）。
        // 视觉与远程一致，故不提交历史。
        // 草稿恢复会先把持久化 Blob 登记到 assetStore；已有同源运行时 URL 时
        // 无需再次请求远程背景，避免恢复阶段产生竞态或覆盖已恢复资源。
        if (getBackgroundDefinition(this.background)?.type === 'builtin-image' && !assetStore.get(this.backgroundAssetId)) {
            this._fetchImageBackground(this.background, { commit: false }).catch(() => { });
        }
    }

    releaseBackgroundAsset() {
        if (!this.backgroundAssetId) return;
        assetStore.release(this.backgroundAssetId);
        this.backgroundAssetId = null;
    }
}

const option = new Option();
export default option;
