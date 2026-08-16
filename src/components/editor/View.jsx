import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { App, ResizeEvent, ZoomEvent, DragEvent, PointerEvent, Cursor } from 'leafer-ui';
import { EditorMoveEvent, EditorScaleEvent, EditorRotateEvent, InnerEditorEvent } from '@leafer-in/editor';
import '@leafer-in/text-editor';
import debounce from 'lodash/debounce';
import { addListener, removeListener } from 'resize-detector';
import { rotateHandleUrl, pencilCursor } from '@utils/editorIconUrls';
import stores from '@stores';
import FrameBox from './layers/FrameBox';
import Screenshot from './layers/Screenshot';
import Watermark from './layers/Watermark';
import ShapeLine from './layers/ShapeLine';
import { ScrollBar } from '@leafer-in/scroll'
import { nanoid } from '@utils/utils';
import HotKeys from './HotKeys';
import '@leafer-in/view';
import '@leafer-in/viewport';

Cursor.set('pencil', pencilCursor);

export default observer(function View({ target }) {
    useEffect(() => {
        // React StrictMode 会先执行一次模拟 cleanup，再重新 setup：
        // 1) 取消上一次调度中的完整销毁（避免恢复中的 shapes/background 被误清空）；
        // 2) 销毁模拟 cleanup 前创建的旧 app——只清画布、保留 store 状态，
        //    否则旧 view 残留占位，新 app 被挤出视口导致指针事件失效。
        stores.editor.cancelScheduledDestroy();
        stores.editor.destroyApp();
        const app = new App({
            view: target,
            editor: {
                lockRatio: 'corner',
                stroke: '#0099ff',
                skewable: false,
                hover: false,
                middlePoint: { cornerRadius: 100, width: 20, height: 6 },
                rotatePoint: {
                    width: 20,
                    height: 20,
                    fill: {
                        type: 'image',
                        url: rotateHandleUrl,
                    },
                },
            },
            tree: {
                type: 'viewport',
                usePartRender: true,
            },
            sky: {
                type: 'draw',
                usePartRender: true,
            },
        });
        new ScrollBar(app);

        stores.editor.setApp(app);

        app.tree.on(ZoomEvent.ZOOM, () => {
            stores.editor.setScale(app.tree.scale);
        });
        app.tree.on(ResizeEvent.RESIZE, () => {
            stores.editor.setScale(app.tree.scale);
        });

        app.editor.on(EditorMoveEvent.SELECT, (event) => {
            const { list } = event;
            // 单选时同步选中标注 id，驱动右侧「文字」属性面板；多选/无选清空。
            stores.editor.setSelectedId(list.length === 1 ? list[0].id : null);
            if (list.length < 2) return;
            if (list.some(e => e.tag === 'Magnifier')) {
                app.editor.config.rotateable = false;
                app.editor.config.lockRatio = true;
            } else {
                app.editor.config.rotateable = true;
                app.editor.config.lockRatio = false;
            }
        });

        // 文字标注双击编辑结束（@leafer-in/text-editor 关闭）后，把编辑后的内容回写 store 并入历史。
        // CLOSE 事件在 editTarget 被置空前触发，且 onUnload 已执行 onInput，故 node.text 为最终值。
        app.editor.on(InnerEditorEvent.CLOSE, (event) => {
            const node = event.editTarget;
            if (!node) return;
            const shape = stores.editor.getShape(node.id);
            if (!shape || shape.type !== 'text') return;
            const next = node.text == null ? '' : String(node.text);
            if (shape.text !== next) {
                stores.editor.updateShape({ ...shape, text: next });
                stores.history.commit('text:edit');
            }
        });

        // 同步编辑器移动/缩放/旋转结果到 shape store。
        // 监听三类变换事件，用 trailing debounce 仅在交互结束后回写最终几何，
        // 避免拖拽过程中高频写回与 LeaferJS 节点产生反馈循环。
        // 几何签名用于判断是否真正变化：选中点击等无位移事件不会产生空提交，
        // 避免给历史栈留下冗余的 no-op 撤销步。
        const geomSig = (s) => JSON.stringify([
            +((s.x ?? 0).toFixed(2)),
            +((s.y ?? 0).toFixed(2)),
            +((s.width ?? 0).toFixed(2)),
            +((s.height ?? 0).toFixed(2)),
            +((s.rotation ?? 0).toFixed(2)),
            +((s.scaleX ?? 1).toFixed(3)),
            +((s.scaleY ?? 1).toFixed(3)),
            s.points ? s.points.map((v) => +(v.toFixed(2))) : null,
        ]);
        const syncSelectionGeometry = debounce(() => {
            const ed = app.editor;
            if (!ed) return;
            const { list } = ed;
            if (!list || !list.length) return;
            let changed = false;
            for (const node of list) {
                const shape = stores.editor.getShape(node.id);
                if (!shape) continue;
                const update = {
                    ...shape,
                    x: node.x,
                    y: node.y,
                    rotation: node.rotation ?? 0,
                    scaleX: node.scaleX ?? 1,
                    scaleY: node.scaleY ?? 1
                };
                if (['Slash', 'MoveDownLeft', 'Pencil'].includes(shape.type)) {
                    // 线条类：同步 points（位移与尺寸都体现在 points / x / y 上）
                    if (node.points) update.points = Array.from(node.points);
                } else if (shape.type !== 'Step' && shape.type !== 'text') {
                    update.width = node.width;
                    update.height = node.height;
                }
                if (geomSig(shape) !== geomSig(update)) {
                    changed = true;
                    stores.editor.updateShape(update);
                }
            }
            // 仅在几何真正变化时入历史；变换类操作合并为一步
            // （连续微调在同一拖拽手势内不产生多步）
            if (changed) stores.history.commit('transform');
        }, 200);
        app.editor.on(EditorMoveEvent.MOVE, syncSelectionGeometry);
        app.editor.on(EditorScaleEvent.SCALE, syncSelectionGeometry);
        app.editor.on(EditorRotateEvent.ROTATE, syncSelectionGeometry);
        
        let shapeId = null;
        const onStart = (arg) => {
            if (!stores.editor.useTool) return;
            const { target } = arg;
            const shape = stores.editor.getShape(target.id);
            if (shape) return;
            shapeId = nanoid();
            const size = arg.getPageBounds ? arg.getPageBounds() : arg.getPage();
            const type = stores.editor.useTool;
            const newShape = {
                id: shapeId,
                type,
                fill: stores.editor.annotateColor,
                strokeWidth: stores.editor.strokeWidth,
                zIndex: stores.editor.shapes.size + 1,
                ...size
            };
            if (type === 'blur') newShape.effect = { strength: 8, cornerRadius: 0 };
            else if (type === 'mosaic') newShape.effect = { blockSize: 12, cornerRadius: 0 };
            else if (type === 'spotlight') newShape.effect = { overlayColor: '#000000', opacity: 0.5, cornerRadius: 0 };
            return newShape;
        }
        app.tree.on(PointerEvent.DOWN, (arg) => {
            const type = stores.editor.useTool;
            if (type !== 'Step' && type !== 'text') return;
            const newShape = onStart(arg);
            if (!newShape) return;
            if (type === 'Step') {
                newShape.text = stores.editor.nextStep;
            } else if (type === 'text') {
                newShape.text = '双击编辑文字';
                newShape.textStyle = {
                    fontSize: 24,
                    fontWeight: 'normal',
                    fill: stores.editor.annotateColor,
                    textAlign: 'left',
                    backgroundColor: null,
                    padding: 0,
                    cornerRadius: 0,
                };
            }
            newShape.editable = true;
            stores.editor.addShape(newShape);
            shapeId = null;
            stores.editor.setUseTool(null);
            stores.history.commit();
        });
        app.tree.on(DragEvent.START, (arg) => {
            const type = stores.editor.useTool;
            if (type === 'Step') return;
            const newShape = onStart(arg);
            if (!newShape) return;
            if (['Slash', 'MoveDownLeft', 'Pencil'].includes(type)) {
                newShape.points = [newShape.x, newShape.y];
            }
            stores.editor.addShape(newShape);
        });
        app.tree.on(DragEvent.DRAG, (arg) => {
            if (!stores.editor.useTool) return;
            if (!shapeId) return;
            const shape = stores.editor.getShape(shapeId);
            if (!shape) return;
            const size = arg.getPageBounds();
            const max = Math.max(size.width, size.height);
            if (shape.type === 'Magnifier') {
                size.width = max;
                size.height = max;
            }
            const newShape = Object.assign({}, shape, size);
            const { points, type } = newShape;
            if (points && points.length) {
                const { x, y } = arg.getInnerTotal();
                const newX = x > 0 ? size.x + x : size.x;
                const newY = y > 0 ? size.y + y : size.y;
                if (type === 'Pencil') {
                    newShape.points = [...points, newX, newY];
                } else {
                    newShape.points = [points[0], points[1], newX, newY];
                }
            }
            stores.editor.addShape(newShape);
        });
        app.tree.on(DragEvent.END, () => {
            if (!stores.editor.useTool) return;
            if (!shapeId) return;
            const shape = stores.editor.getShape(shapeId);
            if (shape) {
                if ((shape.width === 0 || shape.height === 0) && !['Slash', 'MoveDownLeft', 'Pencil'].includes(shape.type)) {
                    stores.editor.removeShape(shape);
                } else {
                    stores.editor.addShape(Object.assign({}, shape, {editable: true}));
                    stores.history.commit();
                }
            }
            shapeId = null;
            if (stores.editor.useTool !== 'Pencil') stores.editor.setUseTool(null);
        });
        // 监听容器变化
        const onResize = debounce(() => {
            const { width, height } = target.getBoundingClientRect();
            app.tree.zoom('fit', 100);
            if (stores.option.frameConf.width < width && stores.option.frameConf.height < height) {
                app.tree.zoom(1);
            }
        }, 50);

        addListener(target, onResize);

        return (() => {
            removeListener(target, onResize);
            stores.editor.scheduleDestroy();
        });
    }, [target]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const { width, height } = target.getBoundingClientRect();
            stores.editor.app.tree.zoom('fit', 100);
            if (stores.option.frameConf.width < width && stores.option.frameConf.height < height) {
                stores.editor.app.tree.zoom(1);
            }
            stores.editor.setScale(stores.editor.app.tree.scale);
        }, 20);
        return (() => {
            clearTimeout(timer);
        })
    }, [stores.option.frameConf.width, stores.option.frameConf.height]);

    // 进入编辑器或换图时，以当前项目状态重建历史基线（不可撤销到换图/进入前）。
    // defaultImg 变化也会导致 img.src 变化，由此一并覆盖。
    useEffect(() => {
        stores.history.reset();
    }, [stores.editor.img?.src]);

    if (!stores.editor.app?.tree) return null;
    return (<>
        <FrameBox parent={stores.editor.app.tree} cursor={stores.editor.cursor} {...stores.option.frameConf}>
            {stores.editor.shapesList.map((item) => {
                const { id, type } = item;
                const needSnap = type === 'Magnifier' || type === 'blur' || type === 'mosaic';
            const props = Object.assign({}, item, needSnap ? {snap: stores.editor.snap} : {});
                return <ShapeLine key={id} {...props} />;
            })}
            {stores.editor.img?.src && <Screenshot />}
            {stores.option.waterImg && <Watermark />}
        </FrameBox>
        <HotKeys />
    </>);
});
