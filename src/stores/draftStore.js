/**
 * IndexedDB 草稿存储（M6.1–M6.5）。
 *
 * 纯 Promise 封装，不持有 MobX 可观察状态。数据库名 `shoteasy`，版本从 1 开始：
 *   - `projects` 仓库：keyPath='key'，记录 { key, doc, updatedAt }，doc 为 ProjectDocument。
 *   - `assets` 仓库：keyPath='id'，记录 { id, key, blob, type, name, purpose, createdAt }，
 *     存原图（purpose='image'）与上传背景（purpose='background'）的 Blob。
 *
 * 多个 persistence key 共用一个数据库但互不干扰：projects 以 key 隔离，assets 以 key 字段归属，
 * 清空某 key 时只删该 key 的 project 与归属 assets。
 *
 * 异常策略：IndexedDB 不可用（无 API / 打开失败 / 被阻塞）时标记 unavailable 并在后续调用直接 reject，
 * 由 draftService 降级为「无草稿模式」，不影响编辑与导出（technical-design「IndexedDB 草稿·异常处理」）。
 */

const DB_NAME = 'shoteasy';
const DB_VERSION = 1;
const PROJECTS = 'projects';
const ASSETS = 'assets';

class DraftStore {
    constructor() {
        this._dbPromise = null;
        this._unavailable = false; // 一旦确认不可用，避免重复尝试打开
    }

    /** IndexedDB 是否可用（供 draftService 降级判断）。 */
    isAvailable() {
        return !this._unavailable && typeof indexedDB !== 'undefined';
    }

    _open() {
        if (this._unavailable) return Promise.reject(new Error('idb-unavailable'));
        if (this._dbPromise) return this._dbPromise;
        this._dbPromise = new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                this._unavailable = true;
                reject(new Error('idb-unavailable'));
                return;
            }
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: 'key' });
                if (!db.objectStoreNames.contains(ASSETS)) db.createObjectStore(ASSETS, { keyPath: 'id' });
            };
            req.onsuccess = () => {
                const db = req.result;
                db.onversionchange = () => {
                    db.close();
                    this._dbPromise = null;
                };
                resolve(db);
            };
            req.onerror = () => reject(req.error || new Error('idb-open-failed'));
            req.onblocked = () => reject(new Error('idb-blocked'));
        }).catch((err) => {
            // 打开失败视为不可用，清空缓存以便降级；不在此处提示，由 service 决定
            this._unavailable = true;
            this._dbPromise = null;
            throw err;
        });
        return this._dbPromise;
    }

    _transaction(storeName, mode, operation) {
        return this._open().then((db) => new Promise((resolve, reject) => {
            let tx;
            let result;
            let settled = false;
            const fail = (error) => {
                if (settled) return;
                settled = true;
                reject(error || new Error('idb-transaction-failed'));
                try { tx?.abort(); } catch (e) { /* transaction may already be inactive */ }
            };
            try {
                tx = db.transaction(storeName, mode);
                tx.oncomplete = () => {
                    if (settled) return;
                    settled = true;
                    resolve(result);
                };
                tx.onerror = () => fail(tx.error || new Error('idb-transaction-failed'));
                tx.onabort = () => fail(tx.error || new Error('idb-transaction-aborted'));
                Promise.resolve(operation(tx.objectStore(storeName)))
                    .then((value) => { result = value; })
                    .catch(fail);
            } catch (error) {
                fail(error);
            }
        }));
    }

    _request(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('idb-request-failed'));
        });
    }

    /** 写入（或覆盖）一个项目的 ProjectDocument。 */
    async saveProject(key, doc) {
        await this._transaction(PROJECTS, 'readwrite', (store) =>
            this._request(store.put({ key, doc, updatedAt: Date.now() }))
        );
    }

    /** 读取一个项目的 ProjectDocument；不存在返回 null。 */
    async loadProject(key) {
        const rec = await this._transaction(PROJECTS, 'readonly', (store) => this._request(store.get(key)));
        return rec ? rec.doc : null;
    }

    /** 删除一个项目。 */
    async deleteProject(key) {
        await this._transaction(PROJECTS, 'readwrite', (store) => this._request(store.delete(key)));
    }

    /** 写入（或覆盖）一个资源 Blob。payload = { blob, type, name, purpose }。 */
    async saveAsset(id, key, payload) {
        await this._transaction(ASSETS, 'readwrite', (store) => this._request(store.put({
            id, key,
            blob: payload.blob,
            type: payload.type || (payload.blob && payload.blob.type) || 'application/octet-stream',
            name: payload.name || 'asset',
            purpose: payload.purpose || 'background',
            createdAt: Date.now()
        })));
    }

    /** 读取一个资源记录 { blob, type, name, purpose }；不存在返回 null。 */
    async loadAsset(id) {
        return this._transaction(ASSETS, 'readonly', (store) => this._request(store.get(id)));
    }

    /** 删除一个资源。 */
    async deleteAsset(id) {
        await this._transaction(ASSETS, 'readwrite', (store) => this._request(store.delete(id)));
    }

    /** 删除归属某 key 的全部资源（清空项目时清理孤立资源）。 */
    async deleteAssetsByKey(key) {
        await this._transaction(ASSETS, 'readwrite', (store) => new Promise((resolve, reject) => {
            const cursorReq = store.openCursor();
            cursorReq.onsuccess = () => {
                const cursor = cursorReq.result;
                if (!cursor) return resolve();
                if (cursor.value && cursor.value.key === key) cursor.delete();
                cursor.continue();
            };
            cursorReq.onerror = () => reject(cursorReq.error || new Error('idb-cursor-failed'));
        }));
    }
}

const draftStore = new DraftStore();
export default draftStore;
