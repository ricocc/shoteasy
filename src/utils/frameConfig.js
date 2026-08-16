import { Rect, Text } from 'leafer-ui';
import { computedSize, svgToDataURL } from '@utils/utils';
import macbookpro16 from '@assets/macbook-pro-16.png';
import macbookair from '@assets/macbook-air.png';
import imacpro from '@assets/imac-pro.png';
import ipadpro from '@assets/ipadpro.png';
import iphonepro from '@assets/iphonepro.png';
import browserFavicon from '@assets/favicon.png';
import sidebarSvg from '@assets/icon/toggle.svg?raw';
import shieldSvg from '@assets/icon/Toolbar Item-defender.svg?raw';
import downloadSvg from '@assets/icon/dowload.svg?raw';
import shareSvg from '@assets/icon/Toolbar-target.svg?raw';
import plusSvg from '@assets/icon/+.svg?raw';
import copySvg from '@assets/icon/Toolbar Item-copy.svg?raw';

export const BROWSER_HEADER_SIZE_MIN = 50;
export const BROWSER_HEADER_SIZE_MAX = 200;
export const BROWSER_HEADER_SIZE_DEFAULT = 100;

const tintSvg = (source, color) => svgToDataURL(source.replace(/#737373/g, color));
const strokeIconSvg = (body) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const browserIconSvg = {
    back: strokeIconSvg('<path d="M14.5 5.5L8 12l6.5 6.5" stroke="#737373" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    forward: strokeIconSvg('<path d="M9.5 5.5L16 12l-6.5 6.5" stroke="#737373" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    reload: strokeIconSvg('<path d="M18.4 8.2A7 7 0 1 0 19 14" stroke="#737373" stroke-width="1.7" stroke-linecap="round"/><path d="M18.5 4.8v4.4h-4.4" stroke="#737373" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
    lock: strokeIconSvg('<rect x="6.5" y="10.2" width="11" height="9" rx="2" fill="#737373"/><path d="M8.8 10.2V8a3.2 3.2 0 0 1 6.4 0v2.2" stroke="#737373" stroke-width="1.8" stroke-linecap="round"/>'),
    close: strokeIconSvg('<path d="M8 8l8 8M16 8l-8 8" stroke="#737373" stroke-width="1.7" stroke-linecap="round"/>'),
    menu: strokeIconSvg('<circle cx="12" cy="6" r="1.5" fill="#737373"/><circle cx="12" cy="12" r="1.5" fill="#737373"/><circle cx="12" cy="18" r="1.5" fill="#737373"/>'),
};

const buildBrowserIconSet = (color) => ({
    sidebar: tintSvg(sidebarSvg, color),
    shield: tintSvg(shieldSvg, color),
    download: tintSvg(downloadSvg, color),
    share: tintSvg(shareSvg, color),
    plus: tintSvg(plusSvg, color),
    copy: tintSvg(copySvg, color),
    back: tintSvg(browserIconSvg.back, color),
    forward: tintSvg(browserIconSvg.forward, color),
    reload: tintSvg(browserIconSvg.reload, color),
    lock: tintSvg(browserIconSvg.lock, color),
    close: tintSvg(browserIconSvg.close, color),
    menu: tintSvg(browserIconSvg.menu, color),
});

const BROWSER_ICON_SETS = {
    light: buildBrowserIconSet('#6f7479'),
    dark: buildBrowserIconSet('#a9afb5'),
};

export const DEVICE_FRAME_INFO = {
    macbookpro16: { image: macbookpro16, width: 1920, height: 1266, horizontal: 4 / 5, vertical: 26 / 33, top: 7 / 66 },
    macbookair: { image: macbookair, width: 1920, height: 1147, horizontal: 396 / 500, vertical: 258 / 299, top: 9 / 299 },
    imacpro: { image: imacpro, width: 1920, height: 1599, horizontal: 112 / 125, vertical: 252 / 417, top: 29 / 417 },
    ipadpro: { image: ipadpro, width: 1920, height: 1425, horizontal: 430 / 500, vertical: 302 / 372, top: 35 / 372 },
    iphonepro: { image: iphonepro, width: 968, height: 1920, horizontal: 214 / 253, vertical: 462 / 500, top: 19 / 500 },
};

export const FRAME_DEFINITIONS = [
    { id: 'none', title: '无外框', description: '保留原图', group: 'basic', kind: 'none', thumbnail: 'none' },
    { id: 'light', title: '浅色描边', description: '半透明亮边', group: 'basic', kind: 'stroke', color: '#ffffff80', thumbnail: 'light' },
    { id: 'dark', title: '深色描边', description: '半透明暗边', group: 'basic', kind: 'stroke', color: '#00000050', thumbnail: 'dark' },
    { id: 'card', title: '白色卡片', description: '圆角白色衬底', group: 'basic', kind: 'card', inset: 18, thumbnail: 'card' },
    { id: 'glassLight', title: '浅色玻璃', description: '半透明亮色衬底', group: 'basic', kind: 'glass', glass: 'light', inset: 16, thumbnail: 'glass-light' },
    { id: 'glassDark', title: '深色玻璃', description: '半透明暗色衬底', group: 'basic', kind: 'glass', glass: 'dark', inset: 16, thumbnail: 'glass-dark' },
    { id: 'stack', title: '单层堆叠', description: '一层错位卡片', group: 'creative', kind: 'stack', inset: 26, thumbnail: 'stack' },
    { id: 'stack2', title: '双层堆叠', description: '两层错位卡片', group: 'creative', kind: 'stack2', inset: 32, thumbnail: 'stack2' },
    { id: 'polaroid', title: '拍立得', description: '加宽底部相纸', group: 'creative', kind: 'polaroid', inset: 18, bottom: 54, thumbnail: 'polaroid' },
    { id: 'macosBarLight', title: 'Safari', description: '浅色单栏', group: 'browser', kind: 'browser', browserStyle: 'safari', theme: 'light', baseHeaderHeight: 54, thumbnail: 'mac-light' },
    { id: 'macosBarDark', title: 'Safari 深色', description: '深色单栏', group: 'browser', kind: 'browser', browserStyle: 'safari', theme: 'dark', baseHeaderHeight: 54, thumbnail: 'mac-dark' },
    { id: 'windowsBarLight', title: 'Chrome', description: '浅色标签与地址栏', group: 'browser', kind: 'browser', browserStyle: 'chrome', theme: 'light', baseHeaderHeight: 86, thumbnail: 'windows-light' },
    { id: 'windowsBarDark', title: 'Chrome 深色', description: '深色标签与地址栏', group: 'browser', kind: 'browser', browserStyle: 'chrome', theme: 'dark', baseHeaderHeight: 86, thumbnail: 'windows-dark' },
    { id: 'arc', title: 'Arc 简洁', description: '圆角轻量单栏', group: 'browser', kind: 'arc', browserStyle: 'arc', theme: 'light', baseHeaderHeight: 56, inset: 0, thumbnail: 'arc' },
    { id: 'macbookpro16', title: 'MacBook Pro', group: 'device', kind: 'device', thumbnail: 'macbookpro' },
    { id: 'macbookair', title: 'MacBook Air', group: 'device', kind: 'device', thumbnail: 'macbookair' },
    { id: 'imacpro', title: 'iMac', group: 'device', kind: 'device', thumbnail: 'imac' },
    { id: 'ipadpro', title: 'iPad', group: 'device', kind: 'device', thumbnail: 'ipad' },
    { id: 'iphonepro', title: 'iPhone', group: 'device', kind: 'device', thumbnail: 'iphone' },
];

export const FRAME_GROUPS = [
    { id: 'basic', title: '基础外框' },
    { id: 'creative', title: '创意外框' },
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
export const getBrowserHeaderHeight = (frame, headerSize = BROWSER_HEADER_SIZE_DEFAULT) => {
    const definition = getFrameDefinition(frame);
    if (definition.kind !== 'browser' && definition.kind !== 'arc') return 0;
    const size = Math.max(BROWSER_HEADER_SIZE_MIN, Math.min(BROWSER_HEADER_SIZE_MAX, Number(headerSize) || BROWSER_HEADER_SIZE_DEFAULT));
    return Math.round((definition.baseHeaderHeight || 44) * size / 100);
};

/**
 * 根据截图内容尺寸计算外框占用的布局盒子。旧外框保持原有尺寸计算，
 * 新外框的 inset/bottom 只增加装饰所需空间，不会把装饰节点裁在画布外。
 */
export const getFrameMetrics = (frame, width, height, options = {}) => {
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
        metrics.headerHeight = getBrowserHeaderHeight(frame, options.headerSize);
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
const makeText = (props) => new Text(props);
const makeIcon = ({ url, x, y, width, height, format = 'svg', opacity = 1 }) => new Rect({
    x,
    y,
    width,
    height,
    opacity,
    hittable: false,
    fill: {
        type: 'image',
        url,
        mode: 'fit',
        ...(format ? { format } : {}),
    },
});

const getBrowserTabTitle = (url) => {
    const clean = String(url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    return clean.split('/')[0] || '新标签页';
};

/**
 * 创建外框装饰节点。调用方负责把 nodes 加到 screenshot container，并在 effect
 * cleanup 中 remove 它们；这样切换外框时不会残留标题栏、阴影或背景节点。
 */
export const createFrameDecorations = (frame, metrics, options = {}) => {
    const definition = getFrameDefinition(frame);
    const { width, height, totalWidth, totalHeight, headerHeight } = metrics;
    const nodes = [];
    // 阴影配置：完整对象（visible/x/y/blur/spread/color），关闭或未配置时不生成
    const shadowConf = options.shadow;
    const frameShadow = shadowConf && shadowConf.visible
        ? {
            x: shadowConf.x,
            y: shadowConf.y,
            blur: shadowConf.blur,
            spread: shadowConf.spread,
            color: shadowConf.color,
            box: true,
        }
        : null;

    if (definition.kind === 'stroke') {
        return { nodes, stroke: definition.color, strokeWidth: 8 };
    }

    if (definition.kind === 'browser' || definition.kind === 'arc') {
        const dark = definition.theme === 'dark';
        const style = definition.browserStyle || 'safari';
        const scale = headerHeight / (definition.baseHeaderHeight || 54);
        // Keep the outer header fully responsive, but damp the extra vertical
        // breathing room above 100% so the centered browser controls do not
        // drift too far away from the top and bottom edges.
        const spacingScale = scale > 1 ? 1 + (scale - 1) * 2 / 3 : scale;
        const controlScale = Math.max(0.72, Math.min(1.55, scale, width / 540));
        const icons = BROWSER_ICON_SETS[dark ? 'dark' : 'light'];
        const url = String(options.url ?? 'shoteasy.app').trim();
        const ink = dark ? '#c5cbd1' : '#646a70';
        const topRadius = Math.max(7, Math.round(10 * controlScale));
        const addIcon = (iconUrl, centerX, centerY, iconWidth, iconHeight, format = 'svg', opacity = 1) => {
            nodes.push(makeIcon({
                url: iconUrl,
                x: centerX - iconWidth / 2,
                y: centerY - iconHeight / 2,
                width: iconWidth,
                height: iconHeight,
                format,
                opacity,
            }));
        };
        const addToolbarAsset = (name, centerX, centerY, opacity = 1) => {
            addIcon(icons[name], centerX, centerY, 28.3 * controlScale, 24 * controlScale, 'svg', opacity);
        };
        const addGlyph = (name, centerX, centerY, size = 19 * controlScale, opacity = 1) => {
            addIcon(icons[name], centerX, centerY, size, size, 'svg', opacity);
        };
        const addTrafficLights = (left, centerY, diameter = 12 * controlScale) => {
            const gap = diameter * 2 / 3;
            const strokeWidth = Math.max(0.5, 0.5 * controlScale);
            [
                { fill: '#ee6a5f', stroke: '#ce5347' },
                { fill: '#f5bd4f', stroke: '#d6a243' },
                { fill: '#61c454', stroke: '#58a942' },
            ].forEach((light, index) => {
                nodes.push(makeRect({
                    x: left + index * (diameter + gap),
                    y: centerY - diameter / 2,
                    width: diameter,
                    height: diameter,
                    fill: light.fill,
                    stroke: light.stroke,
                    strokeWidth,
                    cornerRadius: diameter / 2,
                    hittable: false,
                }));
            });
        };

        if (style === 'chrome') {
            const tabBar = dark ? '#202124' : '#dfe1e5';
            const activeTab = dark ? '#292b2f' : '#ffffff';
            const toolbar = dark ? '#292b2f' : '#ffffff';
            const address = dark ? '#202124' : '#f1f3f4';
            const divider = dark ? '#3c4043' : '#d7d9dc';
            const tabsHeight = Math.max(20, Math.round(headerHeight * 0.49));
            const tabInsetY = Math.max(3, Math.round(3 * scale));
            const tabX = Math.max(62, Math.round(78 * controlScale));
            const tabWidth = Math.max(110, Math.min(width * 0.32, 240 * controlScale));

            nodes.push(makeRect({
                x: 0,
                y: 0,
                width,
                height: headerHeight,
                fill: tabBar,
                stroke: divider,
                strokeWidth: 1,
                cornerRadius: [topRadius, topRadius, 0, 0],
            }));
            nodes.push(makeRect({
                x: tabX,
                y: tabInsetY,
                width: tabWidth,
                height: Math.max(17, tabsHeight - tabInsetY),
                fill: activeTab,
                cornerRadius: [Math.max(6, 9 * controlScale), Math.max(6, 9 * controlScale), 0, 0],
            }));
            nodes.push(makeRect({ x: 0, y: tabsHeight, width, height: headerHeight - tabsHeight, fill: toolbar }));
            addTrafficLights(Math.max(12, 14 * controlScale), tabsHeight / 2, 10 * controlScale);

            const tabCenterY = tabInsetY + (tabsHeight - tabInsetY) / 2;
            addIcon(browserFavicon, tabX + 18 * controlScale, tabCenterY, 12 * controlScale, 12 * controlScale, null);
            nodes.push(makeText({
                x: tabX + 31 * controlScale,
                y: tabInsetY,
                width: Math.max(20, tabWidth - 61 * controlScale),
                height: Math.max(17, tabsHeight - tabInsetY),
                text: getBrowserTabTitle(url),
                fill: ink,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                fontSize: Math.max(8, Math.min(15, 10 * controlScale)),
                fontWeight: 500,
                verticalAlign: 'middle',
                overflow: 'hide',
            }));
            addGlyph('close', tabX + tabWidth - 17 * controlScale, tabCenterY, 14 * controlScale);
            addToolbarAsset('plus', tabX + tabWidth + 21 * controlScale, tabCenterY);

            const toolbarCenterY = tabsHeight + (headerHeight - tabsHeight) / 2;
            addGlyph('back', 22 * controlScale, toolbarCenterY, 18 * controlScale);
            addGlyph('forward', 49 * controlScale, toolbarCenterY, 18 * controlScale, 0.55);
            addGlyph('reload', 76 * controlScale, toolbarCenterY, 18 * controlScale);

            const addressX = Math.max(76, Math.round(96 * controlScale));
            const toolbarInset = Math.max(3, Math.round(3 * spacingScale));
            const addressY = tabsHeight + toolbarInset;
            const addressHeight = Math.max(14, headerHeight - addressY - toolbarInset);
            const addressWidth = Math.max(80, width - addressX - Math.max(30, Math.round(42 * controlScale)));
            nodes.push(makeRect({
                x: addressX,
                y: addressY,
                width: addressWidth,
                height: addressHeight,
                fill: address,
                cornerRadius: addressHeight,
            }));
            addGlyph('lock', addressX + 15 * controlScale, addressY + addressHeight / 2, 13 * controlScale);
            nodes.push(makeText({
                x: addressX + 28 * controlScale,
                y: addressY,
                width: Math.max(1, addressWidth - 58 * controlScale),
                height: addressHeight,
                text: url,
                fill: ink,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                fontSize: Math.max(9, Math.min(20, 16 * scale)),
                fontWeight: 500,
                verticalAlign: 'middle',
                overflow: 'hide',
            }));
            addGlyph('reload', addressX + addressWidth - 15 * controlScale, addressY + addressHeight / 2, 15 * controlScale);
            addGlyph('menu', width - 18 * controlScale, toolbarCenterY, 17 * controlScale);
            nodes.push(makeRect({ x: 0, y: headerHeight - 1, width, height: 1, fill: divider }));
        } else {
            const chrome = dark ? '#202326' : (style === 'arc' ? '#eef0f3' : '#fbfbfc');
            const address = dark ? '#0f1215' : '#f1f2f3';
            const divider = dark ? '#34383c' : '#dfe1e4';
            const centerY = headerHeight / 2;
            const baseAddressHeight = 30;
            const baseVerticalGap = Math.max(0, ((definition.baseHeaderHeight || 54) - baseAddressHeight) / 2);
            const verticalGap = baseVerticalGap * spacingScale;
            const addressHeight = Math.max(18, headerHeight - verticalGap * 2);
            const availableAddressWidth = Math.max(80, width - 380 * controlScale);
            const addressWidth = Math.max(80, Math.min(width * 0.42, availableAddressWidth));
            const addressX = (width - addressWidth) / 2;
            const addressY = (headerHeight - addressHeight) / 2;

            nodes.push(makeRect({
                x: 0,
                y: 0,
                width,
                height: headerHeight,
                fill: chrome,
                stroke: divider,
                strokeWidth: 1,
                cornerRadius: [topRadius, topRadius, 0, 0],
            }));
            addTrafficLights(Math.max(14, 18 * controlScale), centerY);
            addToolbarAsset('sidebar', 103 * controlScale, centerY);
            addGlyph('back', 140 * controlScale, centerY, 19 * controlScale);
            addGlyph('forward', 170 * controlScale, centerY, 19 * controlScale, 0.5);
            addToolbarAsset('shield', Math.max(186 * controlScale, addressX - 30 * controlScale), centerY);

            nodes.push(makeRect({
                x: addressX,
                y: addressY,
                width: addressWidth,
                height: addressHeight,
                fill: address,
                stroke: style === 'arc' ? '#c9cdd2' : null,
                strokeWidth: style === 'arc' ? 1 : 0,
                cornerRadius: Math.max(5, 7 * controlScale),
            }));
            const urlFontSize = Math.max(9, Math.min(22, 16 * scale));
            const estimatedTextWidth = Math.min(addressWidth * 0.65, Math.max(28, url.length * urlFontSize * 0.52));
            addGlyph('lock', addressX + addressWidth / 2 - estimatedTextWidth / 2 - 10 * controlScale, centerY, 12 * controlScale);
            nodes.push(makeText({
                x: addressX + 25 * controlScale,
                y: addressY,
                width: Math.max(1, addressWidth - 50 * controlScale),
                height: addressHeight,
                text: url,
                fill: ink,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                fontSize: urlFontSize,
                fontWeight: 400,
                textAlign: 'center',
                verticalAlign: 'middle',
                overflow: 'hide',
            }));
            addGlyph('reload', addressX + addressWidth - 15 * controlScale, centerY, 15 * controlScale);

            addToolbarAsset('download', width - 148 * controlScale, centerY);
            addToolbarAsset('share', width - 108 * controlScale, centerY);
            addToolbarAsset('plus', width - 68 * controlScale, centerY);
            addToolbarAsset('copy', width - 28 * controlScale, centerY);
            nodes.push(makeRect({ x: 0, y: headerHeight - 1, width, height: 1, fill: divider }));
        }
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
        const offset = definition.kind === 'card' ? 0 : Math.max(7, Math.round(inset * 0.34));
        if (definition.kind === 'stack2') {
            nodes.push(makeRect({ x: 0, y: 0, width: totalWidth - offset * 2, height: totalHeight - offset * 2, fill: '#c7ced8', cornerRadius: 16 }));
            nodes.push(makeRect({ x: offset, y: offset, width: totalWidth - offset * 2, height: totalHeight - offset * 2, fill: '#e1e6ec', cornerRadius: 16 }));
        } else if (definition.kind === 'stack') {
            nodes.push(makeRect({ x: 0, y: 0, width: totalWidth - offset, height: totalHeight - offset, fill: '#d6dce4', cornerRadius: 16 }));
        }
        nodes.push(makeRect({
            x: offset,
            y: offset,
            width: totalWidth - offset,
            height: totalHeight - offset,
            fill: '#ffffff',
            cornerRadius: 16,
            shadow: frameShadow,
        }));
    }

    if (definition.kind === 'glass') {
        nodes.push(makeRect({
            x: 0,
            y: 0,
            width: totalWidth,
            height: totalHeight,
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
