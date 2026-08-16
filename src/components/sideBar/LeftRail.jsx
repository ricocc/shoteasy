import { observer } from 'mobx-react-lite';
import SizeBar from './SizeBar';
import FrameBar from './FrameBar';

/**
 * 左栏内容（M2.4）。桌面左栏与移动端抽屉共用。
 * 文档级设置：截图尺寸（SizeBar）与外框（FrameBar）。
 * （视觉 3D 旋转面板已移除：透视管线与外框装饰存在兼容问题且交互卡顿。）
 */
export const LeftRailContent = () => (
    <div className="shoteasy-rail-content flex flex-col gap-3 [&_label]:font-semibold [&_label]:text-sm">
        <SizeBar />
        <FrameBar />
    </div>
);

/**
 * 桌面左栏。relative + overflow-hidden 作为 FrameBar 内联 Drawer（getContainer=false）
 * 的定位与裁剪祖先；仅 lg 以上显示，平板/手机由 TopBar 抽屉提供。
 */
const LeftRail = observer(() => (
    <div className="shoteasy-left-rail hidden lg:flex relative shrink-0 overflow-hidden flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
            <LeftRailContent />
        </div>
    </div>
));

export default LeftRail;
