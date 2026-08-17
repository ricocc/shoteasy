import { customAlphabet } from 'nanoid/non-secure';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isAppleDevice = () => {
    const PLATFORM = typeof navigator === 'object' ? navigator.platform : '';
    return /Mac|iPod|iPhone|iPad/.test(PLATFORM);
};

export const modKey = isAppleDevice() ? '⌘' : 'Ctrl';

export const supportImg = [
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/webp',
];

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// 7-character random string
export const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    7
);

export const toDownloadFile = async (data, name) => {
    let objectUrl = '';
    let href = '';

    if (data instanceof Blob) {
        objectUrl = URL.createObjectURL(data);
        href = objectUrl;
    } else if (typeof data === 'string' && data.startsWith('data:')) {
        const response = await fetch(data);
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        href = objectUrl;
    } else if (typeof data === 'string') {
        href = data;
    } else {
        throw new Error('Unsupported download payload');
    }

    const tmpLink = document.createElement('a');
    tmpLink.href = href;
    tmpLink.download = name;
    tmpLink.style.position = 'fixed';
    tmpLink.style.left = '-9999px';
    tmpLink.style.top = '-9999px';
    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);

    if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    }
};

export const computedSize = (w, h, maxWidth = 950, maxHeight = 450) => {
    let width = w;
    let height = h;

    // 检查图片是否超过最大宽度
    if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
    }

    // 检查图片是否超过最大高度
    if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
    }
    return { width: Math.round(width), height: Math.round(height) };
};

export const getImage = (src) => {
    const img = new Image();
    // cors
    if (!src.startsWith('data')) {
        img.crossOrigin = 'Anonymous';
    }
    return new Promise(function (resolve, reject) {
        img.onload = function () {
            resolve(img);
        };
        const errorHandler = function () {
            return reject(
                new Error('An error occurred attempting to load image')
            );
        };
        img.onerror = errorHandler;
        img.onabort = errorHandler;
        img.src = src;
    });
};

export const getMargin = (width, height, r = 0.15) => {
    const min = Math.min(width, height);
    return Math.round(min * r);
};

// 自动尺寸下画布保持与初始页一致的 4:3：以「图片 + 15% 边距」为下限推导 4:3 外接框，
// 更宽/更高的截图在富余方向留出背景带（截图在框内等比居中，见 Screenshot 布局）。
export const getDefaultFrameSize = (width, height) => {
    const margin = getMargin(width, height);
    const frameWidth = Math.max(width + margin, Math.round((height + margin) * 4 / 3));
    return { width: frameWidth, height: Math.round(frameWidth * 3 / 4) };
};

// type: ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right']
export const getPosition = (type, xw, xh) => {
    if (type === 'top-left')
        return {
            x: 0,
            y: 0,
        };
    if (type === 'top')
        return {
            x: xw / 2,
            y: 0,
        };
    if (type === 'top-right')
        return {
            x: xw,
            y: 0,
        };
    if (type === 'left')
        return {
            x: 0,
            y: xh / 2,
        };
    if (type === 'right')
        return {
            x: xw,
            y: xh / 2,
        };
    if (type === 'bottom-left')
        return {
            x: 0,
            y: xh,
        };
    if (type === 'bottom')
        return {
            x: xw / 2,
            y: xh,
        };
    if (type === 'bottom-right')
        return {
            x: xw,
            y: xh,
        };
    return { x: xw / 2, y: xh / 2 };
};

// 旋转后的截图使用外框包围盒对齐，返回旋转中心坐标。
export const getRotatedPosition = (type, width, height, frameWidth, frameHeight) => {
    const horizontal = type.includes('left') ? width / 2 : type.includes('right') ? frameWidth - width / 2 : frameWidth / 2;
    const vertical = type.includes('top') ? height / 2 : type.includes('bottom') ? frameHeight - height / 2 : frameHeight / 2;
    return { x: horizontal, y: vertical };
};

export const calculateRotatedRectDimensions = (width, height, angleDegrees) => {
    const angleRadians = angleDegrees * (Math.PI / 180);
    const newWidth =
        Math.abs(width * Math.cos(angleRadians)) +
        Math.abs(height * Math.sin(angleRadians));
    const newHeight =
        Math.abs(width * Math.sin(angleRadians)) +
        Math.abs(height * Math.cos(angleRadians));

    return {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
    };
};

export function toBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const svgToDataURL = (svgStr) => {
    const encoded = encodeURIComponent(svgStr).replace(/'/g, '%27').replace(/"/g, '%22');

    const header = 'data:image/svg+xml,';
    const dataUrl = header + encoded;

    return dataUrl;
};

export const text2Svg = ({ text, color, angleDegrees }) => {
    const div = document.createElement('div');
    div.style = `text-align:center;white-space:nowrap;line-height:100px;transform: rotate(${angleDegrees}deg);position: absolute;top:0;left:0;opacity: 0;`;
    const span = document.createElement('span');
    span.style.color = color;
    span.style.fontSize = '36px';
    span.innerText = text;
    div.append(span);
    document.body.append(div);
    const { width, height } = div.getBoundingClientRect();
    document.body.removeChild(div);
    const result = calculateRotatedRectDimensions(width, height, angleDegrees);
    const divHtml = `
        <div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;white-space:nowrap;line-height:${result.height}px;transform:rotate(${angleDegrees}deg);">
            <span style="color:${color};font-size:36px;">${text}</span>
        </div>
    `;
    const data = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${result.width} ${result.height}" width="${result.width}" height="${result.height}">
                <foreignObject width="100%" height="100%">
                    ${divHtml}
                </foreignObject>
            </svg>`;
    const url = svgToDataURL(data);
    return url;
};

export const enhanceImageToHdr = async (src) => {
    if (!src) return src;
    try {
        const image = await getImage(src);
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) return src;

        context.filter = 'saturate(1.35) contrast(1.18) brightness(1.08)';
        context.drawImage(image, 0, 0, width, height);

        context.globalAlpha = 0.14;
        context.globalCompositeOperation = 'screen';
        context.drawImage(canvas, 0, 0, width, height);

        return canvas.toDataURL('image/png');
    } catch {
        return src;
    }
};

export const numSvg = (num, size = 44) => {
    const boxSize = Math.max(1, Math.round(Number(size) || 44));
    const fontSize = Math.max(12, Math.round(boxSize * 19 / 32));
    const data = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxSize} ${boxSize}" width="${boxSize}" height="${boxSize}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;white-space:nowrap;line-height:${boxSize}px;">
                        <span style="color:#ffffff;font-size:${fontSize}px;font-weight:700;font-family:'JetBrains Mono',monospace;">${num}</span>
                    </div>
                </foreignObject>
            </svg>`;
    const url = svgToDataURL(data);
    return url;
};
