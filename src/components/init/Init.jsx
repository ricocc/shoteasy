import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Upload, Button, Tooltip } from 'antd';
import { supportImg, cn } from '@utils/utils';
import stores from '@stores';
import usePaste from '@hooks/usePaste';
import useSetImg from '@hooks/useSetImg';
import { captureScreen } from '@utils/captureScreen';
import demoPng from '@assets/demo.png';

const { Dragger } = Upload;

export default observer(() => {
    const getFile = useSetImg(stores);
    const beforeUpload = async (file) => {
        await getFile(file);
        return Promise.reject();
    };
    const onCapture = async () => {
        const dataURL = await captureScreen();
        if (!dataURL) return;
        getFile(dataURL, 'dataURL');
    };
    const handleTry = () => {
        getFile(demoPng, 'dataURL');
    };
    usePaste((file) => {
        getFile(file);
    });

    return (
        <div className="shoteasy-empty-state">
            <div className={cn('shoteasy-empty-state__content', stores.editor.invalid && 'invalid')}>
                <div className="shoteasy-empty-state__heading">
                    <div className="shoteasy-empty-state__mark">
                        <Icon.ImagePlus size={24} />
                    </div>
                    <div>
                        <h1>把截图变成成品</h1>
                        <p>上传一张图片，开始调整尺寸、背景和外框</p>
                    </div>
                </div>
                <Dragger
                    accept={supportImg.join(',')}
                    name="file"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    rootClassName="shoteasy-upload-card"
                >
                    <div className="shoteasy-upload-card__body">
                        <Icon.ImagePlus size={32} />
                        <div>
                            <strong>点击或拖拽图片到这里</strong>
                            <span>也可以直接粘贴剪贴板图片</span>
                        </div>
                    </div>
                </Dragger>

                <div className="shoteasy-quick-actions" aria-label="快捷操作">
                    <Tooltip placement="top" arrow={false} title="截取屏幕窗口">
                        <Button type="default" size="middle" icon={<Icon.Camera size={18} />} onClick={onCapture}>
                            截取屏幕
                        </Button>
                    </Tooltip>
                </div>

                <button className="shoteasy-demo-card" onClick={handleTry} type="button">
                    <img src={demoPng} alt="示例截图" />
                    <span>试用示例</span>
                    <Icon.ArrowUpRight size={16} />
                </button>
            </div>
        </div>
    );
});
