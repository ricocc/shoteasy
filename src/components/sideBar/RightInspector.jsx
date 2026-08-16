import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Slider, Radio, Segmented, InputNumber, Switch } from 'antd';
import ColorPicker from '@components/ColorPicker';
import stores from '@stores';
import backgroundConfig from '@utils/backgroundConfig';
import { cn } from '@utils/utils';
import { isDeviceFrame } from '@utils/frameConfig';
import CropperImage from './CropperImage';
import Position from './Position';
import Watermark from './Watermark';
import DrawerBar from './DrawerBar';
import TextProperties from './TextProperties';
import EffectProperties from './EffectProperties';

/** 可折叠分组。 */
function Section({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    const sectionId = `inspector-${title.replace(/[^\w]+/g, '-').toLowerCase()}`;
    return (
        <section className="shoteasy-inspector-section">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="shoteasy-inspector-section__trigger"
                aria-expanded={open}
                aria-controls={sectionId}
            >
                <span>{title}</span>
                <Icon.ChevronDown size={16} className={cn("transition-transform", !open && "-rotate-90")} />
            </button>
            {open && <div id={sectionId} className="shoteasy-inspector-section__body [&_label]:font-semibold [&_label]:text-sm">{children}</div>}
        </section>
    );
}

/**
 * 滑杆 + 手动输入组合行：label 左、InputNumber 右、Slider 占满下方。
 * 滑杆受 max 限制，输入框可用 inputMax 放开更大的手动写入范围。
 */
function SliderRow({ label, min, max, step = 1, value, onChange, inputMax, inputMin, extra, disabled }) {
    return (
        <div className="pb-3">
            <div className="flex justify-between items-center gap-2">
                <label>{label}</label>
                <div className="flex items-center gap-2">
                    {extra}
                    <InputNumber
                        size="small"
                        min={inputMin ?? min}
                        max={inputMax ?? max}
                        step={step}
                        value={typeof value === 'number' ? value : min}
                        disabled={disabled}
                        onChange={(v) => onChange(Number.isFinite(v) ? v : (inputMin ?? min))}
                        className="w-[64px]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                        aria-label={`${label}数值`}
                    />
                </div>
            </div>
            <Slider
                min={min}
                max={max}
                step={step}
                value={typeof value === 'number' ? value : min}
                onChange={onChange}
                disabled={disabled}
                className="ml-0 mr-1"
            />
        </div>
    );
}

/** 阴影等紧凑数值字段：小标签 + 手动输入，两列网格排布。 */
function ShadowField({ label, value, min, max, onChange }) {
    return (
        <label className="flex items-center justify-between gap-1 py-1">
            <span className="text-xs text-[var(--se-muted)]">{label}</span>
            <InputNumber
                size="small"
                min={min}
                max={max}
                value={value}
                onChange={(v) => onChange(Number.isFinite(v) ? v : min)}
                className="w-[68px]"
                style={{ fontFamily: 'var(--font-mono)' }}
                aria-label={label}
            />
        </label>
    );
}

/**
 * 右侧检查器内容（M2.7）。桌面右栏与移动端抽屉共用。
 * 四个分组：背景 / 图片 / 边框·阴影 / 水印·HDR。
 * 背景的「更多」(DrawerBar) 沿用 getContainer=false 内联抽屉，挂在 relative 祖先上。
 */
export const InspectorContent = observer(() => {
    const [showMore, setShowMore] = useState(false);
    const onBgChange = (e) => stores.option.setBackground(e.target.value);
    const deviceFrame = isDeviceFrame(stores.option.frame);
    return (
        <div className="shoteasy-inspector relative h-full flex flex-col">
            <div className="shoteasy-inspector__scroll flex-1 overflow-y-auto overflow-x-hidden px-4">
                {/* 文字（仅单选文字标注时出现，桌面右栏与移动端抽屉共用） */}
                {stores.editor.selectedTextShape && (
                    <Section title="文字">
                        <TextProperties />
                    </Section>
                )}

                {/* 区域效果（仅单选模糊/马赛克/聚光标注时出现） */}
                {stores.editor.selectedEffectShape && (
                    <Section title="区域效果">
                        <EffectProperties />
                    </Section>
                )}

                {/* 背景 */}
                <Section title="背景">
                    <div className="flex justify-between items-center">
                        <label>预设</label>
                        <Button
                            type="text"
                            size="small"
                            className="text-xs flex items-center opacity-80 m-0"
                            onClick={() => setShowMore(true)}
                        >更多 <Icon.ChevronRight size={16} /></Button>
                    </div>
                    <div className="py-3">
                        <Radio.Group
                            onChange={onBgChange}
                            value={stores.option.background}
                            rootClassName="grid grid-cols-7 [&_span]:ps-0"
                        >
                            <Radio className="[&_.ant-radio]:hidden [&_span]:p-0 mr-0" value="none">
                                <div className={cn("w-8 h-8 rounded-full", backgroundConfig.none.class)} title="无背景"></div>
                            </Radio>
                            <Radio className="[&_.ant-radio]:hidden [&_span]:p-0 mr-0" value='default_1'>
                                <div className={cn("w-8 h-8 rounded-full", backgroundConfig.default_1.class)}></div>
                            </Radio>
                            {Object.keys(backgroundConfig).map((key) => {
                                if (key.includes('default') && key !== 'default_1') return (
                                    <Radio key={key} className="[&_.ant-radio]:hidden [&_span]:p-0 mr-0" value={key}>
                                        <div className={cn("w-8 h-8 rounded-full", backgroundConfig[key].class)}></div>
                                    </Radio>
                                );
                                return null;
                            })}
                        </Radio.Group>
                    </div>
                </Section>

                {/* 图片 */}
                <Section title="图片">
                    <div className="pb-3">
                        <label>快速</label>
                        <div className="flex gap-3 items-center py-2">
                            <CropperImage />
                            <Button type="text" shape="circle" aria-label="水平翻转" onClick={() => stores.option.toggleFlip('x')} icon={<Icon.FlipHorizontal2 size={18} />} />
                            <Button type="text" shape="circle" aria-label="垂直翻转" onClick={() => stores.option.toggleFlip('y')} icon={<Icon.FlipVertical2 size={18} />} />
                            <Position />
                        </div>
                    </div>
                    <div className="pb-3">
                        <label>缩放</label>
                        <Slider
                            min={0.1}
                            max={3}
                            step={0.1}
                            onChange={(e) => stores.option.setScale(e)}
                            value={typeof stores.option.scale === 'number' ? stores.option.scale : 1}
                        />
                    </div>
                    <div className="pb-1">
                        <SliderRow
                            label="内边距"
                            min={0}
                            max={200}
                            value={stores.option.padding}
                            onChange={(e) => stores.option.setPadding(e)}
                            inputMax={500}
                            extra={<ColorPicker value={stores.option.paddingBg} onChange={(e) => stores.option.setPaddingBg(e.toRgbString())} size="small" aria-label="内边距颜色" />}
                        />
                    </div>
                    <div className="pb-3">
                        <div className="flex items-center justify-between">
                            <label>旋转</label>
                            <span className="text-xs text-gray-500">{stores.option.rotation}°</span>
                        </div>
                        <Slider
                            min={-180}
                            max={180}
                            step={1}
                            onChange={(value) => stores.option.setRotation(value)}
                            value={stores.option.rotation}
                        />
                    </div>
                </Section>

                {/* 边框·阴影 */}
                <Section title="边框 · 阴影">
                    {deviceFrame && (
                        <div className="pb-3">
                            <label>图片填充</label>
                            <div className="py-1">
                                <Segmented
                                    block
                                    size="small"
                                    value={stores.option.frameMode}
                                    onChange={(v) => stores.option.setFrameMode(v)}
                                    options={[
                                        { label: '覆盖', value: 'cover' },
                                        { label: '包含', value: 'fit' },
                                        { label: '拉伸', value: 'strench' },
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                    <div className="pb-1">
                        <SliderRow
                            label="圆角"
                            min={0}
                            max={100}
                            value={stores.option.round}
                            onChange={(e) => stores.option.setRound(e)}
                            inputMax={999}
                        />
                    </div>
                    <div className="pb-3">
                        <div className="flex justify-between items-center gap-2">
                            <label>阴影</label>
                            <div className="flex items-center gap-2">
                                <ColorPicker
                                    value={stores.option.shadow?.color}
                                    onChange={(e) => stores.option.setShadowConf({ color: e.toRgbString() })}
                                    size="small"
                                    disabled={!stores.option.shadow?.visible}
                                    aria-label="阴影颜色"
                                />
                                <Switch
                                    size="small"
                                    checked={!!stores.option.shadow?.visible}
                                    onChange={(v) => stores.option.setShadowConf({ visible: v })}
                                    aria-label="启用阴影"
                                />
                            </div>
                        </div>
                        {stores.option.shadow?.visible && (
                            <div className="grid grid-cols-2 gap-x-3 pt-1">
                                <ShadowField label="偏移 X" min={-200} max={200} value={stores.option.shadow.x} onChange={(v) => stores.option.setShadowConf({ x: v })} />
                                <ShadowField label="偏移 Y" min={-200} max={200} value={stores.option.shadow.y} onChange={(v) => stores.option.setShadowConf({ y: v })} />
                                <ShadowField label="模糊" min={0} max={400} value={stores.option.shadow.blur} onChange={(v) => stores.option.setShadowConf({ blur: v })} />
                                <ShadowField label="扩展" min={-100} max={200} value={stores.option.shadow.spread} onChange={(v) => stores.option.setShadowConf({ spread: v })} />
                            </div>
                        )}
                    </div>
                </Section>

                {/* 水印·HDR */}
                <Section title="水印 · HDR" defaultOpen={false}>
                    <Watermark />
                </Section>
            </div>
            <DrawerBar showMore={showMore} onChange={setShowMore} />
        </div>
    );
});

/**
 * 桌面右栏。仅 lg 以上显示；平板/手机由 TopBar 抽屉提供。
 */
const RightInspector = observer(() => (
    <div className="shoteasy-right-inspector hidden lg:flex relative shrink-0 overflow-hidden flex-col">
        <InspectorContent />
    </div>
));

export default RightInspector;
