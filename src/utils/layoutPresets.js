// 布局预设只包含二维截图参数。背景、HDR、水印、图片资源和 shapes 明确不在此处。
export const LAYOUT_PRESETS = [
    { id: 'default', title: '默认', scale: 1, rotation: 0, align: 'center', padding: 0, shadow: 3, frame: 'none' },
    { id: 'fill', title: '铺满', scale: 1.08, rotation: 0, align: 'center', padding: 0, shadow: 1, frame: 'none' },
    { id: 'floating', title: '悬浮', scale: 0.82, rotation: 0, align: 'center', padding: 24, shadow: 7, frame: 'card' },
    { id: 'tilt-left', title: '左倾', scale: 0.86, rotation: -6, align: 'left', padding: 24, shadow: 5, frame: 'none' },
    { id: 'tilt-right', title: '右倾', scale: 0.86, rotation: 6, align: 'right', padding: 24, shadow: 5, frame: 'none' },
    { id: 'bottom', title: '底部展示', scale: 0.72, rotation: 0, align: 'bottom', padding: 48, shadow: 5, frame: 'polaroid' },
];

export const getLayoutPreset = (id) => LAYOUT_PRESETS.find((item) => item.id === id) || null;

export default LAYOUT_PRESETS;
