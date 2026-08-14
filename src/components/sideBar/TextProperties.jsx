import { observer } from 'mobx-react-lite';
import { Input, Slider, Segmented, Button } from 'antd';
import ColorPicker from '@components/ColorPicker';
import stores from '@stores';

/**
 * 文字标注属性面板（M5.6/M5.7/M5.8）。
 *
 * 仅在单选一个 text 标注时由 RightInspector 渲染。桌面右栏与移动端抽屉共用本组件，
 * 故移动端无需双击即可在此修改内容与样式（验收 N-43）。
 *
 * 内容/字号等连续交互不立即入历史，避免连续输入产生大量历史步；
 * 在交互结束（失焦 / onChangeComplete / 离散切换）时统一 stores.history.commit('text')。
 */
const TextProperties = observer(() => {
    const shape = stores.editor.selectedTextShape;
    if (!shape) return null;
    const ts = shape.textStyle || {};

    const commit = () => stores.history.commit('text:style');

    return (
        <>
            <div className="pb-3">
                <label>内容</label>
                <div className="py-2">
                    <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        value={shape.text}
                        onChange={(e) => stores.editor.setTextContent(e.target.value)}
                        onBlur={commit}
                        placeholder="输入文字"
                    />
                </div>
            </div>

            <div className="pb-3">
                <label>字号</label>
                <Slider
                    min={8}
                    max={96}
                    step={1}
                    value={ts.fontSize ?? 24}
                    onChange={(v) => stores.editor.setTextStyle({ fontSize: v })}
                    onChangeComplete={commit}
                />
            </div>

            <div className="pb-3">
                <label>粗细</label>
                <div className="py-2">
                    <Segmented
                        block
                        size="small"
                        value={ts.fontWeight ?? 'normal'}
                        onChange={(v) => { stores.editor.setTextStyle({ fontWeight: v }); commit(); }}
                        options={[{ label: '正常', value: 'normal' }, { label: '粗体', value: 'bold' }]}
                    />
                </div>
            </div>

            <div className="pb-3">
                <div className="flex justify-between items-center">
                    <label>颜色</label>
                    <ColorPicker
                        value={ts.fill ?? '#000000'}
                        onChange={(e) => stores.editor.setTextStyle({ fill: e.toHexString() })}
                        onChangeComplete={commit}
                        size="small"
                    />
                </div>
            </div>

            <div className="pb-3">
                <label>对齐</label>
                <div className="py-2">
                    <Segmented
                        block
                        size="small"
                        value={ts.textAlign ?? 'left'}
                        onChange={(v) => { stores.editor.setTextStyle({ textAlign: v }); commit(); }}
                        options={[{ label: '左', value: 'left' }, { label: '中', value: 'center' }, { label: '右', value: 'right' }]}
                    />
                </div>
            </div>

            <div className="pb-3">
                <div className="flex justify-between items-center">
                    <label>背景色</label>
                    <div className="flex items-center gap-2">
                        <Button
                            type="text"
                            size="small"
                            className="text-xs opacity-80 px-1"
                            disabled={!ts.backgroundColor}
                            onClick={() => { stores.editor.setTextStyle({ backgroundColor: null }); commit(); }}
                        >无</Button>
                        <ColorPicker
                            value={ts.backgroundColor ?? '#ffffff'}
                            onChange={(e) => stores.editor.setTextStyle({ backgroundColor: e.toHexString() })}
                            onChangeComplete={commit}
                            size="small"
                        />
                    </div>
                </div>
            </div>

            <div className="pb-3">
                <label>内边距</label>
                <Slider
                    min={0}
                    max={40}
                    step={1}
                    value={ts.padding ?? 0}
                    onChange={(v) => stores.editor.setTextStyle({ padding: v })}
                    onChangeComplete={commit}
                />
            </div>

            <div className="pb-3">
                <label>圆角</label>
                <Slider
                    min={0}
                    max={40}
                    step={1}
                    value={ts.cornerRadius ?? 0}
                    onChange={(v) => stores.editor.setTextStyle({ cornerRadius: v })}
                    onChangeComplete={commit}
                />
            </div>
        </>
    );
});

export default TextProperties;
