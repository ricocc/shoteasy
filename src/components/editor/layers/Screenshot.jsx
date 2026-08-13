import { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Rect } from 'leafer-ui';
import stores from '@stores';
import { computedSize, enhanceImageToHdr, getPosition, getRotatedPosition, getMargin, calculateRotatedRectDimensions } from '@utils/utils';
import { createFrameDecorations, getFrameDefinition, getFrameMetrics, isDeviceFrame } from '@utils/frameConfig';
import { debounce } from 'lodash';

const createSnap = debounce(() => {
    stores.editor.createSnap('update');
}, 100);

const addBefore = (parent, node, reference) => {
    const index = parent.children?.indexOf?.(reference);
    parent.add(node, Number.isInteger(index) && index >= 0 ? index : undefined);
};

export default observer(({ parent }) => {
    const hdrTaskRef = useRef(0);
    const [hdrImageUrl, setHdrImageUrl] = useState(null);
    const [image, box, container] = useMemo(() => {
        const image = new Rect({ origin: 'center' });
        const box = new Box({ overflow: 'hide', children: [image] });
        const container = new Box({
            id: 'screenshot-box',
            overflow: 'hide',
            strokeAlign: 'outside',
            scale: 1,
            rotation: 0,
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
        if (stores.option.shadow === 0 || stores.option.frame === 'macbookpro16' || definition.kind === 'device') {
            container.shadow = null;
        } else {
            container.shadow = {
                x: stores.option.shadow * 4,
                y: stores.option.shadow * 4,
                blur: stores.option.shadow * 3,
                color: '#00000045',
                box: true,
            };
        }
        createSnap();
    }, [container, stores.option.frame, stores.option.shadow]);

    useEffect(() => {
        container.scale = stores.option.scale;
        createSnap();
    }, [container, stores.option.scale]);

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
        const { align, frame, frameConf, padding, rotation, scale } = stores.option;
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
        const maxHeight = Math.max(1, frameConf.height - margin - inset - bottomInset);
        const contentSize = computedSize(img.width || 1, img.height || 1, maxWidth, maxHeight);
        const metrics = getFrameMetrics(frame, contentSize.width, contentSize.height);
        const { totalWidth, totalHeight } = metrics;
        const scaledWidth = totalWidth * Math.abs(scale);
        const scaledHeight = totalHeight * Math.abs(scale);
        const rotated = calculateRotatedRectDimensions(scaledWidth, scaledHeight, rotation);
        const isRotated = rotation !== 0;
        let positionX;
        let positionY;
        if (isRotated) {
            // origin=center 时，Leafer 的 x/y 就是旋转中心；先按旋转后的外接矩形对齐，再取其中心。
            ({ x: positionX, y: positionY } = getRotatedPosition(align, rotated.width, rotated.height, frameConf.width, frameConf.height));
        } else {
            ({ x: positionX, y: positionY } = getPosition(align, frameConf.width - totalWidth, frameConf.height - totalHeight));
        }
        const decorationState = createFrameDecorations(frame, metrics, { shadow: stores.option.shadow });
        const decorations = decorationState.nodes || [];

        decorations.forEach((node) => addBefore(container, node, box));
        container.strokeWidth = decorationState.strokeWidth ?? null;
        container.stroke = decorationState.stroke ?? null;
        container.width = totalWidth;
        container.height = totalHeight;
        container.rotation = rotation;
        container.origin = isRotated ? 'center' : align;
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
            container.rotation = 0;
            box.cornerRadius = null;
            container.cornerRadius = stores.option.round;
        };
    }, [box, container, image, stores.option.align, stores.option.frame, stores.option.frameConf.width, stores.option.frameConf.height, stores.option.padding, stores.option.rotation, stores.option.scale, stores.option.shadow]);

    useEffect(() => {
        parent.add(container);
        return () => {
            container.remove();
            createSnap.cancel();
        };
    }, [container, parent]);
    return null;
});
