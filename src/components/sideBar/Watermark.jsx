import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Radio, Switch, Input } from 'antd';
import ColorPicker from '@components/ColorPicker';
import stores from '@stores';
import { text2Svg } from '@utils/utils';

export default observer(() => {
    const [useWater, setUseWater] = useState(false);
    const [waterCont, setWaterCont] = useState('ShotEasy');
    const [waterColor, setWaterColor] = useState('#00000030');
    const [direction, setDirection] = useState(45);
    const handleColorChange = (color) => {
        setWaterColor(typeof color === 'string' ? color : color.toRgbString());
    };
    useEffect(() => {
        if (useWater && waterCont.trim()) {
            const svgImg = text2Svg({
                text: waterCont,
                color: waterColor,
                angleDegrees: direction
            });
            stores.option.setWaterImg(svgImg);
        } else {
            stores.option.setWaterImg(null);
        }
    }, [useWater, waterCont, waterColor, direction]);

    return (
        <>
            <div className="shoteasy-watermark-row [&_label]:font-semibold [&_label]:text-sm flex gap-4 items-center justify-between">
                <label>水印</label>
                <Switch defaultChecked={useWater} onChange={setUseWater} size="small" className="bg-slate-200" />
            </div>
            {useWater &&
                <div className="shoteasy-watermark-options [&_label]:font-semibold [&_label]:text-xs grid gap-3 pl-2 pt-2">
                    <Input defaultValue={waterCont} placeholder="水印内容" onChange={(e) => setWaterCont(e.target.value)} />
                    <div className="flex items-center justify-between">
                        <label>颜色</label>
                        <ColorPicker value={waterColor} onChange={handleColorChange} size="small" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label>方向</label>
                        <div>
                            <Radio.Group defaultValue={direction} onChange={(e) => setDirection(e.target.value)} size="small" aria-label="水印方向">
                                <Radio.Button value={-45} aria-label="左上到右下"><Icon.ArrowUpRight size={16} className="mt-[3px]" /></Radio.Button>
                                <Radio.Button value={45} aria-label="右上到左下"><Icon.ArrowDownRight size={16} className="mt-[3px]" /></Radio.Button>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label>仅背景</label>
                        <Switch size="small" onChange={(checked) => stores.option.setWaterIndex(checked ? -1 : 1)} className="bg-slate-200" />
                    </div>
                </div>
            }
            <div className="[&_label]:font-semibold [&_label]:text-sm flex gap-4 items-center justify-between pt-4">
                <label>HDR</label>
                <Switch checked={stores.option.hdrEnabled} onChange={(checked) => stores.option.setHdrEnabled(checked)} size="small" className="bg-slate-200" />
            </div>
        </>
    )
});
