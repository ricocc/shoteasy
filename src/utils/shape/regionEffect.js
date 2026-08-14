/**
 * 区域效果（模糊/马赛克）位图生成器（M5.9/M5.10）。
 *
 * 输入为共享底图快照 { data, width, height }（pixelRatio 2，见 baseSnapshot.js），
 * 输出与输入同尺寸的「处理后完整位图」，供效果 Rect 作 clip fill + offset 显示对应局部
 * （technical-design.md「区域效果实现 · 模糊/马赛克」）。
 *
 * 变体按 revision + 参数由 baseSnapshot.getVariant 缓存；底图变化时整体失效。
 * 这里只做纯位图处理，不关心 revision/缓存。
 */

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('regionEffect: image load failed'));
        img.src = src;
    });
}

/**
 * 对底图快照施加高斯模糊。
 * @param strength 逻辑像素模糊半径；快照为 2x，故 canvas filter 半径 = strength * 2。
 */
export async function blurSnapshot(raw, strength = 8) {
    if (!raw || !raw.data) return raw;
    const img = await loadImage(raw.data);
    const canvas = document.createElement('canvas');
    canvas.width = raw.width;
    canvas.height = raw.height;
    const ctx = canvas.getContext('2d');
    const r = Math.max(0, Number(strength) || 0) * 2;
    ctx.filter = r > 0 ? `blur(${r}px)` : 'none';
    ctx.drawImage(img, 0, 0, raw.width, raw.height);
    return { data: canvas.toDataURL('image/png'), width: raw.width, height: raw.height };
}

/**
 * 将底图快照降采样到块分辨率（开启平滑做平均），再最近邻放大得到马赛克。
 * @param blockSize 逻辑像素块大小；快照为 2x，故每块占 blockSize * 2 个快照像素。
 */
export async function mosaicSnapshot(raw, blockSize = 12) {
    if (!raw || !raw.data) return raw;
    const img = await loadImage(raw.data);
    const blockPx = Math.max(2, Number(blockSize) || 12) * 2;
    const sw = Math.max(1, Math.round(raw.width / blockPx));
    const sh = Math.max(1, Math.round(raw.height / blockPx));
    // 先缩小：开启平滑，使每块取区域平均色
    const small = document.createElement('canvas');
    small.width = sw;
    small.height = sh;
    const sctx = small.getContext('2d');
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(img, 0, 0, sw, sh);
    // 再放大：关闭平滑，得到清晰的块状边缘
    const canvas = document.createElement('canvas');
    canvas.width = raw.width;
    canvas.height = raw.height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, sw, sh, 0, 0, raw.width, raw.height);
    return { data: canvas.toDataURL('image/png'), width: raw.width, height: raw.height };
}

/**
 * 单个（圆角）矩形 SVG 路径。r<=0 退化为直角矩形。
 */
function roundedRectPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if (r <= 0) {
        return `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`;
    }
    return `M${x + r},${y} L${x + w - r},${y} A${r},${r} 0 0 1 ${x + w},${y + r} L${x + w},${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} L${x + r},${y + h} A${r},${r} 0 0 1 ${x},${y + h - r} L${x},${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

/**
 * 聚光遮罩路径（M5.11）：一个覆盖整张画布的矩形外环 + 一个圆角开口，
 * 配合 windingRule:'evenodd' 使开口成为镂空——填充区域为「全画布减开口」，
 * 用作半透明遮罩 fill，实现「遮罩覆盖全画布、开口透明」（acceptance N-46）。
 *
 * 坐标为聚光 Group 的本地坐标：Group 原点对齐开口左上角，故
 *   外环 = (-x, -y, canvasW, canvasH)（使外环覆盖整张画布的绝对位置）；
 *   开口 = (0, 0, w, h)。
 *
 * @param localX  外环左上 x = -开口.x（Group 本地）
 * @param localY  外环左上 y = -开口.y
 * @param w       开口宽（= Group 宽）
 * @param h       开口高（= Group 高）
 * @param canvasW 画布（Frame）宽
 * @param canvasH 画布（Frame）高
 * @param cornerRadius 开口圆角
 */
export function buildSpotlightPath(localX, localY, w, h, canvasW, canvasH, cornerRadius = 0) {
    const outer = `M${localX},${localY} L${localX + canvasW},${localY} L${localX + canvasW},${localY + canvasH} L${localX},${localY + canvasH} Z`;
    return outer + roundedRectPath(0, 0, w, h, cornerRadius);
}
