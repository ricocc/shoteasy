# 架构与数据流

## 总体结构

React 负责控制面板和生命周期，MobX 保存跨组件状态，LeaferJS 负责实际画布节点和导出。React 图层组件不渲染 DOM，而是在 `useEffect` 中创建、更新和移除 LeaferJS 对象。

```text
图片输入
  ↓
useSetImg → editor.img ───────────────┐
                    option.* ────────┤
                                     ↓
React View → Leafer App → Frame（最终画布）
                         ├─ ShapeLine 标注（按 zIndex）
                         ├─ Screenshot 图片/设备框
                         └─ Watermark 重复水印
                                     ↓
                         Leafer export → 下载/剪贴板
```

## 顶层生命周期

`src/App.jsx` 是站点和组件库共用的顶层组件：

1. 创建 Ant Design message 上下文并保存到 `editor.message`。
2. 根据 `isDark` 或 `localStorage.SHOTEASY_BEAUTIFIER_THEME` 设置主题。
3. 收到 `defaultImg` 时通过 `useSetImg` 载入。
4. `editor.img.src` 存在时显示 `Editor`，否则显示 `Init`。
5. 始终显示 `Header` 和 `SideBar`；无图片时，依赖 `editor.isEditing` 的动作会提示先添加图片。

## 状态模型

### `editor`：运行时与交互状态

`src/stores/editor.js` 导出一个模块级 MobX 单例，主要字段包括：

| 字段 | 含义 |
| --- | --- |
| `img` | 当前图片的 `src`、原始宽高、MIME 类型和文件名 |
| `app` | LeaferJS `App` 实例 |
| `scale` | 画布当前缩放百分比，用于 UI 显示 |
| `useTool` | 当前标注工具；空值表示选择模式 |
| `annotateColor` / `strokeWidth` | 新标注默认样式，也会更新当前选择项 |
| `shapes` | 以随机 ID 为键的标注 `Map` |
| `snap` | 放大镜使用的截图快照 |
| `theme` | `light` 或 `dark` |
| `message` / `clearFun` | Ant Design 消息实例和宿主清理回调 |

`destroy()` 会销毁 LeaferJS 应用、清空标注和快照，并退出当前工具。删除当前图片时，`DownloadBar` 先调用 `destroy()`，再清空 `img` 并触发 `onClear`。

### `option`：画面配置

`src/stores/option.js` 也是模块级 MobX 单例，保存画布和截图表现：缩放/翻转、留白、圆角、阴影、边框、设备适配模式、背景、对齐、水印、HDR、尺寸预设和最终画布宽高。

派生属性：

- `mode`：普通图和浏览器标题栏强制使用 `cover`；设备框使用 `frameMode`。
- `waterSvg`：将水印值转换为普通 JS 数据后交给 LeaferJS。

## 画布初始化与事件

`src/components/editor/View.jsx` 在容器可用时创建 LeaferJS `App`：

- `tree` 使用 viewport，承载最终可导出的内容。
- `sky` 使用 draw，编辑控制柄由 Leafer 编辑器插件管理。
- `ScrollBar` 提供滚动条。
- 容器尺寸变化或画布尺寸变化时自动执行 `zoom('fit', 100)`；若画布本身小于可用区域，则回到 100%。
- 指针/拖拽事件按 `editor.useTool` 创建标注，并持续把几何信息写回 `editor.shapes`。
- 选择、删除和缩放快捷键直接操作 LeaferJS 实例。

组件卸载时会移除尺寸监听并调用 `editor.destroy()`。

## 图层组成

### FrameBox

`FrameBox.jsx` 创建固定宽高、裁切溢出的 Leafer `Frame`，其 `fill` 是最终背景。它把 `parent: frame` 注入所有 React 图层子组件。

### Screenshot

`Screenshot.jsx` 由三个主要 Leafer 节点组成：

- `container`：整体定位、缩放、阴影、描边和圆角。
- `box`：图片可见区域及留白底色。
- `image`：实际图片填充、翻转与适配模式。

选择浏览器标题栏时，会添加 32px 高的标题栏；选择设备框时，会根据每个设备的比例常量计算屏幕开口。HDR 开启后先通过 Canvas 生成增强后的 data URL，再替换图片填充。

### ShapeLine

`ShapeLine.jsx` 根据 `type` 将 MobX 数据映射为 Leafer 图形：

| 类型 | Leafer 节点/行为 |
| --- | --- |
| `Square` | 空心圆角矩形 |
| `SquareFill` | 实心圆角矩形 |
| `Circle` | 空心椭圆 |
| `Slash` | 直线 |
| `MoveDownLeft` | 箭头 |
| `Pencil` | 曲线折线 |
| `Magnifier` | 自定义椭圆，使用画布快照作 2 倍局部填充 |
| `Step` | 带自动递增数字 SVG 的圆形 |
| `emoji` | 可缩放文本 |

放大镜需要 `editor.createSnap()`：导出截图图层、临时隐藏其他图层，再把快照回填给放大镜。快照更新使用防抖，避免连续样式调整时频繁导出。

### Watermark

侧栏把文字转换为 SVG data URL；画布图层以 `repeat` 模式平铺。`waterIndex` 为 `1` 时覆盖在截图之上，为 `-1` 时位于截图之下、仅在背景区域可见。

## 输入链路

- 文件/拖放：Ant Design Upload 的 `beforeUpload` 拦截实际上传，将 `File` 交给 `useSetImg`。
- 粘贴：`usePaste` 监听整个 `document` 的 `paste`，取第一个受支持图片项。
- 截屏：`captureScreen` 请求桌面媒体流，将首个可播放视频帧绘制到 Canvas。
- `defaultImg`：按 data URL/URL 路径直接加载。

`useSetImg` 读取图片真实宽高并写入 `editor.img`。当尺寸模式是 `auto` 时，画布宽高等于图片宽高加上短边 15% 的统一余量。

## 导出链路

`DownloadBar.jsx` 调用 `app.tree.export()` 导出整个画布树：

- PNG：保留透明背景。
- JPG/WebP：质量为 `0.9`，透明区域用白色填充。
- 像素倍率：1、2 或 3。
- 下载：Blob 转 object URL 后触发临时 `<a download>`。
- 复制：始终导出 PNG Blob，再通过 Clipboard API 写入。

快捷键为 `Cmd/Ctrl+S` 下载、`Cmd/Ctrl+C` 复制；复制快捷键会覆盖页面默认复制行为。

## 重要架构约束

- 两个 store 都是模块级单例，一个页面同时挂载多个 `ImageBeautifier` 实例会共享并互相覆盖状态。
- 代码直接访问 `window`、`document`、`navigator` 和 `localStorage`，不支持 SSR 直接执行；应只在浏览器端加载。
- LeaferJS 节点的更新依赖多个 React effect。新增 option 字段时，需要同时检查 store、控制面板、图层 effect 和导出结果。
- `shapes` 保存的是业务快照，Leafer 节点保存实际交互状态；新增编辑行为时要保证二者同步。
