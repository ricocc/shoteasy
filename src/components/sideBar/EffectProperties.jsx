import { observer } from 'mobx-react-lite';
import { Slider } from 'antd';
import ColorPicker from '@components/ColorPicker';
import stores from '@stores';

/**
 * 区域效果属性面板（M5.9/M5.10/M5.11）。
 *
 * 仅在单选一个区域效果（模糊/马赛克/聚光）标注时由 RightInspector 渲染。
 * 桌面右栏与移动端抽屉共用，故移动端也可直接调整效果参数。
 *
 * 连续交互（slider 拖动）不立即入历史，在 onChangeComplete 时统一 commit。
 */
const EffectProperties = observer(() => {
    const shape = stores.editor.selectedEffectShape;
    if (!shape) return null;
    const eff = shape.effect || {};
    const commit = () => stores.history.commit('effect');

    return (
        <>
            {shape.type === 'blur' && (
                <div className="pb-3">
                    <label>模糊强度</label>
                    <Slider
                        min={1}
                        max={40}
                        value={eff.strength ?? 8}
                        onChange={(v) => stores.editor.setEffectStyle({ strength: v })}
                        onChangeComplete={commit}
                    />
                </div>
            )}
            {shape.type === 'mosaic' && (
                <div className="pb-3">
                    <label>马赛克块大小</label>
                    <Slider
                        min={4}
                        max={48}
                        value={eff.blockSize ?? 12}
                        onChange={(v) => stores.editor.setEffectStyle({ blockSize: v })}
                        onChangeComplete={commit}
                    />
                </div>
            )}
            {shape.type === 'spotlight' && (
                <>
                    <div className="pb-3">
                        <label>遮罩颜色</label>
                        <div className="py-1">
                            <ColorPicker
                                value={eff.overlayColor ?? '#000000'}
                                onChange={(e) => stores.editor.setEffectStyle({ overlayColor: e.toHexString() })}
                                size="small"
                            />
                        </div>
                    </div>
                    <div className="pb-3">
                        <label>不透明度</label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.05}
                            value={eff.opacity ?? 0.5}
                            onChange={(v) => stores.editor.setEffectStyle({ opacity: v })}
                            onChangeComplete={commit}
                        />
                    </div>
                </>
            )}
            <div className="pb-3">
                <label>圆角</label>
                <Slider
                    min={0}
                    max={60}
                    value={eff.cornerRadius ?? 0}
                    onChange={(v) => stores.editor.setEffectStyle({ cornerRadius: v })}
                    onChangeComplete={commit}
                />
            </div>
        </>
    );
});

export default EffectProperties;
