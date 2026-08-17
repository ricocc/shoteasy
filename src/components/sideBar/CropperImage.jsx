import { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Tooltip, Modal } from 'antd';
import stores from '@stores';
import Cropper from "react-cropper";
import { getDefaultFrameSize } from "@utils/utils";
import "cropperjs/dist/cropper.css";

export default observer(function CropperImage() {
    const cropperRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCrop = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            const canvas = cropperRef.current?.cropper.getCroppedCanvas();
            if (canvas) {
                const { width, height } = canvas;
                const imgUrl = canvas.toDataURL();
                stores.editor.setImg(Object.assign({}, stores.editor.img, {
                    src: imgUrl,
                    width,
                    height,
                }));
                if (stores.option.size.type === 'auto') {
                    // 裁剪后画布同样保持默认 4:3，与拖入截图的行为一致
                    const frameSize = getDefaultFrameSize(width, height);
                    stores.option.setFrameSize(frameSize.width, frameSize.height);
                }
            }
        }
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return (
        <>
            <Tooltip title='裁剪图片'>
                <Button
                type='text'
                shape='circle'
                    aria-label='裁剪图片'
                    icon={<Icon.Crop size={18} />}
                    disabled={!stores.editor.img?.src}
                    onClick={handleCrop}
                ></Button>
            </Tooltip>
            <Modal
                title='裁剪'
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
                destroyOnClose={true}
            >
                <Cropper
                    ref={cropperRef}
                    style={{ height: 400, width: "100%" }}
                    zoomTo={0.5}
                    initialAspectRatio={stores.editor.img.width / stores.editor.img.height}
                    src={stores.editor.img.src}
                    dragMode="move"
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                    guides={true}
                />
            </Modal>
        </>
    );
});
