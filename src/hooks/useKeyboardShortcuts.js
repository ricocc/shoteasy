import { useEffect, useRef } from "react"
import { tinykeys } from "tinykeys"

// 焦点在可编辑元素（输入框/文本域/下拉/富文本）内时返回 true。
// 此时快捷键不劫持事件，保留浏览器原生行为——例如 Ctrl+C 复制输入框里选中的文本，
// 而不是触发「复制画布图片」。
const isEditableTarget = (target) => {
    if (!target || typeof target.isContentEditable !== 'boolean') return false;
    return target.isContentEditable
        || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

export default function useKeyboardShortcuts(toSave, toCopy, dependencies) {
    const save = useRef(toSave);
    const copy = useRef(toCopy);

    useEffect(() => {
        save.current = toSave;
        copy.current = toCopy;
    }, [...dependencies]);

    useEffect(() => {
        const unsubscribe = tinykeys(window, {
            "$mod+KeyS": event => {
                event.preventDefault()
                save.current && save.current();
            },
            "$mod+KeyC": event => {
                if (isEditableTarget(event.target)) return;
                event.preventDefault()
                copy && copy.current();
            }
        })
        return () => {
            unsubscribe();
        }
    }, [window]);
}
