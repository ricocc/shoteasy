/**
 * 图标统一映射层（M2.9）。
 *
 * 主图标源为 mage-icons-react（stroke 集，default 导出，仅接受 className，
 * 固定 24×24，使用 currentColor）。对 mage-icons 未提供的 13 个图标
 * （Square / SquareFill / Circle / Slash / Smile / Crop / Flip / Sunset /
 * Type / CodeXml / ImagePlay / ListCollapse）使用同网格（24×24、currentColor、
 * stroke 1.5、圆角端点）的自绘 SVG，保证视觉一致。
 *
 * 统一 wrap() 包装层对外暴露与旧 Lucide 相同的调用方式：
 *   <Icon.X size={16} className aria-hidden onClick />
 * size（数字）通过外层 span 的内联宽高承载，内部 svg 以 w-full/h-full 撑满，
 * CSS 覆盖 svg 固定的 width/height 属性；aria-hidden 与事件透传到外层 span。
 */
import { cn } from '@utils/utils';

// --- mage-icons-react（stroke 集，default 导出）---
import CameraIcon from 'mage-icons-react/stroke/CameraIcon';
import CheckIcon from 'mage-icons-react/stroke/CheckIcon';
import ArrowDownLeftIcon from 'mage-icons-react/stroke/ArrowDownLeftIcon';
import ArrowsAllDirectionIcon from 'mage-icons-react/stroke/ArrowsAllDirectionIcon';
import EditPenIcon from 'mage-icons-react/stroke/EditPenIcon';
import RefreshReverseIcon from 'mage-icons-react/stroke/RefreshReverseIcon';
import RefreshIcon from 'mage-icons-react/stroke/RefreshIcon';
import ChevronRightIcon from 'mage-icons-react/stroke/ChevronRightIcon';
import ChevronDownIcon from 'mage-icons-react/stroke/ChevronDownIcon';
import ChevronUpIcon from 'mage-icons-react/stroke/ChevronUpIcon';
import ChevronLeftIcon from 'mage-icons-react/stroke/ChevronLeftIcon';
import ZoomInIcon from 'mage-icons-react/stroke/ZoomInIcon';
import ZoomOutIcon from 'mage-icons-react/stroke/ZoomOutIcon';
import Box3dIcon from 'mage-icons-react/stroke/Box3dIcon';
import LayoutGridIcon from 'mage-icons-react/stroke/LayoutGridIcon';
import ImagePlusIcon from 'mage-icons-react/stroke/ImagePlusIcon';
import ClipboardIcon from 'mage-icons-react/stroke/ClipboardIcon';
import MaximizeIcon from 'mage-icons-react/stroke/MaximizeIcon';
import ArrowUpRightIcon from 'mage-icons-react/stroke/ArrowUpRightIcon';
import ArrowDownRightIcon from 'mage-icons-react/stroke/ArrowDownRightIcon';
import DownloadIcon from 'mage-icons-react/stroke/DownloadIcon';
import CopyIcon from 'mage-icons-react/stroke/CopyIcon';
import SearchIcon from 'mage-icons-react/stroke/SearchIcon';
import SettingsIcon from 'mage-icons-react/stroke/SettingsIcon';
import ColorPickerIcon from 'mage-icons-react/stroke/ColorPickerIcon';
import Trash2Icon from 'mage-icons-react/stroke/Trash2Icon';
import SunIcon from 'mage-icons-react/stroke/SunIcon';
import MoonIcon from 'mage-icons-react/stroke/MoonIcon';

// --- 自绘 SVG（mage-icons 未覆盖的图标，24×24 网格，currentColor）---
const strokeProps = {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const SquareGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
    </svg>
);
const SquareFillGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
);
const CircleGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <circle cx="12" cy="12" r="8" />
    </svg>
);
const SlashGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <line x1="5" y1="19" x2="19" y2="5" />
    </svg>
);
const SmileGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9.5" x2="9.01" y2="9.5" />
        <line x1="15" y1="9.5" x2="15.01" y2="9.5" />
    </svg>
);
const CropGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <path d="M6 2v14a2 2 0 0 0 2 2h14" />
        <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
);
// 水平翻转：中线 + 两个相对三角
const FlipHorizontalGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M8 8L3 12l5 4z" fill="currentColor" stroke="none" />
        <path d="M16 8l5 4-5 4z" fill="currentColor" stroke="none" />
    </svg>
);
const FlipVerticalGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <path d="M8 8L12 3l4 5z" fill="currentColor" stroke="none" />
        <path d="M8 16l4 5 4-5z" fill="currentColor" stroke="none" />
    </svg>
);
// 日落（HDR）：下沉箭头 + 半圆太阳 + 地平线
const SunsetGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <path d="M12 4v4" />
        <path d="M9.5 6L12 8.5 14.5 6" />
        <path d="M7 18a5 5 0 0 1 10 0" />
        <path d="M3 18h18" />
    </svg>
);
const TypeGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
    </svg>
);
const CodeGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
    </svg>
);
const ImagePlayGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none" />
    </svg>
);
const ListCollapseGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <line x1="10" y1="6" x2="20" y2="6" />
        <line x1="10" y1="12" x2="20" y2="12" />
        <line x1="10" y1="18" x2="20" y2="18" />
        <path d="M6 9L3.5 6.5 6 4" />
        <line x1="3.5" y1="6.5" x2="3.5" y2="13" />
    </svg>
);

/**
 * 包装任意图标（mage 或自绘）为统一 API。
 * size→外层 span 内联宽高；svg 以 w-full/h-full 撑满（CSS 覆盖固定 24×24）。
 */
const wrap = (Glyph) => function WrappedIcon({ size, className, ...rest }) {
    return (
        <span
            className={cn('inline-flex items-center justify-center shrink-0 leading-none', className)}
            style={size != null ? { width: size, height: size } : undefined}
            {...rest}
        >
            <Glyph className="block w-full h-full" />
        </span>
    );
};

// 模糊：同心圆表示失焦
const BlurGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="12" cy="12" r="7.6" opacity="0.5" />
    </svg>
);
// 马赛克：四宫格
const MosaicGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
);
// 聚光：中心圆 + 放射光线
const SpotlightGlyph = ({ className }) => (
    <svg {...strokeProps} className={className}>
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4.6" />
        <line x1="12" y1="19.4" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.6" y2="12" />
        <line x1="19.4" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.8" y2="6.8" />
        <line x1="17.2" y1="17.2" x2="19.1" y2="19.1" />
        <line x1="19.1" y1="4.9" x2="17.2" y2="6.8" />
        <line x1="6.8" y1="17.2" x2="4.9" y2="19.1" />
    </svg>
);

export default {
    Camera: wrap(CameraIcon),
    Check: wrap(CheckIcon),
    Square: wrap(SquareGlyph),
    SquareFill: wrap(SquareFillGlyph),
    Circle: wrap(CircleGlyph),
    Slash: wrap(SlashGlyph),
    MoveDownLeft: wrap(ArrowDownLeftIcon),
    Pencil: wrap(EditPenIcon),
    Smile: wrap(SmileGlyph),
    Undo: wrap(RefreshReverseIcon),
    Redo: wrap(RefreshIcon),
    ChevronRight: wrap(ChevronRightIcon),
    ChevronDown: wrap(ChevronDownIcon),
    ChevronUp: wrap(ChevronUpIcon),
    ChevronLeft: wrap(ChevronLeftIcon),
    RotateCcw: wrap(RefreshReverseIcon),
    ZoomIn: wrap(ZoomInIcon),
    ZoomOut: wrap(ZoomOutIcon),
    Hand: wrap(ArrowsAllDirectionIcon),
    Crop: wrap(CropGlyph),
    FlipHorizontal2: wrap(FlipHorizontalGlyph),
    FlipVertical2: wrap(FlipVerticalGlyph),
    Sunset: wrap(SunsetGlyph),
    Box: wrap(Box3dIcon),
    LayoutGrid: wrap(LayoutGridIcon),
    ImagePlus: wrap(ImagePlusIcon),
    Type: wrap(TypeGlyph),
    CodeXml: wrap(CodeGlyph),
    ClipboardPaste: wrap(ClipboardIcon),
    ImagePlay: wrap(ImagePlayGlyph),
    Maximize: wrap(MaximizeIcon),
    ListCollapse: wrap(ListCollapseGlyph),
    ArrowUpRight: wrap(ArrowUpRightIcon),
    ArrowDownRight: wrap(ArrowDownRightIcon),
    Download: wrap(DownloadIcon),
    ImageDown: wrap(DownloadIcon),
    Copy: wrap(CopyIcon),
    Settings2: wrap(SettingsIcon),
    Pipette: wrap(ColorPickerIcon),
    Trash2: wrap(Trash2Icon),
    Sun: wrap(SunIcon),
    Moon: wrap(MoonIcon),
    Magnifier: wrap(SearchIcon),
    MessageCirclePlus: wrap(SearchIcon),
    Blur: wrap(BlurGlyph),
    Mosaic: wrap(MosaicGlyph),
    Spotlight: wrap(SpotlightGlyph),
};
