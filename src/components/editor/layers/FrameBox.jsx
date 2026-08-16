import { Children, cloneElement, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Frame } from 'leafer-ui';
import stores from '@stores';
import { blurImageUrl, buildLayeredFill } from '@utils/backgroundEffects';

const BACKGROUND_CORNER_RADIUS = 20;

const childrenInjectProps = (params, children) => {
    if (children instanceof Array) {
        return children.map((child) => {
            return Children.toArray(child).map((element) =>
                cloneElement(element, { ...params })
            );
        });
    } else {
        const dom = Children.toArray(children).map((element) =>
            cloneElement(element, { ...params })
        );
        return dom;
    }
};

/**
 * 最外层画框节点。fill 为背景 paint（可叠加模糊/遮罩/噪点，见 backgroundEffects）。
 * observer 以便背景效果字段（blur/mask/noise）变化时即时重算 fill。
 */
const FrameBox = observer(({ width, height, background, parent, children, cursor }) => {
    const frame = useMemo(() => {
        const fra = new Frame({
            width,
            height,
            overflow: 'hide',
            fill: background,
            cornerRadius: BACKGROUND_CORNER_RADIUS,
            cursor: 'auto'
        });
        fra.name = 'frame';
        return fra;
    }, []);

    const [blurredUrl, setBlurredUrl] = useState(null);
    const baseUrl = background?.type === 'image' ? background.url : null;
    const blur = stores.option.backgroundBlur;

    // 图片背景模糊（M4.11）：blur<=0 或非图片时清空；失败回退原图。
    useEffect(() => {
        if (!baseUrl || !blur || blur <= 0) {
            setBlurredUrl(null);
            return undefined;
        }
        let cancelled = false;
        blurImageUrl(baseUrl, blur)
            .then((url) => { if (!cancelled) setBlurredUrl(url); })
            .catch(() => { if (!cancelled) setBlurredUrl(null); });
        return () => { cancelled = true; };
    }, [baseUrl, blur]);

    const effectiveFill = useMemo(() => buildLayeredFill({
        base: background,
        blurredUrl: blur > 0 ? blurredUrl : null,
        blur,
        maskColor: stores.option.backgroundMaskColor,
        maskOpacity: stores.option.backgroundMaskOpacity,
        noise: stores.option.backgroundNoise,
    }), [background, blurredUrl, blur, stores.option.backgroundMaskColor, stores.option.backgroundMaskOpacity, stores.option.backgroundNoise]);

    useEffect(() => {
        frame.width = width;
        frame.height = height;
        frame.cornerRadius = BACKGROUND_CORNER_RADIUS;
        // buildLayeredFill 无背景（无背景选项）时返回 null；Leafer 的 fill=null
        // 会回退到 Frame 默认白底，导致透明画布渲染/导出不透明，需显式赋透明色。
        frame.fill = effectiveFill ?? 'rgba(0,0,0,0)';
    }, [width, height, effectiveFill]);

    useEffect(() => {
        frame.cursor = cursor || 'auto';
    }, [cursor]);

    useEffect(() => {
        parent.add(frame);
        return () => {
            frame.remove();
        };
    }, [parent]);

    return <>{childrenInjectProps({ parent: frame }, children)}</>;
});

export default FrameBox;
