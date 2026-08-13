import { makeAutoObservable, toJS, runInAction } from 'mobx';
import { getBackgroundDefinition, normalizeBackgroundKey } from '@utils/backgroundConfig';
import { normalizeOption } from '@utils/projectDocument';
import { getLayoutPreset } from '@utils/layoutPresets';
import history from './history';
import assetStore from './assetStore';

const DEVICE_FRAMES = ['macbookpro16', 'macbookair', 'imacpro', 'ipadpro', 'iphonepro'];
const BACKGROUND_MODES = ['cover', 'fit', 'stretch'];
const BACKGROUND_ALIGNS = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
const isImageBackground = (definition) => definition?.type === 'builtin-image' || definition?.type === 'upload-image';

class Option {
    scale = 1;
    scaleX = false;
    scaleY = false;
    rotation = 0;
    padding = 0;
    paddingBg = 'rgba(255,255,255, 100)';
    round = 10;
    shadow = 3;
    frame = 'none';
    frameMode = 'cover';
    background = 'default_1';
    backgroundAssetId = null;
    backgroundMode = 'cover';
    backgroundAlign = 'center';
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
        this.shadow = value;
        history.commit('slider:shadow');
    }

    setFrame(value) {
        this.frame = value;
        history.commit();
    }

    setFrameMode(value) {
        this.frameMode = value;
        history.commit();
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

    /** 应用一个完整二维布局，只在操作结束时提交一次历史快照。 */
    applyLayoutPreset(id) {
        const preset = getLayoutPreset(id);
        if (!preset) return false;
        this.scale = preset.scale;
        this.rotation = preset.rotation;
        this.align = preset.align;
        this.padding = preset.padding;
        this.shadow = preset.shadow;
        this.frame = preset.frame;
        history.commit();
        return true;
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
    setBackgroundMode(value) {
        if (!BACKGROUND_MODES.includes(value)) return false;
        this.backgroundMode = value;
        const definition = getBackgroundDefinition(this.background);
        if (isImageBackground(definition)) this.frameConf.background = this.getBackgroundFill(definition);
        history.commit('background:mode');
        return true;
    }
    setBackgroundAlign(value) {
        if (!BACKGROUND_ALIGNS.includes(value)) return false;
        this.backgroundAlign = value;
        const definition = getBackgroundDefinition(this.background);
        if (isImageBackground(definition)) this.frameConf.background = this.getBackgroundFill(definition);
        history.commit('background:align');
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
        if (this.background === 'upload_image' && frameConf.background) {
            frameConf.background = { ...frameConf.background, url: null };
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
            background: this.background,
            backgroundAssetId: this.backgroundAssetId,
            backgroundMode: this.backgroundMode,
            backgroundAlign: this.backgroundAlign,
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
            this.background = next.background;
            this.backgroundAssetId = next.backgroundAssetId;
            this.backgroundMode = next.backgroundMode;
            this.backgroundAlign = next.backgroundAlign;
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
    }

    releaseBackgroundAsset() {
        if (!this.backgroundAssetId) return;
        assetStore.release(this.backgroundAssetId);
        this.backgroundAssetId = null;
    }
}

const option = new Option();
export default option;
