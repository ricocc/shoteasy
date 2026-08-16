/**
 * Leafer 编辑器内嵌图标的 data-URI（图标体系 M2.9 的 URL 形态补充）。
 *
 * Leafer 的 rotatePoint 图片填充与 Cursor.set 自定义光标只接受 URL，
 * 无法直接渲染 mage-icons-react 的 React 组件，因此这里用图标库同源的
 * path 数据（mage-icons/stroke 24×24 网格）生成内联 SVG data-URI，
 * 颜色遵循 design.md 的电光蓝强调色，替代原二进制 PNG 资产
 * （rotate.png / pencil.png）。
 */

const svgToDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

// mage-icons/stroke/EditPenIcon：钢笔（笔身 / 分隔线 / 底线）
const PENCIL = [
    'M4.14436 16.7345L4.63696 13.3098C4.66395 13.0863 4.76757 12.8791 4.93017 12.7234L14.5945 3.05905C14.7188 2.93238 14.8738 2.83993 15.0443 2.79062C15.2148 2.74131 15.3952 2.73682 15.5679 2.77757C16.4593 3.01504 17.2698 3.4892 17.9137 4.14981C18.5799 4.79112 19.0585 5.60219 19.2976 6.49551C19.335 6.66839 19.3289 6.84786 19.2798 7.01778C19.2306 7.18771 19.14 7.34275 19.0161 7.46898L9.35183 17.1333C9.18497 17.2868 8.97721 17.3886 8.75367 17.4265L5.31722 17.9191C5.15707 17.9408 4.99408 17.9249 4.84109 17.8729C4.68809 17.8208 4.54928 17.7339 4.43558 17.6191C4.32187 17.5043 4.23639 17.3646 4.18585 17.2111C4.13532 17.0576 4.12112 16.8944 4.14436 16.7345Z',
    'M12.7766 4.8887L17.1865 9.2869',
    'M3.79002 21.25H20.21',
];

/** 旋转手柄：白色工具面 + 电光蓝语义色，在深色外框上保持清晰。 */
export const rotateHandleUrl = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10.75" fill="#ffffff" stroke="#0066ff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="8.75" stroke="#171717" stroke-opacity="0.14"/>
    <path d="M16.9 9.15A5.5 5.5 0 1 0 17.15 14.35" stroke="#0066ff" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M16.9 5.9V9.15H13.65" stroke="#0066ff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

/** 主截图关闭按钮：与旋转按钮共用白色工具面，危险操作使用站点 danger 色。 */
export const closeHandleUrl = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10.75" fill="#ffffff" stroke="#d84a4a" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="8.75" stroke="#171717" stroke-opacity="0.14"/>
    <path d="M8.4 8.4L15.6 15.6M15.6 8.4L8.4 15.6" stroke="#d84a4a" stroke-width="1.9" stroke-linecap="round"/>
</svg>
`);

/** 画笔光标：电光蓝钢笔 + 白色描边光晕；热点取笔尖（约 4,17）。 */
export const pencilCursor = { url: svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#ffffff" stroke-width="4">${PENCIL.map((d) => `<path d="${d}"/>`).join('')}</g>
    <g stroke="#0066ff" stroke-width="1.6">${PENCIL.map((d) => `<path d="${d}"/>`).join('')}</g>
</svg>
`), x: 4, y: 17 };
