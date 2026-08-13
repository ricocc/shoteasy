import { makeAutoObservable, runInAction } from 'mobx';
import editor from './editor';
import UndoRedoManager from '@utils/UndoRedoManager';

// 历史上限：最多保留 50 步项目快照
const LIMIT = 50;
// 合并窗口：相同语义的连续操作在此毫秒数内合并为一步
const MERGE_WINDOW = 400;

/**
 * 项目级撤销/重做。
 *
 * 每个快照是 editor.serializeProject() 的纯数据（option + shapes），
 * 不含 LeaferJS App、Blob、object URL、视图缩放、主题、导出设置等非内容状态。
 *
 * 采用显式 commit（在用户意图边界调用），restore 时直接写字段、绕过会触发 commit
 * 的 setter，因此 undo/redo 不会产生反馈式提交。
 */
class History {
    manager = null;
    canUndo = false;
    canRedo = false;
    _mergeKey = null;
    _mergeAt = 0;

    constructor() {
        makeAutoObservable(this);
        this.manager = new UndoRedoManager({
            limit: LIMIT,
            onChange: () => this._syncFlags()
        });
    }

    _syncFlags() {
        // onChange 可能在 action 之外触发，统一用 runInAction 更新可观察标志
        runInAction(() => {
            this.canUndo = this.manager?.canUndo ?? false;
            this.canRedo = this.manager?.canRedo ?? false;
        });
    }

    /**
     * 重建基线：清空历史并以当前项目状态作为不可撤销的起点。
     * 换图、清空、组件首次进入编辑器时调用。
     */
    reset() {
        this._mergeKey = null;
        this._mergeAt = 0;
        this.manager.clear();
        this.manager.add(editor.serializeProject());
        this._syncFlags();
    }

    /**
     * 提交一个历史快照。
     * @param {string} [mergeKey] 相同 key 且在 MERGE_WINDOW 内的连续提交会替换栈顶
     *   （合并），用于 Slider 拖拽、颜色调整等高频操作；不传 key 视为离散操作，总是新增一步。
     */
    commit(mergeKey) {
        const now = Date.now();
        const mergeable =
            !!mergeKey &&
            mergeKey === this._mergeKey &&
            now - this._mergeAt < MERGE_WINDOW &&
            this.manager.count > 0;
        if (mergeable) {
            this.manager.replaceTop(editor.serializeProject());
        } else {
            this.manager.add(editor.serializeProject());
            this._mergeKey = mergeKey || null;
        }
        this._mergeAt = now;
        this._syncFlags();
    }

    undo() {
        if (!this.manager.canUndo) return;
        this.manager.undo();
        editor.restoreProject(this.manager.current);
        // undo/redo 后禁止与上一次操作合并，保证后续编辑是新的一步
        this._mergeKey = null;
        this._syncFlags();
    }

    redo() {
        if (!this.manager.canRedo) return;
        this.manager.redo();
        editor.restoreProject(this.manager.current);
        this._mergeKey = null;
        this._syncFlags();
    }
}

const history = new History();
export default history;
