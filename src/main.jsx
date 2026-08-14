import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import stores from './stores';
import baseSnapshot from './stores/baseSnapshot';
import draftService from './stores/draftService';
import draftStore from './stores/draftStore';
import assetStore from './stores/assetStore';

// 仅开发服务器暴露 store/服务句柄，供端到端测试读取序列化/历史/快照/草稿状态。
// 生产构建（import.meta.env.DEV=false）会被 tree-shake 移除，不影响导出。
if (import.meta.env.DEV) {
    window.__shoteasyStores = stores;
    window.__shoteasyBaseSnapshot = baseSnapshot;
    window.__shoteasyDraftService = draftService;
    window.__shoteasyDraftStore = draftStore;
    window.__shoteasyAssetStore = assetStore;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 独立站启用本地草稿自动恢复（M6.7）；库模式默认 persistence=false，不访问 IndexedDB */}
        <App persistence={{ key: 'shoteasy-default', autoRestore: true }} />
    </React.StrictMode>
);
