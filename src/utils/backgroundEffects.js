/**
 * 背景轻量效果（M4.11/M4.12/M4.13）。
 *
 * - 模糊（blur）：离屏 Canvas 用 ctx.filter=blur 处理图片背景，生成缓存 data URL；
 *   画图时向外扩展（bleed）避免模糊后边缘出现透明。纯色/渐变不模糊。
 * - 遮罩（mask）：半透明纯色，覆盖在背景之上，低于所有子节点（作为 Frame fill 的上层 paint）。
 * - 噪点（noise）：本地生成的小尺寸 PNG 瓦片，以 repeat 平铺；强度直接烘焙进瓦片 alpha。
 *
 * 所有效果均由 option 字段门控（默认关闭）。buildLayeredFill 在没有任何效果生效时
 * 原样返回 base paint，保证默认导出与无效果时像素一致。
 */
import { TinyColor } from '@ctrl/tinycolor';

const blurCache = new Map();
const BLUR_CACHE_MAX = 12;

const loadImage = (url) => new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') { reject(new Error('no-image')); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image-load-failed'));
    img.src = url;
});

/**
 * 将图片 URL 处理为带高斯模糊的 PNG data URL。失败时抛错，由调用方回退到原图。
 */
export async function blurImageUrl(url, blur) {
    if (!url || !blur || blur <= 0) return null;
    const key = `${url}|${blur}`;
    if (blurCache.has(key)) return blurCache.get(key);
    const img = await loadImage(url);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('invalid-image');
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no-ctx');
    ctx.filter = `blur(${blur}px)`;
    // 向外扩展绘制，避免模糊后画布边缘出现半透明
    const pad = Math.ceil(blur * 2);
    ctx.drawImage(img, -pad, -pad, w + pad * 2, h + pad * 2);
    const dataUrl = canvas.toDataURL('image/png');
    blurCache.set(key, dataUrl);
    if (blurCache.size > BLUR_CACHE_MAX) blurCache.delete(blurCache.keys().next().value);
    return dataUrl;
}

const noiseCache = new Map();
/**
 * 生成本地噪点瓦片 PNG data URL（128×128），强度（0..1）烘焙进像素 alpha。
 * 同一强度只生成一次（缓存）。返回 null 表示无噪点。
 */
export function generateNoiseDataUrl(intensity) {
    if (!intensity || intensity <= 0) return null;
    if (noiseCache.has(intensity)) return noiseCache.get(intensity);
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = Math.floor(Math.random() * 255 * intensity);
    }
    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL('image/png');
    noiseCache.set(intensity, url);
    return url;
}

const withAlpha = (color, opacity) => {
    try {
        return new TinyColor(color).setAlpha(opacity).toRgbString();
    } catch {
        return color;
    }
};

/**
 * 组合背景 paint 数组。无任何效果时原样返回 base（保持默认像素一致）。
 * @param {object} base        基础背景 paint（frameConf.background）
 * @param {string|null} blurredUrl  模糊后的 data URL（仅 blur>0 且 base 为图片时使用）
 * @param {number} blur        模糊半径(px)
 * @param {string|null} maskColor   遮罩颜色
 * @param {number} maskOpacity 遮罩透明度(0..1)，0 表示无遮罩
 * @param {number} noise       噪点强度(0..1)，0 表示无噪点
 */
export function buildLayeredFill({ base, blurredUrl, blur, maskColor, maskOpacity, noise }) {
    if (!base) return base;
    let basePaint = base;
    if (blur > 0 && blurredUrl && base.type === 'image') {
        basePaint = { ...base, url: blurredUrl };
    }
    const paints = [basePaint];
    if (maskColor && maskOpacity > 0) {
        paints.push({ type: 'solid', color: withAlpha(maskColor, maskOpacity) });
    }
    const noiseUrl = generateNoiseDataUrl(noise);
    if (noiseUrl) {
        paints.push({ type: 'image', url: noiseUrl, mode: 'repeat', size: 128 });
    }
    return paints.length === 1 ? paints[0] : paints;
}
