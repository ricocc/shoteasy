import { ColorPicker, Button } from 'antd';
import { TinyColor } from '@ctrl/tinycolor';
import Icon from '@components/Icon';

export default function ColorPickerWithDropper(props) {
    const useDropper = () => {
        const EyeDropperCtor = window.EyeDropper;
        if (!EyeDropperCtor) return;
        const eyeDropper = new EyeDropperCtor();
        eyeDropper.open().then((result) => {
            const color = result.sRGBHex;
            props?.onChange && props.onChange(new TinyColor(color));
        }).catch(() => undefined);
    }
    return <ColorPicker
        {...props}
        panelRender={(panel) => (
            <>
                {window.EyeDropper && <div className="mb-1">
                    <Button type="text" shape="circle" size="small" aria-label="吸取屏幕颜色" icon={<Icon.Pipette size={16} />} onClick={useDropper} />
                </div>}
                {panel}
            </>
        )}
    />
}
