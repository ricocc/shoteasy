import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip, Divider, Drawer } from 'antd';
import Icon from '@components/Icon';
import stores from '@stores';
import DownloadBar from '@components/sideBar/DownloadBar';
import { LeftRailContent } from '@components/sideBar/LeftRail';
import { InspectorContent } from '@components/sideBar/RightInspector';
import Logo from './Logo';
import MediaLogo from './MediaLogo';

export default observer(function TopBar({ headLeft, headRight }) {
    const [mobileLeft, setMobileLeft] = useState(false);
    const [mobileInspector, setMobileInspector] = useState(false);

    const handleSetTheme = () => {
        stores.editor.setTheme();
        localStorage.setItem('SHOTEASY_BEAUTIFIER_THEME', stores.editor.theme);
    };

    return (
        <div className="shoteasy-topbar select-none">
            <div className="shoteasy-topbar__brand">
                {headLeft || <Logo />}
            </div>

            <Divider type="vertical" className="shoteasy-topbar__divider" />

            <div className="shoteasy-history" aria-label="历史操作">
                <Tooltip placement="bottom" arrow={false} title="撤销">
                    <Button
                        type="text"
                        shape="circle"
                        className="shoteasy-icon-button"
                        aria-label="撤销"
                        disabled={!stores.history.canUndo}
                        icon={<Icon.Undo size={16} />}
                        onClick={() => stores.history.undo()}
                    />
                </Tooltip>
                <Tooltip placement="bottom" arrow={false} title="重做">
                    <Button
                        type="text"
                        shape="circle"
                        className="shoteasy-icon-button"
                        aria-label="重做"
                        disabled={!stores.history.canRedo}
                        icon={<Icon.Redo size={16} />}
                        onClick={() => stores.history.redo()}
                    />
                </Tooltip>
                <Tooltip placement="bottom" arrow={false} title="重置图片样式">
                    <Button
                        type="text"
                        shape="circle"
                        className="shoteasy-icon-button"
                        aria-label="重置图片样式"
                        disabled={!stores.editor.img?.src || stores.option.imageStyleIsDefault}
                        icon={<Icon.Reload size={16} />}
                        onClick={() => stores.option.resetImageStyle()}
                    />
                </Tooltip>
            </div>

            <div className="shoteasy-mobile-actions">
                <Divider type="vertical" className="shoteasy-topbar__divider" />
                <Tooltip placement="bottom" arrow={false} title="尺寸与外框">
                    <Button
                        type="text"
                        shape="circle"
                        className="shoteasy-icon-button"
                        aria-label="打开尺寸与外框"
                        icon={<Icon.LayoutGrid size={16} />}
                        onClick={() => setMobileLeft(true)}
                    />
                </Tooltip>
                <Tooltip placement="bottom" arrow={false} title="检查器">
                    <Button
                        type="text"
                        shape="circle"
                        className="shoteasy-icon-button"
                        aria-label="打开检查器"
                        icon={<Icon.Settings2 size={16} />}
                        onClick={() => setMobileInspector(true)}
                    />
                </Tooltip>
            </div>

            <div className="shoteasy-topbar__spacer" />
            <DownloadBar />
            <Divider type="vertical" className="shoteasy-topbar__divider shoteasy-topbar__divider--meta" />
            <div className="shoteasy-topbar__meta">
                {headRight || (
                    <MediaLogo>
                        <Tooltip placement="bottom" arrow={false} title="切换主题">
                            <Button
                                type="text"
                                shape="circle"
                                className="shoteasy-icon-button"
                                aria-label="切换主题"
                                icon={stores.editor.isDark ? <Icon.Moon size={16} /> : <Icon.Sun size={16} />}
                                onClick={handleSetTheme}
                            />
                        </Tooltip>
                    </MediaLogo>
                )}
            </div>

            <Drawer
                title="尺寸与外框"
                placement="left"
                open={mobileLeft}
                onClose={() => setMobileLeft(false)}
                width={300}
                styles={{ body: { padding: 12 } }}
            >
                <div className="relative h-full">
                    <LeftRailContent />
                </div>
            </Drawer>
            <Drawer
                title="检查器"
                placement="right"
                open={mobileInspector}
                onClose={() => setMobileInspector(false)}
                width={340}
                styles={{ body: { padding: 0 } }}
            >
                <InspectorContent />
            </Drawer>
        </div>
    );
});
