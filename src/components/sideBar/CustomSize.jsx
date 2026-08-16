import { useState, useEffect } from 'react';
import Icon from '@components/Icon';
import { InputNumber, Button, Tooltip } from 'antd';

const CustomSize = ({ frameWidth, frameHeight, type, onSet }) => {
    const [width, setWidth] = useState(frameWidth);
    const [height, setHeight] = useState(frameHeight);
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
        setWidth(frameWidth);
        setHeight(frameHeight);
        setError(false);
    }, [type, frameWidth, frameHeight]);
    const valid = Number.isFinite(Number(width)) && Number.isFinite(Number(height)) && Number(width) > 0 && Number(height) > 0;
    return (
        <form
            className='shoteasy-custom-size'
            onSubmit={(event) => {
                event.preventDefault();
                if (valid) setCustom();
            }}
        >
            <div className='shoteasy-custom-size__fields'>
                <InputNumber
                    min={1}
                    value={width}
                    onChange={(value) => { setWidth(value ?? ''); setError(false); }}
                    prefix={<span className='shoteasy-custom-size__prefix'>W</span>}
                    status={error ? 'error' : undefined}
                    aria-label='自定义宽度'
                />
                <span className='shoteasy-custom-size__divider' aria-hidden='true'>×</span>
                <InputNumber
                    min={1}
                    value={height}
                    onChange={(value) => { setHeight(value ?? ''); setError(false); }}
                    prefix={<span className='shoteasy-custom-size__prefix'>H</span>}
                    status={error ? 'error' : undefined}
                    aria-label='自定义高度'
                />
            </div>
            <div className='shoteasy-custom-size__actions'>
                <Tooltip title="应用自定义尺寸">
                    <Button
                        htmlType='submit'
                        type='primary'
                        icon={<Icon.Check size={15} />}
                        disabled={!valid}
                    >应用</Button>
                </Tooltip>
                <Tooltip title={type === 'auto' ? '当前已使用自动尺寸' : '根据截图自动计算画布尺寸'}>
                    <Button
                        htmlType='button'
                        type='text'
                        icon={<Icon.Maximize size={15} />}
                        disabled={type === 'auto'}
                        aria-label='使用自动尺寸'
                        onClick={setAuto}
                    >自动</Button>
                </Tooltip>
            </div>
        </form>
    );
};

export default CustomSize;
