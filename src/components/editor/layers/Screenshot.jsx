import { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Rect } from 'leafer-ui';
import stores from '@stores';
import { computedSize, enhanceImageToHdr, getPosition, getRotatedPosition, getMargin } from '@utils/utils';
import { createFrameDecorations, getBrowserHeaderHeight, getFrameDefinition, getFrameMetrics, isDeviceFrame } from '@utils/frameConfig';
import { debounce } from 'lodash';

const createSnap = debounce(() => {
    stores.editor.createSnap('update');
}, 100);

const addBefore = (parent, node, reference) => {
    const index = parent.children?.indexOf?.(reference);
    parent.add(node, Number.isInteger(index) && index >= 0 ? index : undefined);
};

export default observer(function Screenshot({ parent }) {
    const hdrTaskRef = useRef(0);
    const [hdrImageUrl, setHdrImageUrl] = useState(null);
    const [image, box, container] = useMemo(() => {
        const image = new Rect({ origin: 'center' });
        const box = new Box({ overflow: 'hide', children: [image] });
        const container = new Box({
            id: 'screenshot-box',
            overflow: 'hide',
            strokeAlign: 'outside',
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0,
            fill: '#ffffff00',
            children: [box],
        });
        return [image, box, container];
    }, [parent]);

    useEffect(() => {
        const source = stores.editor.img.src;
        const taskId = hdrTaskRef.current + 1;
        hdrTaskRef.current = taskId;
        if (!stores.option.hdrEnabled || !source) {
            setHdrImageUrl(null);
            return undefined;
        }
        setHdrImageUrl(null);
        enhanceImageToHdr(source).then((result) => {
            if (hdrTaskRef.current !== taskId || !stores.option.hdrEnabled || stores.editor.img.src !== source) return;
            setHdrImageUrl(result);
        });
        return undefined;
    }, [stores.editor.img.src, stores.option.hdrEnabled]);

    useEffect(() => {
        const displaySrc = stores.option.hdrEnabled && hdrImageUrl ? hdrImageUrl : stores.editor.img.src;
        image.fill = {
            type: 'image',
            url: displaySrc,
            align: stores.option.mode === 'fit' ? 'center' : 'top',
            mode: stores.option.mode,
        };
        createSnap();
    }, [image, hdrImageUrl, stores.editor.img.src, stores.option.mode, stores.option.hdrEnabled]);

    useEffect(() => {
        box.fill = stores.option.padding === 0 && !isDeviceFrame(stores.option.frame)
            ? '#ffffff00'
            : stores.option.paddingBg;
        createSnap();
    }, [box, stores.option.frame, stores.option.paddingBg, stores.option.padding]);

    useEffect(() => {
        const definition = getFrameDefinition(stores.option.frame);
        container.cornerRadius = stores.option.round;
        image.cornerRadius = definition.kind === 'browser' || definition.kind === 'arc' ? null : stores.option.round;
        createSnap();
    }, [container, image, stores.option.frame, stores.option.round]);

    useEffect(() => {
        const definition = getFrameDefinition(stores.option.frame);
        const shadow = stores.option.shadow;
        if (!shadow?.visible || stores.option.frame === 'macbookpro16' || definition.kind === 'device') {
            container.shadow = null;
        } else {
            container.shadow = {
                x: shadow.x,
                y: shadow.y,
                blur: shadow.blur,
                spread: shadow.spread,
                color: shadow.color,
                box: true,
            };
        }
        createSnap();
    }, [container, stores.option.frame, stores.option.shadow, stores.option.shadow?.visible, stores.option.shadow?.x, stores.option.shadow?.y, stores.option.shadow?.blur, stores.option.shadow?.spread, stores.option.shadow?.color]);

    useEffect(() => {
        image.scaleX = stores.option.scaleX ? -1 : 1;
        createSnap();
    }, [image, stores.option.scaleX]);

    useEffect(() => {
        image.scaleY = stores.option.scaleY ? -1 : 1;
        createSnap();
    }, [image, stores.option.scaleY]);

    // 外框、尺寸、对齐和旋转共享一个布局 effect；cleanup 会移除本次创建的全部节点。
    useEffect(() => {
        const { align, browserHeaderSize, browserUrl, frame, frameConf, padding, rotation, scale } = stores.option;
        const { img } = stores.editor;
        const definition = getFrameDefinition(frame);
        const margin = getMargin(frameConf.width, frameConf.height);
        const inset = definition.kind !== 'none' && definition.kind !== 'stroke' && definition.kind !== 'browser' && definition.kind !== 'arc'
            ? (definition.inset || 0)
            : 0;
        const bottomInset = definition.kind !== 'none' && definition.kind !== 'stroke' && definition.kind !== 'browser' && definition.kind !== 'arc'
            ? (definition.bottom || inset)
            : 0;
        const maxWidth = Math.max(1, frameConf.width - margin - inset * 2);
        const browserHeaderHeight = getBrowserHeaderHeight(frame, browserHeaderSize);
        const maxHeight = Math.max(1, frameConf.height - margin - inset - bottomInset - browserHeaderHeight);
        const contentSize = computedSize(img.width || 1, img.height || 1, maxWidth, maxHeight);
        const metrics = getFrameMetrics(frame, contentSize.width, contentSize.height, { headerSize: browserHeaderSize });
        const { totalWidth, totalHeight } = metrics;
        // 平面布局：scale 为二维缩放，rotation（Z 轴）直接作用于 container；
        // 旋转时 origin=center，x/y 是未缩放盒子的左上角（见下方换算）。
        const hasSpatialTransform = rotation !== 0;
        let positionX;
        let positionY;
        if (hasSpatialTransform) {
            // LeaferUI 的 origin 只是变换基点（类似 CSS transform-origin），x/y 仍是未缩放盒子的左上角：
            // 盒中心（即旋转中心）最终落在 (x + totalWidth/2, y + totalHeight/2)。
            // 先按旋转后的外接矩形对齐求出理想中心，再换算回左上角坐标。
            const rad = rotation * Math.PI / 180;
            const rotatedW = Math.abs(totalWidth * Math.cos(rad)) + Math.abs(totalHeight * Math.sin(rad));
            const rotatedH = Math.abs(totalWidth * Math.sin(rad)) + Math.abs(totalHeight * Math.cos(rad));
            ({ x: positionX, y: positionY } = getRotatedPosition(align, rotatedW, rotatedH, frameConf.width, frameConf.height));
            positionX -= totalWidth / 2;
            positionY -= totalHeight / 2;
        } else {
            ({ x: positionX, y: positionY } = getPosition(align, frameConf.width - totalWidth, frameConf.height - totalHeight));
        }
        const decorationState = createFrameDecorations(frame, metrics, {
            shadow: stores.option.shadow,
            url: browserUrl,
        });
        const decorations = decorationState.nodes || [];

        decorations.forEach((node) => addBefore(container, node, box));
        container.strokeWidth = decorationState.strokeWidth ?? null;
        container.stroke = decorationState.stroke ?? null;
        container.width = totalWidth;
        container.height = totalHeight;
        container.scaleX = scale;
        container.scaleY = scale;
        container.skewX = 0;
        container.skewY = 0;
        container.rotation = rotation;
        container.origin = hasSpatialTransform ? 'center' : align;
        container.x = positionX;
        container.y = positionY;
        box.width = metrics.boxWidth;
        box.height = metrics.boxHeight;
        box.x = metrics.boxX;
        box.y = metrics.boxY;
        box.cornerRadius = definition.kind === 'device' && frame === 'iphonepro' ? metrics.boxWidth * 0.1 : null;
        const imageWidth = Math.max(1, metrics.boxWidth - padding);
        const imageHeight = Math.max(1, Math.round(imageWidth * metrics.boxHeight / Math.max(1, metrics.boxWidth)));
        image.width = imageWidth + 2;
        image.height = imageHeight + 2;
        image.x = padding / 2 - 1;
        image.y = (metrics.boxHeight - imageHeight) / 2 - 1;
        createSnap();

        return () => {
            decorations.forEach((node) => node.remove?.());
            container.strokeWidth = null;
            container.stroke = null;
            container.scaleX = 1;
            container.scaleY = 1;
            container.skewX = 0;
            container.skewY = 0;
            container.rotation = 0;
            box.cornerRadius = null;
            container.cornerRadius = stores.option.round;
        };
    }, [box, container, image, stores.option.align, stores.option.browserHeaderSize, stores.option.browserUrl, stores.option.frame, stores.option.frameConf.width, stores.option.frameConf.height, stores.option.padding, stores.option.rotation, stores.option.scale, stores.option.shadow]);

    useEffect(() => {
        parent.add(container);
        return () => {
            container.remove();
            createSnap.cancel();
        };
    }, [container, parent]);
    return null;
});
