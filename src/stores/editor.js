import { makeAutoObservable, toJS, action, runInAction } from 'mobx';
import { maxBy } from 'lodash';
import '@leafer-in/export';
import option from './option';
import history from './history';
import { createDocument, validateDocument, normalizeShape } from '@utils/projectDocument';

let timer;
class Editor {
    img = {};
    invalid = false;
    app = null;
    scale = 100;
    useTool = null;
    annotateColor = '#ff0000';
    strokeWidth = 4;
    shapes = new Map();
    message = null;
    theme = 'light';
    clearFun = null;
    snap = null;
    constructor () {
        makeAutoObservable(this)
    }

    get shapesList() {
        return Array.from(toJS(this.shapes).values());
    }

    get cursor() {
        return this.useTool === 'Pencil' ? 'pencil' : this.useTool ? 'crosshair' : 'auto'
    }

    get isEditing() {
        const is = !!this.app?.tree;
        if (!is) {
            this.message.info('请先添加图片');
            this.setInvalid();
        }
        return is;
    }

    get nextStep() {
        const steps = this.shapesList.filter(e => e.type === 'Step');
        const maxItem = maxBy(steps, (item) => Number(item.text));
        if (maxItem?.text) return Number(maxItem.text) + 1;
        return 1;
    }

    get isDark() {
        return this.theme === 'dark';
    }

    createSnap(type) {
        if (type === 'init' && this.snap?.data) return;
        if (type !== 'init' && this.snap === null) return;
        const ex = async () => {
            const frame = this.app?.tree?.children[0];
            if (!frame) return;
            frame.children.map(child => {
                if (child.id !== 'screenshot-box') {
                    child.visible = false;
                }
            });
            const image = await frame.export('png', { pixelRatio: 2 }).catch(() => null);
            frame.children.map(child => child.visible = true);
            runInAction(() => {
                this.snap = image;
            });
        };
        ex();
    }

    setTheme(value) {
        if (value === this.theme) return;
        runInAction(() => {
            if (value) {
                this.theme = value;
            } else {
                this.theme = this.isDark ? 'light' : 'dark';
            }
        });
    }

    setInvalid() {
        clearTimeout(timer);
        this.invalid = true;
        timer = setTimeout(action(() => {
            this.invalid = false;
        }), 200);
    }

    setImg(value) {
        this.img = value;
    }

    setMessage(value) {
        this.message = value;
    }

    getShape(id) {
        return this.shapes.get(id);
    }

    addShape(shape) {
        // 兼容旧入口；统一经 updateShape 完成规范化写入
        this.updateShape(shape);
    }

    /**
     * 统一更新/新增一个 shape：经 normalizeShape 规范化后写入 Map。
     * 所有 shape 写入（拖拽、颜色/线宽修改、历史恢复）都应走此方法，
     * 禁止外部直接 shapes.set 或直接修改 shape 对象字段。
     */
    updateShape(shape) {
        const next = normalizeShape(shape);
        if (!next) return;
        this.shapes.set(next.id, next);
    }

    /**
     * 序列化当前项目为可恢复的 ProjectDocument。
     * 只含 option 配置与 shapes 标注；img、app、视图缩放(scale)、theme、snap 等
     * 非内容状态不进入文档（snap 由 M5 独立管理，明确不进文档）。
     */
    serializeProject() {
        return createDocument({
            option: option.toDocument(),
            shapes: this.shapesList.map((shape) => toJS(shape))
        });
    }

    /**
     * 从文档恢复项目：恢复 option 与 shapes，并清空 LeaferJS 编辑器选择，
     * 避免选中引用已被 React 重建/卸载的节点。不触碰 app、img、theme、视图缩放。
     */
    restoreProject(doc) {
        const { doc: valid } = validateDocument(doc);
        runInAction(() => {
            option.restoreFromDocument(valid.option);
            this.shapes.clear();
            valid.shapes.forEach((shape) => {
                const next = normalizeShape(shape);
                if (next) this.shapes.set(next.id, next);
            });
        });
        this.clearSelection();
    }

    /**
     * 取消 LeaferJS 编辑器当前选择。历史恢复后原选中节点可能已失效，需主动清空。
     */
    clearSelection() {
        const editor = this.app?.editor;
        if (!editor) return;
        try {
            editor.target = null;
            editor.update?.();
        } catch (e) {
            // 编辑器可能尚未就绪，忽略
        }
    }

    removeShape(shape) {
        this.shapes.delete(shape.id);
        if (this.snap && this.shapesList.every(e => e.type !== 'Magnifier')) {
            this.snap = null;
        }
    }

    setApp(app) {
        this.app = app;
    }

    setScale(value) {
        this.scale = parseInt(value * 100);
    }

    setUseTool(value) {
        this.useTool = value;
        if (value) {
            this.setMove(false);
            this.setSelect(false);
        } else {
            this.setSelect(true);
        }
    }

    setSelect(value) {
        if (!this.app) return;
        this.app.editor.hittable = value;
    }

    setMove(value) {
        if (!this.app) return;
        this.app.config.move.drag = value;
        if (this.app.interaction?.config?.move) {
            this.app.interaction.config.move.drag = value;
        }
        this.setSelect(!value);
    }
    

    setAnnotateColor(color) {
        this.annotateColor = color;
        if (!this.app?.editor) return;
        const { list } = this.app.editor;
        if (!list.length) return;
        let changed = false;
        for (let item of list) {
            const shape = this.shapes.get(item.id);
            if (shape) {
                this.updateShape({ ...shape, fill: color });
                changed = true;
            }
        }
        // 仅在确实改动了已有标注时入历史；只改默认色（无选中）不入历史
        if (changed) history.commit('style:color');
    }

    setStrokeWidth(value) {
        this.strokeWidth = value;
        if (!this.app?.editor) return;
        const { list } = this.app.editor;
        if (!list.length) return;
        let changed = false;
        for (let item of list) {
            const shape = this.shapes.get(item.id);
            if (shape) {
                this.updateShape({ ...shape, strokeWidth: value });
                changed = true;
            }
        }
        if (changed) history.commit('style:width');
    }

    setClearFun(value) {
        this.clearFun = value;
    }

    clearImg() {
        option.releaseBackgroundAsset();
        this.img = {};
    }

    destroy() {
        option.releaseBackgroundAsset();
        this.app?.destroy(true);
        this.app = null;
        this.snap = null;
        this.shapes.clear();
        this.setUseTool(null);
    }
}

const editor = new Editor();
export default editor;
