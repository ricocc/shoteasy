import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Dropdown, Tooltip } from 'antd';
import stores from '@stores';

const items = [
    { key: 0.25, label: '25%' },
    { key: 0.5, label: '50%' },
    { key: 1, label: '100%' },
    { key: 1.5, label: '150%' },
    { key: 2, label: '200%' },
    { key: 3, label: '300%' },
    { key: 5, label: '500%' },
];

// 初始页缩放：无 Leafer 画布，直接缩放初始画布卡（CSS transform），25%–400%
const INIT_SCALE_STEP = 1.25;
const clampInitScale = (value) => Math.max(0.25, Math.min(4, value));

export default observer(function Zoom() {
    const hasApp = () => Boolean(stores.editor.app);
    const handleZoom = (key) => {
        if (!hasApp()) {
            const next = clampInitScale((stores.editor.scale / 100) * (key === 'in' ? INIT_SCALE_STEP : 1 / INIT_SCALE_STEP));
            stores.editor.setScale(next);
            return;
        }
        stores.editor.app.tree.zoom(key);
        stores.editor.setScale(stores.editor.app.tree.scale);
    };
    const handleMenuClick = (item) => {
        const num = Number(item.key);
        if (!hasApp()) {
            // 4 = 适应画布：初始卡的基础尺寸即适应尺寸，回到 100%
            stores.editor.setScale(num === 4 ? 1 : num);
            return;
        }
        if (num === 4) {
            stores.editor.app.tree.zoom('fit', 100);
        } else {
            stores.editor.app.tree.zoom(num);
        }
        stores.editor.setScale(stores.editor.app.tree.scale);
    };

    return (
        <div className="shoteasy-zoom-controls">
            <div className="shoteasy-zoom-controls__group">
                <Tooltip placement="top" arrow={false} title="放大">
                    <Button type="text" aria-label="放大" icon={<Icon.ZoomIn size={16} />} onClick={() => handleZoom('in')} />
                </Tooltip>
                <Dropdown menu={{ items, onClick: handleMenuClick }} placement="top">
                    <Button type="text" className="shoteasy-zoom-value" aria-label="选择缩放比例">
                        {stores.editor.scale}%
                    </Button>
                </Dropdown>
                <Tooltip placement="top" arrow={false} title="缩小">
                    <Button type="text" aria-label="缩小" icon={<Icon.ZoomOut size={16} />} onClick={() => handleZoom('out')} />
                </Tooltip>
            </div>
            <Tooltip placement="top" arrow={false} title="适应画布">
                <Button
                    type="text"
                    className="shoteasy-zoom-controls__fit"
                    aria-label="适应画布"
                    icon={<Icon.Maximize size={16} />}
                    onClick={() => handleMenuClick({ key: 4 })}
                />
            </Tooltip>
        </div>
    );
});
