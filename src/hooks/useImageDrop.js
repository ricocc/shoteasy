import { useState } from 'react';
import { supportImg } from '@utils/utils';

const isFileDrag = (event) => Array.from(event.dataTransfer?.types || []).includes('Files');

export default (onFile, onInvalid) => {
    const [isDragging, setIsDragging] = useState(false);

    const onDragEnter = (event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        setIsDragging(true);
    };

    const onDragOver = (event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const onDragLeave = (event) => {
        if (!isFileDrag(event)) return;
        if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
        setIsDragging(false);
    };

    const onDrop = async (event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        setIsDragging(false);
        const file = Array.from(event.dataTransfer.files || []).find((item) => supportImg.includes(item.type));
        if (!file) {
            onInvalid?.();
            return;
        }
        try {
            await onFile?.(file);
        } catch {
            onInvalid?.();
        }
    };

    return {
        isDragging,
        dragProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
    };
};
