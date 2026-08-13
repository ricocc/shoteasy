import { Rect } from 'leafer-ui';
import { computedSize } from '@utils/utils';
import { windowDark, windowLight } from '@utils/windowsIcon';
import macosIcon from '@utils/macosIcon';
import macbookpro16 from '@assets/macbook-pro-16.png';
import macbookair from '@assets/macbook-air.png';
import imacpro from '@assets/imac-pro.png';
import ipadpro from '@assets/ipadpro.png';
import iphonepro from '@assets/iphonepro.png';

export const DEVICE_FRAME_INFO = {
    macbookpro16: { image: macbookpro16, width: 1920, height: 1266, horizontal: 4 / 5, vertical: 26 / 33, top: 7 / 66 },
    macbookair: { image: macbookair, width: 1920, height: 1147, horizontal: 396 / 500, vertical: 258 / 299, top: 9 / 299 },
    imacpro: { image: imacpro, width: 1920, height: 1599, horizontal: 112 / 125, vertical: 252 / 417, top: 29 / 417 },
    ipadpro: { image: ipadpro, width: 1920, height: 1425, horizontal: 430 / 500, vertical: 302 / 372, top: 35 / 372 },
    iphonepro: { image: iphonepro, width: 968, height: 1920, horizontal: 214 / 253, vertical: 462 / 500, top: 19 / 500 },
};

export const FRAME_DEFINITIONS = [
    { id: 'none', title: '无', group: 'basic', kind: 'none', thumbnail: 'none' },
    { id: 'light', title: '浅描边', group: 'basic', kind: 'stroke', color: '#ffffff80', thumbnail: 'light' },
    { id: 'dark', title: '深描边', group: 'basic', kind: 'stroke', color: '#00000050', thumbnail: 'dark' },
    { id: 'card', title: 'Card', group: 'basic', kind: 'card', inset: 18, thumbnail: 'card' },
    { id: 'stack', title: 'Stack', group: 'basic', kind: 'stack', inset: 26, thumbnail: 'stack' },
    { id: 'stack2', title: 'Stack 2', group: 'basic', kind: 'stack2', inset: 32, thumbnail: 'stack2' },
    { id: 'glassLight', title: 'Glass Light', group: 'basic', kind: 'glass', glass: 'light', inset: 16, thumbnail: 'glass-light' },
    { id: 'glassDark', title: 'Glass Dark', group: 'basic', kind: 'glass', glass: 'dark', inset: 16, thumbnail: 'glass-dark' },
    { id: 'polaroid', title: 'Polaroid', group: 'basic', kind: 'polaroid', inset: 18, bottom: 54, thumbnail: 'polaroid' },
    { id: 'macosBarLight', title: 'macOS 浅色', group: 'browser', kind: 'browser', thumbnail: 'mac-light' },
    { id: 'macosBarDark', title: 'macOS 深色', group: 'browser', kind: 'browser', thumbnail: 'mac-dark' },
    { id: 'windowsBarLight', title: 'Windows 浅色', group: 'browser', kind: 'browser', thumbnail: 'windows-light' },
    { id: 'windowsBarDark', title: 'Windows 深色', group: 'browser', kind: 'browser', thumbnail: 'windows-dark' },
    { id: 'arc', title: 'Arc', group: 'browser', kind: 'arc', inset: 0, thumbnail: 'arc' },
    { id: 'macbookpro16', title: 'MacBook Pro', group: 'device', kind: 'device', thumbnail: 'macbookpro' },
    { id: 'macbookair', title: 'MacBook Air', group: 'device', kind: 'device', thumbnail: 'macbookair' },
    { id: 'imacpro', title: 'iMac', group: 'device', kind: 'device', thumbnail: 'imac' },
    { id: 'ipadpro', title: 'iPad', group: 'device', kind: 'device', thumbnail: 'ipad' },
    { id: 'iphonepro', title: 'iPhone', group: 'device', kind: 'device', thumbnail: 'iphone' },
];

export const FRAME_GROUPS = [
    { id: 'basic', title: '基础外框' },
    { id: 'browser', title: '浏览器' },
    { id: 'device', title: '设备' },
];

const FRAME_MAP = Object.fromEntries(FRAME_DEFINITIONS.map((item) => [item.id, item]));

export const getFrameDefinition = (frame) => FRAME_MAP[frame] || FRAME_MAP.none;
export const getFrameGroups = () => FRAME_GROUPS.map((group) => ({
    ...group,
    items: FRAME_DEFINITIONS.filter((item) => item.group === group.id),
}));
export const isDeviceFrame = (frame) => getFrameDefinition(frame).kind === 'device';

/**
 * 根据截图内容尺寸计算外框占用的布局盒子。旧外框保持原有尺寸计算，
 * 新外框的 inset/bottom 只增加装饰所需空间，不会把装饰节点裁在画布外。
 */
export const getFrameMetrics = (frame, width, height) => {
    const definition = getFrameDefinition(frame);
    const metrics = {
        width,
        height,
        totalWidth: width,
        totalHeight: height,
        boxX: 0,
        boxY: 0,
        boxWidth: width,
        boxHeight: height,
        headerHeight: 0,
        inset: definition.inset || 0,
        bottom: definition.bottom || definition.inset || 0,
    };

    if (definition.kind === 'browser' || definition.kind === 'arc') {
        metrics.headerHeight = definition.kind === 'arc' ? 30 : 32;
        metrics.totalHeight = height + metrics.headerHeight;
        metrics.boxY = metrics.headerHeight;
    } else if (definition.kind === 'device') {
        const device = DEVICE_FRAME_INFO[frame];
        const bgSize = computedSize(device.width, device.height, width, height);
        metrics.deviceWidth = bgSize.width;
        metrics.deviceHeight = bgSize.height;
        metrics.boxWidth = bgSize.width * device.horizontal;
        metrics.boxHeight = bgSize.height * device.vertical;
        metrics.boxX = (width - metrics.boxWidth) / 2;
        metrics.boxY = (bgSize.height * device.top) + (height - bgSize.height) / 2;
    } else if (definition.kind !== 'none' && definition.kind !== 'stroke') {
        metrics.totalWidth = width + metrics.inset * 2;
        metrics.totalHeight = height + metrics.inset + metrics.bottom;
        metrics.boxX = metrics.inset;
        metrics.boxY = metrics.inset;
    }

    return metrics;
};

const makeRect = (props) => new Rect(props);

/**
 * 创建外框装饰节点。调用方负责把 nodes 加到 screenshot container，并在 effect
 * cleanup 中 remove 它们；这样切换外框时不会残留标题栏、阴影或背景节点。
 */
export const createFrameDecorations = (frame, metrics, options = {}) => {
    const definition = getFrameDefinition(frame);
    const { width, height, totalWidth, totalHeight, headerHeight } = metrics;
    const nodes = [];
    const frameShadow = options.shadow > 0
        ? { x: 0, y: Math.max(4, options.shadow), blur: Math.max(8, options.shadow * 2), color: '#00000030', box: true }
        : null;

    if (definition.kind === 'stroke') {
        return { nodes, stroke: definition.color, strokeWidth: 8 };
    }

    if (definition.kind === 'browser') {
        const barUrl = {
            macosBarLight: macosIcon,
            macosBarDark: macosIcon,
            windowsBarLight: windowDark,
            windowsBarDark: windowLight,
        };
        nodes.push(makeRect({
            x: 0,
            y: 0,
            height: headerHeight,
            width,
            fill: [
                { type: 'solid', color: frame.includes('Dark') ? '#3a3a3b' : '#ffffff' },
                { type: 'image', url: barUrl[frame], format: 'svg', mode: 'clip', offset: { x: frame.includes('windows') ? width - 105 : 10, y: 0 } },
            ],
        }));
    }

    if (definition.kind === 'arc') {
        nodes.push(makeRect({ x: 0, y: 0, width: totalWidth, height: totalHeight, fill: '#f6f7fb', stroke: '#cbd5e1', strokeWidth: 1, cornerRadius: 12 }));
        nodes.push(makeRect({ x: 0, y: 0, width: totalWidth, height: headerHeight, fill: '#e5e7eb', cornerRadius: [12, 12, 0, 0] }));
        [
            { x: 12, fill: '#fb7185' },
            { x: 24, fill: '#fbbf24' },
            { x: 36, fill: '#4ade80' },
        ].forEach(({ x, fill }) => nodes.push(makeRect({ x, y: 11, width: 6, height: 6, fill, cornerRadius: 6 })));
    }

    if (definition.kind === 'device') {
        const device = DEVICE_FRAME_INFO[frame];
        nodes.push(makeRect({
            x: 0,
            y: 0,
            height,
            width,
            fill: [{ type: 'image', url: device.image, align: 'center', mode: 'clip', size: { width: metrics.deviceWidth, height: metrics.deviceHeight } }],
        }));
    }

    if (definition.kind === 'card' || definition.kind === 'stack' || definition.kind === 'stack2') {
        const { inset } = metrics;
        const layers = definition.kind === 'stack2' ? [
            { x: inset - 18, y: inset - 10, fill: '#dbe2ea', radius: 15 },
            { x: inset - 10, y: inset - 5, fill: '#eef2f7', radius: 15 },
        ] : definition.kind === 'stack' ? [
            { x: inset - 12, y: inset - 6, fill: '#e4e9ef', radius: 15 },
        ] : [];
        layers.forEach((layer) => nodes.push(makeRect({ x: layer.x, y: layer.y, width, height, fill: layer.fill, cornerRadius: layer.radius })));
        nodes.push(makeRect({ x: inset, y: inset, width, height, fill: '#ffffff', cornerRadius: 15, shadow: frameShadow }));
    }

    if (definition.kind === 'glass') {
        const { inset } = metrics;
        nodes.push(makeRect({
            x: inset,
            y: inset,
            width,
            height,
            fill: definition.glass === 'dark' ? '#111827b8' : '#ffffffb8',
            stroke: definition.glass === 'dark' ? '#ffffff45' : '#ffffffc8',
            strokeWidth: 2,
            cornerRadius: 18,
            shadow: frameShadow,
        }));
    }

    if (definition.kind === 'polaroid') {
        nodes.push(makeRect({
            x: 0,
            y: 0,
            width: totalWidth,
            height: totalHeight,
            fill: '#ffffff',
            cornerRadius: 6,
            shadow: frameShadow,
        }));
    }

    return { nodes };
};

export default FRAME_DEFINITIONS;
