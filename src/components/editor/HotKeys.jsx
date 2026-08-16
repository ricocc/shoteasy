import { useEffect } from "react"
import { tinykeys } from "tinykeys"
import { observer } from 'mobx-react-lite';
import stores from '@stores';

export default observer(function HotKeys() {
    useEffect(() => {
        const deleteItem = () => {
            const editorTarget = stores.editor.app?.editor;
            const list = editorTarget?.list;
            if (list?.length) {
                for (let item of list) {
                    item.remove();
                    stores.editor.removeShape(item);
                }
                editorTarget?.cancel();
                stores.history.commit();
            }
        };
        const handleZoom = type => {
            if (type === 'fit') {
                stores.editor.app?.tree.zoom(type, 100);
            } else {
                stores.editor.app?.tree.zoom(type);
            }
            stores.editor.setScale(stores.editor.app.tree.scale);
        }
        const unsubscribe = tinykeys(window, {
            'Backspace': deleteItem,
            'Delete': deleteItem,
            '$mod+KeyZ': event => {
                event.preventDefault();
                stores.history.undo();
            },
            '$mod+Shift+KeyZ': event => {
                event.preventDefault();
                stores.history.redo();
            },
            '$mod+Minus': event => {
                event.preventDefault();
                handleZoom('out');
            },
            '$mod+Equal': event => {
                event.preventDefault();
                handleZoom('in');
            },
            '$mod+Digit0': event => {
                event.preventDefault();
                handleZoom('fit');
            }
        });
        return () => {
            unsubscribe();
        }
    }, [window]);
    return null;
});