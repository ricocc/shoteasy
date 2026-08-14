import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip, Divider } from 'antd';
import Icon from '@components/Icon';
import ColorPicker from '@components/ColorPicker';
import { WidthDropdown } from '@components/header/WidthDropdown';
import EmojiSelect from '@components/header/EmojiSelect';
import { nanoid, cn } from '@utils/utils';
import stores from '@stores';

const toolList = ['Square', 'SquareFill', 'Circle', 'Slash', 'MoveDownLeft', 'Pencil', 'Magnifier', 'Step', 'text', 'blur', 'mosaic', 'spotlight', 'Smile'];
const toolLabels = {
    Square: '矩形',
    SquareFill: '实心矩形',
    Circle: '圆形',
    Slash: '直线',
    MoveDownLeft: '箭头',
    Pencil: '画笔',
    Magnifier: '放大镜',
    Step: '步骤序号',
    text: '文字',
    blur: '模糊',
    mosaic: '马赛克',
    spotlight: '聚光',
    Smile: '表情',
};

export default observer(() => {
    const [isMove, setIsMove] = useState(false);
    const selectTool = (type) => {
        if (!stores.editor.isEditing) return;
        const { useTool } = stores.editor;
        stores.editor.setUseTool(useTool === type ? null : type);
        setIsMove(false);
        if (type === 'Magnifier' || type === 'blur' || type === 'mosaic') stores.editor.createSnap('init');
    };
    const handleSelectEmoji = (emoji) => {
        if (!stores.editor.isEditing) return;
        const x = stores.option.frameConf.width / 2 - 24;
        const y = stores.option.frameConf.height / 2 - 24;
        stores.editor.setUseTool(null);
        setIsMove(false);
        stores.editor.addShape({
            id: nanoid(),
            type: 'emoji',
            text: emoji,
            zIndex: stores.editor.shapes.size + 1,
            x,
            y,
            editable: true,
        });
        stores.history.commit();
    };
    const toggleMove = () => {
        if (!stores.editor.isEditing) return;
        const is = !isMove;
        stores.editor.setUseTool(null);
        setIsMove(is);
        stores.editor.setMove(is);
    };

    return (
        <div className="shoteasy-bottom-toolbar" aria-label="标注工具">
            <div className="shoteasy-bottom-toolbar__tools">
                {toolList.map(item => {
                    if (item === 'Smile') {
                        return (
                            <Tooltip key={item} placement="top" arrow={false} title={toolLabels[item]}>
                                <EmojiSelect disabled={false} theme={stores.editor.isDark ? 'dark' : 'light'} toSelect={handleSelectEmoji} />
                            </Tooltip>
                        );
                    }
                    let icon;
                    if (item === 'Magnifier') {
                        icon = <Icon.Magnifier size={16} />;
                    } else if (item === 'Step') {
                        icon = <span className="shoteasy-step-badge">{stores.editor.nextStep}</span>;
                    } else if (item === 'text') {
                        icon = <Icon.Type size={16} />;
                    } else if (item === 'blur') {
                        icon = <Icon.Blur size={16} />;
                    } else if (item === 'mosaic') {
                        icon = <Icon.Mosaic size={16} />;
                    } else if (item === 'spotlight') {
                        icon = <Icon.Spotlight size={16} />;
                    } else {
                        const IconComp = Icon[item];
                        icon = IconComp ? <IconComp size={16} /> : null;
                    }
                    return (
                        <Tooltip key={item} placement="top" arrow={false} title={toolLabels[item]}>
                            <Button
                                type="text"
                                shape="circle"
                                aria-label={toolLabels[item]}
                                icon={icon}
                                className={cn('shoteasy-tool-button', stores.editor.useTool === item && 'is-active')}
                                onClick={() => selectTool(item)}
                            />
                        </Tooltip>
                    );
                })}
            </div>
            <Divider type="vertical" className="shoteasy-toolbar-divider" />
            <div className="shoteasy-bottom-toolbar__controls">
                <ColorPicker
                    aria-label="标注颜色"
                    size="small"
                    placement="top"
                    presets={[{
                        label: '推荐',
                        colors: ['#ffffff', '#444444', '#df4b26', '#1677ff', '#52C41A', '#FA8C16', '#FADB14', '#EB2F96', '#722ED1'],
                    }]}
                    value={stores.editor.annotateColor}
                    onChange={(e) => stores.editor.setAnnotateColor(e.toHexString())}
                />
                <WidthDropdown
                    defaultValue={stores.editor.strokeWidth}
                    onChange={(e) => stores.editor.setStrokeWidth(e)}
                    placement="top"
                />
            </div>
            <Divider type="vertical" className="shoteasy-toolbar-divider" />
            <Tooltip placement="top" arrow={false} title="移动 / 拖动">
                <Button
                    type="text"
                    shape="circle"
                    aria-label="移动 / 拖动"
                    className={cn('shoteasy-tool-button', isMove && 'is-active')}
                    icon={<Icon.Hand size={16} />}
                    onClick={toggleMove}
                />
            </Tooltip>
        </div>
    );
});
