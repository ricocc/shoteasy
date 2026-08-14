import { reaction } from 'mobx';
import editor from './editor';
import assetStore from './assetStore';
import history from './history';
import draftStore from './draftStore';
import { validateDocument } from '@utils/projectDocument';

const AUTOSAVE_DEBOUNCE = 750;

const makeError = (code, message, extra = {}) => Object.assign(new Error(message || code), { code, ...extra });

/**
 * 草稿编排服务（M6）。
 *
 * 这个服务只在 App 明确传入 persistence 时启动。保存任务按顺序执行，且每个
 * 异步任务都带有 setup/clear 代际号，避免换 key、清空或卸载后旧任务回写项目。
 */
class DraftService {
    constructor() {
        this.config = null;          // { key, autoRestore }
        this._disposer = null;
        this._saveTimer = null;
        this._saveChain = Promise.resolve();
        this._autosaveEnabled = true;
        this._blockedImageSrc = null;
        this._restoring = false;
        this._restorePromise = null;
        this._generation = 0;
    }

    isEnabled() { return !!this.config; }
    getKey() { return this.config?.key || null; }

    _isCurrent(key, generation) {
        return this.config?.key === key && this._generation === generation;
    }

    /** 登记配置并启动自动保存。config 为 false/undefined 时禁用。 */
    setup(config) {
        this.teardown();
        this._autosaveEnabled = true;
        this._blockedImageSrc = null;
        const key = typeof config?.key === 'string' ? config.key.trim() : '';
        this.config = key
            ? { key, autoRestore: config.autoRestore !== false }
            : null;
        if (!this.config) return;

        // 注册清空钩子：用户删除截图时删除草稿与归属资源（M6.10）。
        editor.setClearDraftHook(() => { this.clear(); });
        this._disposer = reaction(
            // 项目数据签名：视图缩放、主题和面板状态不进入保存触发条件。
            () => JSON.stringify({ p: editor.serializeProject(), src: editor.img?.src || '' }),
            () => this._scheduleSave(),
            { fireImmediately: false }
        );
    }

    /** 关闭自动保存并释放反应与定时器；不删除已存草稿（M6.11）。 */
    teardown() {
        this._generation += 1;
        if (this._disposer) { this._disposer(); this._disposer = null; }
        if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
        editor.setClearDraftHook(null);
        this.config = null;
        // 旧恢复任务会在下一次 await 后通过代际校验放弃，不再写入 store。
        this._restorePromise = null;
    }

    _scheduleSave() {
        if (!this.config || !this._autosaveEnabled || this._restoring) return;
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this._enqueueSave();
        }, AUTOSAVE_DEBOUNCE);
    }

    _enqueueSave() {
        const task = this._saveChain
            .catch(() => {})
            .then(() => this._save())
            .catch((err) => this._handleSaveError(err));
        this._saveChain = task.catch(() => {});
        return task;
    }

    /** 立即保存（跳过防抖）；供验证或宿主主动 flush 使用。 */
    async flush() {
        if (!this.config) return false;
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        await this._enqueueSave();
        return true;
    }

    async _save() {
        if (!this.config || !this._autosaveEnabled || this._restoring) return;
        const key = this.config.key;
        const generation = this._generation;
        const image = { ...(editor.img || {}) };
        if (!image.src || this._blockedImageSrc === image.src) return;

        const doc = editor.serializeProject();
        const imageBlob = await this._srcToBlob(image.src);
        if (!imageBlob) {
            throw makeError('image-blob-unavailable', 'image blob unavailable', { src: image.src });
        }
        if (!this._isCurrent(key, generation)) return;

        // 1) 主图 Blob 先写入 assets。
        const imageAssetId = `image:${key}`;
        await draftStore.saveAsset(imageAssetId, key, {
            blob: imageBlob,
            purpose: 'image',
            name: image.name,
            type: image.type || imageBlob.type,
        });
        if (!this._isCurrent(key, generation)) return;
        doc.image = {
            assetId: imageAssetId,
            width: image.width,
            height: image.height,
            type: image.type || imageBlob.type,
            name: image.name,
        };

        // 2) 项目引用的背景 Blob 先写入 assets。
        const backgroundAssetId = doc.option?.backgroundAssetId;
        if (backgroundAssetId) {
            const background = assetStore.get(backgroundAssetId);
            if (!background?.blob) {
                throw makeError('background-asset-missing', 'background asset missing');
            }
            await draftStore.saveAsset(backgroundAssetId, key, {
                blob: background.blob,
                purpose: 'background',
                name: background.name,
                type: background.type,
            });
            if (!this._isCurrent(key, generation)) return;
        }

        // 3) 只有关联 assets 全部成功后才写 ProjectDocument。
        await draftStore.saveProject(key, doc);
    }

    /** 把 img.src（blob:/data:/http:）统一转 Blob；失败由调用方降级。 */
    async _srcToBlob(src) {
        if (!src || typeof fetch === 'undefined') return null;
        try {
            const response = await fetch(src);
            if (!response.ok) return null;
            const blob = await response.blob();
            return blob && blob.size > 0 ? blob : null;
        } catch (e) {
            return null;
        }
    }

    _handleSaveError(err) {
        const code = err?.code || '';
        const text = String(err?.name || err?.message || err || '');
        if (code === 'image-blob-unavailable') {
            // 同一个无法 fetch 的远程地址不重复触发网络请求；换图后会自动重试。
            this._blockedImageSrc = err.src || null;
            editor.message?.warning?.('当前图片无法保存草稿，编辑和导出仍可继续');
        } else if (code === 'background-asset-missing') {
            this._autosaveEnabled = false;
            editor.message?.warning?.('背景资源缺失，已停止自动保存，编辑和导出仍可继续');
        } else if (/quota/i.test(text)) {
            this._autosaveEnabled = false;
            editor.message?.warning?.('存储空间不足，已停止自动保存，本次编辑仍可继续');
        } else if (/unavailable|blocked|open-failed|security|invalidstate/i.test(text)) {
            this._autosaveEnabled = false;
            // IndexedDB 不可用时静默降级，不阻断编辑、导出或组件渲染。
        }
    }

    /**
     * 恢复草稿。同一挂载周期内只允许一个恢复任务，避免 React StrictMode
     * 的重复 effect 创建多份 object URL 或互相覆盖。
     */
    restore() {
        if (!this.config || !this.config.autoRestore) return Promise.resolve(false);
        if (!draftStore.isAvailable() || editor.img?.src) return Promise.resolve(false);
        if (this._restorePromise) return this._restorePromise;
        const key = this.config.key;
        const generation = this._generation;
        const task = this._runRestore(key, generation);
        const wrapped = task.finally(() => {
            if (this._restorePromise === wrapped) this._restorePromise = null;
        });
        this._restorePromise = wrapped;
        return wrapped;
    }

    async _runRestore(key, generation) {
        let imageUrl = null;
        let backgroundRestored = null;
        let committed = false;
        try {
            const raw = await draftStore.loadProject(key);
            if (!this._isCurrent(key, generation) || editor.img?.src || !raw) return false;
            const { ok, doc: valid } = validateDocument(raw);
            if (!ok || !valid) {
                editor.message?.warning?.('草稿数据已损坏或版本不受支持，已忽略');
                return false;
            }
            if (!valid.image?.assetId) return false;

            const imageRecord = await draftStore.loadAsset(valid.image.assetId);
            if (!imageRecord?.blob) {
                editor.message?.info?.('草稿原图资源缺失，无法恢复');
                return false;
            }
            if (!this._isCurrent(key, generation) || editor.img?.src) return false;

            const backgroundAssetId = valid.option?.backgroundAssetId;
            if (backgroundAssetId) {
                const backgroundRecord = await draftStore.loadAsset(backgroundAssetId);
                if (!backgroundRecord?.blob) {
                    editor.message?.info?.('草稿背景资源缺失，无法恢复');
                    return false;
                }
                backgroundRestored = assetStore.restore(backgroundAssetId, backgroundRecord.blob, {
                    name: backgroundRecord.name,
                    type: backgroundRecord.type,
                });
                if (!backgroundRestored) {
                    editor.message?.info?.('草稿背景资源无法加载，无法恢复');
                    return false;
                }
            }

            imageUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                ? URL.createObjectURL(imageRecord.blob)
                : null;
            if (!imageUrl || !this._isCurrent(key, generation) || editor.img?.src) return false;

            this._restoring = true;
            editor.setImg({
                src: imageUrl,
                width: valid.image.width,
                height: valid.image.height,
                type: valid.image.type || imageRecord.type,
                name: valid.image.name || imageRecord.name,
            });
            if (!this._isCurrent(key, generation)) return false;
            editor.restoreProject(valid);
            history.reset();
            committed = true;
            return true;
        } catch (err) {
            // IndexedDB 不可用或瞬时错误：保持初始页，继续允许编辑/导出。
            return false;
        } finally {
            if (this._generation === generation) this._restoring = false;
            if (!committed) {
                if (imageUrl && editor.img?.src === imageUrl) editor.setImg({});
                else if (imageUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(imageUrl);
                if (backgroundRestored) assetStore.release(backgroundRestored.id);
            }
        }
    }

    /** 清空当前项目：删除该 key 的 project 与归属 assets（M6.10）。 */
    async clear() {
        if (!this.config) return false;
        const key = this.config.key;
        this._generation += 1;
        this._blockedImageSrc = null;
        if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
        try {
            // 先让已经排队的旧保存任务结束；代际号已变化，它们不会再写 project。
            await this._saveChain.catch(() => {});
            await draftStore.deleteProject(key);
            await draftStore.deleteAssetsByKey(key);
            return true;
        } catch (err) {
            return false;
        }
    }
}

const draftService = new DraftService();
export default draftService;
