import { useEffect, useMemo, useState } from 'react';
import { Rect, Ellipse, Line, Text, Path, Group, PropertyEvent } from 'leafer-ui';
import { Arrow } from '@leafer-in/arrow';
import debounce from 'lodash/debounce';
import { numSvg } from '@utils/utils';
import Magnifier from '@utils/shape/Magnifier';
import baseSnapshot from '@stores/baseSnapshot';
import stores from '@stores';
import { blurSnapshot, mosaicSnapshot, buildSpotlightPath } from '@utils/shape/regionEffect';

export default function ShapeLine({ parent, type, id, width, height, x, y, fill, strokeWidth, zIndex, points, editable, text, textStyle, snap, effect, rotation = 0, scaleX = 1, scaleY = 1 }) {
    const shape = useMemo(() => {
        const defaultOption = { id, x, y, zIndex }
        if (type === 'SquareFill') {
            return new Rect({
                cornerRadius: 8,
                width,
                height,
                fill,
                ...defaultOption
            });
        }
        if (type === 'Circle') {
            return new Ellipse({
                stroke: fill,
                strokeWidth,
                width,
                height,
                ...defaultOption
            });
        }
        if (type === 'Magnifier') {
            return new Magnifier({
                stroke: '#ffffff90',
                strokeWidth,
                strokeAlign: 'outside',
                width,
                height,
                shadow: {
                    x: 4,
                    y: 4,
                    blur: 6,
                    color: '#00000010',
                    box: true
                },
                ...defaultOption
            });
        }
        if (type === 'Slash') {
            return new Line({
                id,
                points,
                zIndex,
                stroke: fill,
                strokeWidth
            });
        }
        if (type === 'MoveDownLeft') {
            return new Arrow({
                id,
                points,
                zIndex,
                strokeCap: 'round',
                strokeJoin: 'round',
                stroke: fill,
                strokeWidth
            });
        }
        if (type === 'Pencil') {
            return new Line({
                id,
                points,
                zIndex,
                curve: true,
                stroke: fill,
                strokeWidth
            });
        }
        if (type === 'Step') {
            return new Ellipse({
                ...defaultOption,
                width: 32,
                height: 32,
                stroke: '#ffffff90',
                strokeWidth,
                strokeAlign: 'outside',
                lockRatio: true,
                shadow: {
                    x: 1,
                    y: 1,
                    blur: 2,
                    color: '#00000045',
                    box: true
                },
                fill: [
                    {
                        type: 'solid',
                        color: fill
                    },
                    {
                        type: 'image',
                        url: numSvg(text),
                        format: 'svg',
                        align: 'center'
                    }
                ]
            })
        }
        if (type === 'emoji') {
            return new Text({
                id,
                zIndex,
                text,
                resizeFontSize: true,
                fontSize: 48
            });
        }
        if (type === 'text') {
            // 文字标注：LeaferJS Text 节点天然支持 background / padding / cornerRadius（UI 级属性）。
            // fill 为文字颜色，background 为文字框背景。宽高由内容自适应，不在此设定。
            const ts = textStyle || {};
            return new Text({
                id,
                zIndex,
                x,
                y,
                text: text ?? '',
                fontSize: ts.fontSize ?? 24,
                fontWeight: ts.fontWeight ?? 'normal',
                fill: ts.fill ?? fill,
                textAlign: ts.textAlign ?? 'left',
                padding: ts.padding ?? 0,
                cornerRadius: ts.cornerRadius ?? 0,
                ...(ts.backgroundColor ? { background: ts.backgroundColor } : {})
            });
        }
        if (type === 'blur' || type === 'mosaic') {
            // 区域效果：一个可移动/缩放的 Rect，fill 为底图快照的处理变体（在下方 effect 中异步设置）。
            const eff = effect || {};
            return new Rect({
                ...defaultOption,
                x, y, width, height,
                cornerRadius: eff.cornerRadius ?? 0
            });
        }
        if (type === 'spotlight') {
            // 聚光（M5.11）：Group 的 boxBounds = 开口（编辑器据此选框，只编辑开口，
            // 不让全画布遮罩抢占命中）。子节点：
            //   1) overlay Path：windingRule 'evenodd'，外环覆盖整张画布 + 开口为镂空，
            //      fill=半透明遮罩色；hittable:false 不接收命中。
            //   2) hitRect：开口尺寸的透明 Rect，hittable:true，使开口可被点击选中（Group）。
            // 聚光不消费底图快照。
            const grp = new Group({ ...defaultOption, x, y, width, height });
            const overlay = new Path({ windingRule: 'evenodd', hittable: false });
            const hitRect = new Rect({
                x: 0, y: 0, width, height,
                fill: 'rgba(0,0,0,0)',
                hittable: true,
                editable: false
            });
            grp.add(overlay);
            grp.add(hitRect);
            return grp;
        }
        return new Rect({
            cornerRadius: 8,
            stroke: fill,
            strokeWidth,
            width,
            height,
            ...defaultOption
        });
    }, [parent]);

    useEffect(() => {
        if (['Slash', 'MoveDownLeft', 'Pencil'].includes(type)) {
            shape.points = points;
            // 线条类同样应用位移，使编辑器移动结果可被序列化还原
            shape.x = x;
            shape.y = y;
        } else if (type === 'Step' || type === 'text') {
            // Step 固定 32×32；text 宽高由内容自适应。两者只应用位移，不强制尺寸。
            shape.x = x;
            shape.y = y;
        } else {
            shape.x = x;
            shape.y = y;
            shape.width = width;
            shape.height = height;
        }
        // 变换回写：编辑器移动/缩放/旋转后的几何与变换统一应用，保证可还原
        shape.rotation = rotation;
        shape.scaleX = scaleX;
        shape.scaleY = scaleY;
    }, [x, y, width, height, rotation, scaleX, scaleY, points]);

    // 聚光遮罩（M5.11）：overlay = children[0]（even-odd 全画布外环 + 开口镂空），
    // hitRect = children[1]（开口命中区）。遮罩 fill=overlayColor+opacity，覆盖整张画布、
    // 开口透明；移动/缩放 Group 时实时重算外环偏移（不依赖 store 防抖回写，与放大镜一致）。
    // 画布尺寸取自 option.frameConf（View 为 observer，画布尺寸变化会重渲染本组件并触发本 effect）。
    const spotCanvasW = stores.option.frameConf?.width ?? width;
    const spotCanvasH = stores.option.frameConf?.height ?? height;
    useEffect(() => {
        if (type !== 'spotlight') return;
        const overlay = shape.children && shape.children[0];
        const hitRect = shape.children && shape.children[1];
        if (!overlay || !hitRect) return;
        const eff = effect || {};
        const cornerRadius = eff.cornerRadius ?? 0;
        const apply = () => {
            const gx = shape.x, gy = shape.y, gw = shape.width, gh = shape.height;
            overlay.path = buildSpotlightPath(-gx, -gy, gw, gh, spotCanvasW, spotCanvasH, cornerRadius);
            overlay.fill = eff.overlayColor ?? '#000000';
            overlay.opacity = eff.opacity ?? 0.5;
            hitRect.width = gw;
            hitRect.height = gh;
        };
        apply();
        const onChange = (arg) => {
            if (!['x', 'y', 'width', 'height'].includes(arg.attrName)) return;
            apply();
        };
        shape.on(PropertyEvent.CHANGE, onChange);
        return () => shape.off(PropertyEvent.CHANGE, onChange);
    }, [x, y, width, height, spotCanvasW, spotCanvasH, effect && effect.cornerRadius, effect && effect.opacity, effect && effect.overlayColor]);

    useEffect(() => {
        if (type === 'SquareFill') shape.fill = fill;
        if (['Circle', 'Slash', 'MoveDownLeft', 'Pencil', 'Square'].includes(type)) shape.stroke = fill;
        if (type === 'Step') {
            const oldFill = [].concat(shape.fill);
            oldFill[0].color = fill;
            shape.fill = oldFill;
        }
    }, [fill]);

    useEffect(() => {
        if (['Circle', 'Magnifier', 'Slash', 'MoveDownLeft', 'Pencil', 'Step', 'Square'].includes(type)) shape.strokeWidth = strokeWidth;
    }, [strokeWidth]);

    useEffect(() => {
        shape.editable = !!editable;
    }, [editable]);

    // 文字标注：把内容与 textStyle 同步到 Text 节点（供属性面板修改、历史恢复后重建）。
    // 注意：双击编辑期间由 @leafer-in/text-editor 直接改节点且不触发本 effect（store 未变），
    // 关闭编辑时由 View 统一回写 store，故无反馈循环。
    useEffect(() => {
        if (type !== 'text') return;
        const ts = textStyle || {};
        shape.text = text ?? '';
        shape.fontSize = ts.fontSize ?? 24;
        shape.fontWeight = ts.fontWeight ?? 'normal';
        shape.fill = ts.fill ?? fill;
        shape.textAlign = ts.textAlign ?? 'left';
        shape.padding = ts.padding ?? 0;
        shape.cornerRadius = ts.cornerRadius ?? 0;
        shape.background = ts.backgroundColor || undefined;
    }, [text, textStyle, fill]);

    // 区域效果（模糊/马赛克，M5.9/M5.10）：取共享底图快照的处理变体作 clip fill，
    // 按自身位置设 offset 显示对应局部。变体由 baseSnapshot 按 revision+参数缓存，
    // 底图变化时自动失效（N-44：快照不含效果自身）。移动时只更新 offset，不重新生成（N-49）。
    const [regionVariant, setRegionVariant] = useState(null);
    useEffect(() => {
        if (type !== 'blur' && type !== 'mosaic') return;
        const eff = effect || {};
        const param = type === 'blur' ? (eff.strength ?? 8) : (eff.blockSize ?? 12);
        const gen = type === 'blur'
            ? (raw) => blurSnapshot(raw, param)
            : (raw) => mosaicSnapshot(raw, param);
        let cancelled = false;
        // snap 为空时 getVariant 内部会触发底图快照生成（schedule）并返回 null；
        // 快照就绪后 onUpdate → snap 变化 → 本 effect 重跑，取到处理变体。
        baseSnapshot.getVariant(stores.editor, `${type}:${param}`, gen).then((v) => {
            if (!cancelled && v) setRegionVariant(v);
        });
        return () => { cancelled = true; };
        // 仅在底图 / 类型 / 效果参数变化时重新取变体，避免每次渲染空跑
    }, [snap, type, effect && effect.strength, effect && effect.blockSize]);

    useEffect(() => {
        if ((type !== 'blur' && type !== 'mosaic') || !regionVariant) return;
        const applyFill = () => {
            // 快照为 2x：逻辑坐标 (x,y) 对应快照像素 (x*2,y*2)；offset = -x*2 使该点对齐 Rect 左上角。
            shape.fill = [{
                type: 'image',
                url: regionVariant.data,
                mode: 'clip',
                size: { width: regionVariant.width, height: regionVariant.height },
                offset: { x: -shape.x * 2, y: -shape.y * 2 }
            }];
            shape.cornerRadius = (effect && effect.cornerRadius) ?? 0;
        };
        applyFill();
        // 编辑器移动 Rect 时实时更新 offset，保证拖动中对准底图且不重新生成位图（N-49）
        const onChange = (arg) => {
            if (!['x', 'y'].includes(arg.attrName)) return;
            applyFill();
        };
        shape.on(PropertyEvent.CHANGE, onChange);
        return () => shape.off(PropertyEvent.CHANGE, onChange);
    }, [regionVariant, effect && effect.cornerRadius]);

    useEffect(() => {
        if (type !== 'Magnifier') return;
        if (shape.fill && snap) {
            const oldFill = [].concat(shape.fill);
            oldFill[1] = Object.assign({}, oldFill[1], { url: snap.data, size: { width: snap.width, height: snap.height } });
            shape.fill = oldFill;
        }
        const offset = {x:0,y:0};
        const fillBg = debounce(() => {
            const x = -shape.x * 2 - shape.width / 2;
            const y = -shape.y * 2 - shape.height / 2;
            if (offset.x === x && offset.y === y) return;
            offset.x = x;
            offset.y = y;
            shape.fill = [
                { type: 'solid', color: '#ffffff' },
                {
                    type: 'image',
                    url: snap.data,
                    mode: 'clip',
                    size: {
                        width: snap.width,
                        height: snap.height
                    },
                    offset
                },
                {
                    type: 'linear',
                    from: 'top',
                    to: 'bottom',
                    stops: [
                        { offset: 0, color: '#ffffffaa' },
                        { offset: 0.48, color: '#ffffff00'}
                    ]
                }
            ];
        }, 5);
        shape.on(PropertyEvent.CHANGE, (arg) => {
            if (!snap?.data) return;
            if (!['x', 'y', 'width', 'height'].includes(arg.attrName)) return;
            fillBg();
        });
        return (() => {
            shape.off(PropertyEvent.CHANGE);
        })
    }, [snap]);

    useEffect(() => {
        parent.add(shape);
        return (() => {
            shape.remove();
        })
    }, [parent]);
    return null;
}