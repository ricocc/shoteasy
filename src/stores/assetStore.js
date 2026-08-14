import { makeAutoObservable } from 'mobx';

const createAssetId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

class AssetStore {
    assets = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    add(file) {
        if (typeof Blob === 'undefined' || !(file instanceof Blob) || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return null;
        const id = createAssetId();
        const asset = {
            id,
            url: URL.createObjectURL(file),
            name: file.name || 'background',
            type: file.type || 'application/octet-stream',
            size: file.size || 0,
            blob: file, // 保留原始 Blob 供草稿持久化（M6.5）；运行时只用 url
        };
        this.assets.set(id, asset);
        return asset;
    }

    /**
     * 从已持久化的 Blob 恢复一个运行时资源（M6.5 草稿恢复）：重建 object URL 并登记到内存 Map，
     * 使 option.backgroundAssetId → assetStore.get(id).url 解析路径在恢复后可用。
     * id 必须与草稿 doc 中引用的 assetId 一致。
     */
    restore(id, blob, meta = {}) {
        if (!id || !blob || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return null;
        // StrictMode 重复恢复或同一草稿重新载入时，先释放旧 URL，避免同一个 id 泄漏。
        if (this.assets.has(id)) this.release(id);
        const asset = {
            id,
            url: URL.createObjectURL(blob),
            name: meta.name || 'asset',
            type: meta.type || blob.type || 'application/octet-stream',
            size: meta.size != null ? meta.size : (blob.size || 0),
            blob,
        };
        this.assets.set(id, asset);
        return asset;
    }

    /**
     * 远程图片先下载为 Blob 再创建 object URL（M4.10/M4.14）。
     * 这样画布与导出使用同源 blob: URL，避免跨域 tainted canvas；
     * signal 用于取消被 newer 选择覆盖的旧请求。失败时抛错由调用方处理。
     */
    async addFromUrl(url, signal) {
        if (typeof fetch === 'undefined' || !url) throw new Error('no-url');
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`http-${response.status}`);
        const blob = await response.blob();
        if (!blob || (blob.type && !blob.type.startsWith('image/')) || blob.size === 0) {
            throw new Error('not-image');
        }
        const asset = this.add(blob);
        if (!asset) throw new Error('object-url-unavailable');
        return asset;
    }

    get(id) {
        return id ? this.assets.get(id) || null : null;
    }

    release(id) {
        const asset = this.get(id);
        if (!asset) return;
        if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(asset.url);
        this.assets.delete(id);
    }

    clear() {
        Array.from(this.assets.keys()).forEach((id) => this.release(id));
    }
}

export default new AssetStore();
