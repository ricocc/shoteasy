import { useState, useEffect } from 'react';
import Icon from '@components/Icon';
import { InputNumber, Button, Tooltip } from 'antd';

const CustomSize = ({ frameWidth, frameHeight, type, onSet }) => {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [error, setError] = useState(false);
    const setAuto = () => {
        setError(false);
        onSet({ type: 'auto', title: '自动' });
    };
    const setCustom = () => {
        const nextWidth = Number(width);
        const nextHeight = Number(height);
        if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight) || nextWidth <= 0 || nextHeight <= 0) {
            setError(true);
            return;
        }
        setError(false);
        // 两个输入框只在确认按钮处一次性提交，避免输入过程中产生多个历史事务。
        onSet({ type: 'custom', title: '自定义', width: Math.round(nextWidth), height: Math.round(nextHeight) });
    };
    useEffect(() => {
        if (type === 'custom') {
            setWidth(frameWidth);
            setHeight(frameHeight);
        } else {
            setWidth('');
            setHeight('');
        }
        setError(false);
    }, [type, frameWidth, frameHeight]);
    const valid = Number.isFinite(Number(width)) && Number.isFinite(Number(height)) && Number(width) > 0 && Number(height) > 0;
    return (
        <div className='shoteasy-custom-size flex gap-2 items-center py-2 font-normal'>
            <InputNumber
                min={1}
                value={width}
                onChange={(value) => { setWidth(value ?? ''); setError(false); }}
                placeholder={frameWidth}
                prefix={<span className='opacity-60 mx-1'>W</span>}
                className='flex-1'
                status={error ? 'error' : undefined}
                aria-label='自定义宽度'
            />
            <span className='text-xs opacity-50'>x</span>
            <InputNumber
                min={1}
                value={height}
                onChange={(value) => { setHeight(value ?? ''); setError(false); }}
                placeholder={frameHeight}
                prefix={<span className='opacity-60 mx-1'>H</span>}
                className='flex-1'
                status={error ? 'error' : undefined}
                aria-label='自定义高度'
            />
            <Tooltip title="应用自定义尺寸">
                <Button
                type='primary'
                shape='circle'
                icon={<Icon.Check size={18} />}
                disabled={!valid}
                aria-label='应用自定义尺寸'
                onClick={setCustom}
                />
            </Tooltip>
            <Tooltip title="自动尺寸">
                <Button
                    type='primary'
                    shape='circle'
                    icon={<Icon.Maximize size={18} />}
                    disabled={type === 'auto'}
                    aria-label='使用自动尺寸'
                    onClick={setAuto}
                ></Button>
            </Tooltip>
        </div>
    );
};

export default CustomSize;
