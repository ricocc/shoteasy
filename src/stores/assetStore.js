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
        };
        this.assets.set(id, asset);
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
