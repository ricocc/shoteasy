import { useMemo, useEffect } from 'react';
import { message } from 'antd';
import { observer } from 'mobx-react-lite';
import TopBar from '@components/header/TopBar';
import Editor from '@components/editor/Editor';
import LeftRail from '@components/sideBar/LeftRail';
import RightInspector from '@components/sideBar/RightInspector';
import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import Init from '@components/init/Init';
import stores from '@stores';
import useSetImg from '@hooks/useSetImg';
import draftService from '@stores/draftService';
import { cn } from '@utils/utils';
import '@style/main.css';

export default observer(({ defaultImg, headLeft, headRight, isDark, boxClassName = '', onClear, persistence = false }) => {
  const getFile = useSetImg(stores);
  const isEditing = !!stores.editor.img?.src;
  const workplace = isEditing ? <Editor /> : <Init />
  const [messageApi, contextHolder] = message.useMessage();
  stores.editor.setMessage(messageApi);
  stores.editor.setClearFun(onClear);
  useMemo(() => {
    // 独立站点默认深色；库模式下由父级 isDark 决定。
    // 仅当显式保存过 'light' 时才以浅色启动，避免反复闪烁。
    const stored = localStorage.getItem('SHOTEASY_BEAUTIFIER_THEME');
    const mode = isDark != null
      ? (isDark ? 'dark' : 'light')
      : (stored === 'light' ? 'light' : 'dark');
    stores.editor.setTheme(mode);
  }, [isDark]);
  useEffect(() => {
    if (defaultImg) getFile(defaultImg, 'dataURL');
  }, [defaultImg]);
  const persistenceKey = persistence && typeof persistence === 'object' ? persistence.key : null;
  const persistenceAutoRestore = persistence && typeof persistence === 'object'
    ? persistence.autoRestore !== false
    : false;
  // 草稿持久化（M6.6/M6.7）：登记配置 + 启动自动保存；卸载时只释放反应，不删草稿。
  // persistence 为 false/undefined 时 setup 直接禁用，不访问 IndexedDB（M6.15）。
  useEffect(() => {
    draftService.setup(persistenceKey ? { key: persistenceKey, autoRestore: persistenceAutoRestore } : false);
    return () => draftService.teardown();
  }, [persistenceKey, persistenceAutoRestore]);
  // 组件卸载时释放主图 object URL；Editor.destroy 不能承担该职责，因为
  // Leafer View effect 在 React StrictMode 下会经历一次模拟 cleanup。
  useEffect(() => {
    stores.editor.cancelScheduledImageRelease();
    return () => stores.editor.scheduleImageRelease();
  }, []);
  // 自动恢复（M6.7）：仅当启用 persistence.autoRestore 且未传 defaultImg 时尝试恢复。
  // defaultImg 存在时跳过恢复，由上面的 defaultImg effect 建立新项目（M6.8 优先级）。
  useEffect(() => {
    if (persistenceKey && persistenceAutoRestore && !defaultImg) {
      draftService.restore();
    }
    // defaultImg 只决定首次挂载时是否跳过恢复，后续变化不应再次触发恢复。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistenceKey, persistenceAutoRestore]);
  return (
    <StyleProvider>
      <ConfigProvider
        theme={{
          algorithm: stores.editor.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: stores.editor.isDark ? '#7180ff' : '#2563eb',
            borderRadius: 9,
            controlHeight: 34,
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          components: {
            Button: {
              controlHeight: 34,
              paddingInline: 12,
            },
            Segmented: {
              borderRadius: 8,
            },
          },
        }}
      >
        {contextHolder}
        <div id="shoteasy-container" className={cn("polka shoteasy-app flex flex-col overflow-hidden antialiased w-full h-[100vh]", boxClassName)} data-mode={stores.editor.isDark?'dark':'light'}>
          <TopBar headLeft={headLeft} headRight={headRight} />
          <div className="flex flex-row flex-1 h-0">
            {isEditing && <LeftRail />}
            {workplace}
            {isEditing && <RightInspector />}
          </div>
        </div>
      </ConfigProvider>
    </StyleProvider>
  )
});
