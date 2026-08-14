import { Button, Drawer, Segmented, Slider } from 'antd';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import ColorPicker from '@components/ColorPicker';
import stores from '@stores';
import assetStore from '@stores/assetStore';
import colorSvg from '@assets/color.svg';
import { BackgroundSelect } from './BackgroundSelect';
import { getBackgroundDefinition } from '@utils/backgroundConfig';

const BACKGROUND_POSITIONS = [
    ['top-left', '左上'], ['top', '上'], ['top-right', '右上'],
    ['left', '左'], ['center', '居中'], ['right', '右'],
    ['bottom-left', '左下'], ['bottom', '下'], ['bottom-right', '右下'],
];

export default observer(({ showMore, onChange }) => {
    const onMoreClose = () => {
        onChange(false);
    }
    const handleCustom = (e) => {
        const color = e.toHexString();
        stores.option.setCustomSolidBackground(color);
    }
    const handleUpload = (event) => {
        const file = event.target.files?.[0];
        if (file?.type?.startsWith('image/')) {
            const asset = assetStore.add(file);
            if (asset) stores.option.setUploadedBackground(asset);
        }
        event.target.value = '';
    };
    const onSelectChange = (key) => {
        // 内置图片背景先下载为 Blob 再应用（M4.10）；失败时保留原背景并提示（M4.14）
        stores.option.applyBackground(key).catch(() => {
            stores.editor.message.error('背景加载失败，请重试');
        });
    }
    const backgroundDefinition = getBackgroundDefinition(stores.option.background);
    const isImageBackground = backgroundDefinition?.type === 'builtin-image' || backgroundDefinition?.type === 'upload-image';
    return (
        <Drawer
            title=""
            placement="right"
            closable={false}
            mask={false}
            onClose={onMoreClose}
            open={showMore}
            getContainer={false}
            width="100%"
            className="[&_.ant-drawer-body]:p-0"
        >
            <div className="shoteasy-background-drawer flex flex-col gap-2 h-full overflow-hidden">
                <div className="shrink-0 pt-4 px-4">
                    <Button
                        type="text"
                        size="small"
                        className="text-xs flex items-center opacity-80 m-0"
                        icon={<Icon.ChevronRight size={16} />}
                        iconPosition="end"
                        onClick={() => onChange(false)}
                    >返回</Button>
                </div>
                <div className="h-0 flex-1 overflow-y-auto px-4 py-2">
                    <h4 className="text-sm font-bold py-2">自定义</h4>
                    <div className="py-1">
                        <ColorPicker onChange={handleCustom}>
                        <Button type="default" size="small" shape="circle" aria-label="自定义背景颜色" icon={<img src={colorSvg} width={18} alt="" />} />
                        </ColorPicker>
                    </div>
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-2 py-1 text-xs">
                        上传本地图片
                        <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
                    </label>
                    {isImageBackground && (
                        <div className="border-y border-slate-200/70 py-2">
                            <h4 className="text-sm font-bold py-2">图片背景</h4>
                            <Segmented
                                block
                                size="small"
                                value={stores.option.backgroundMode}
                                onChange={(value) => stores.option.setBackgroundMode(value)}
                                options={[
                                    { label: '覆盖', value: 'cover' },
                                    { label: '包含', value: 'fit' },
                                    { label: '拉伸', value: 'stretch' },
                                ]}
                            />
                            <div className="grid grid-cols-3 gap-1 pt-2" aria-label="背景位置">
                                {BACKGROUND_POSITIONS.map(([value, label]) => (
                                    <Button
                                        key={value}
                                        type={stores.option.backgroundAlign === value ? 'primary' : 'default'}
                                        size="small"
                                        className="h-7 px-1 text-xs"
                                        aria-pressed={stores.option.backgroundAlign === value}
                                        onClick={() => stores.option.setBackgroundAlign(value)}
                                    >{label}</Button>
                                ))}
                            </div>
                        </div>
                    )}
                    <h4 className="text-sm font-bold py-2">背景效果</h4>
                    <div className="pb-3">
                        <div className="flex items-center justify-between">
                            <label>模糊</label>
                            <span className="text-xs text-gray-500">{Math.round(stores.option.backgroundBlur)}px</span>
                        </div>
                        <Slider min={0} max={30} value={stores.option.backgroundBlur} onChange={(v) => stores.option.setBackgroundBlur(v)} />
                    </div>
                    <div className="pb-3">
                        <div className="flex items-center justify-between">
                            <label>遮罩</label>
                            <ColorPicker value={stores.option.backgroundMaskColor} onChange={(e) => stores.option.setBackgroundMaskColor(e.toHexString())} size="small" />
                        </div>
                        <Slider min={0} max={1} step={0.05} value={stores.option.backgroundMaskOpacity} onChange={(v) => stores.option.setBackgroundMaskOpacity(v)} />
                    </div>
                    <div className="pb-3">
                        <div className="flex items-center justify-between">
                            <label>噪点</label>
                            <span className="text-xs text-gray-500">{Math.round(stores.option.backgroundNoise * 100)}%</span>
                        </div>
                        <Slider min={0} max={1} step={0.05} value={stores.option.backgroundNoise} onChange={(v) => stores.option.setBackgroundNoise(v)} />
                    </div>
                    <h4 className="text-sm font-bold py-2">无背景</h4>
                    <BackgroundSelect type="none" onChange={onSelectChange} value={stores.option.background} />
                    <h4 className="text-sm font-bold py-2">纯色</h4>
                    <BackgroundSelect type="solid" onChange={onSelectChange} value={stores.option.background} />
                    <h4 className="text-sm font-bold py-2">渐变</h4>
                    <BackgroundSelect type="gradient" onChange={onSelectChange} value={stores.option.background} />
                    <h4 className="text-sm font-bold py-2">宇宙渐变</h4>
                    <BackgroundSelect type="cosmic" onChange={onSelectChange} value={stores.option.background} />
                    <h4 className="text-sm font-bold py-2">桌面</h4>
                    <BackgroundSelect type="desktop" onChange={onSelectChange} value={stores.option.background} />
                </div>
            </div>
        </Drawer>
    )
});
