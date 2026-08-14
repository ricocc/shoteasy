import { getImage, getMargin } from '@utils/utils';

export default (stores) => {
    const getFile = async (file, type = 'blob', options = {}) => {
        const DOMURL = window.URL || window.webkitURL || window;
        const imgUrl = type === 'blob' ? DOMURL.createObjectURL(file) : file;
        let image;
        try {
            image = await getImage(imgUrl);
        } catch (error) {
            if (type === 'blob' && typeof DOMURL.revokeObjectURL === 'function') {
                DOMURL.revokeObjectURL(imgUrl);
            }
            throw error;
        }
        const width = Math.round(image.width);
        const height = Math.round(image.height);
        const nextImage = {
            src: imgUrl,
            width,
            height,
            type: type === 'blob' ? file.type : 'image/png',
            name: type === 'blob' ? file.name : 'ShotEasy.png'
        };
        if (options.replace) {
            stores.editor.replaceImg(nextImage);
        } else {
            stores.editor.setImg(nextImage);
        }
        if (stores.option.size.type === 'auto') {
            const margin = getMargin(width, height);
            stores.option.setFrameSize(width + margin, height + margin);
        }
        if (options.replace) stores.history?.reset?.();
    }
    return getFile;
}
