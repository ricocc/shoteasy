# V1 技术设计

## 设计原则

1. 继续使用现有 React、MobX 和 LeaferJS 分工，不引入第二套画布或状态管理。
2. MobX 中的可序列化数据是业务事实来源，LeaferJS 对象是运行时渲染结果。
3. 所有会影响成品的操作必须可以序列化，并进入历史和草稿；纯视图状态不得进入项目文档。
4. 先保证当前功能结果一致，再调整界面位置，最后增加新能力。
5. 新能力按普通图层节点实现，但 V1 不提供图层管理 UI。

## 状态分层

### 项目数据

需要保存、撤销和恢复的数据：

- 当前原图引用与元信息。
- 画布尺寸与尺寸预设信息。
- 背景类型、资源和背景效果。
- 图片缩放、旋转、翻转、位置、留白、圆角、阴影和外框。
- 水印和 HDR。
- 所有标注对象及其几何和样式。

### 运行时状态

不进入项目文档的数据：

- LeaferJS `App`、Frame、Rect、Text 等实例。
- Ant Design message 实例。
- 当前打开的面板、Popover、Drawer。
- 当前选择工具和 hover 状态。
- 视图缩放、滚动位置和编辑器控制柄状态。
- 导出 loading、格式和倍率偏好。
- object URL 和正在执行的异步任务编号。

主题不进入项目文档，继续使用现有主题存储逻辑。

## `ProjectDocument v1`

项目继续使用 JavaScript；下列结构作为运行时 schema 和 JSDoc 类型依据：

```js
{
  version: 1,
  updatedAt: 0,
  image: {
    assetId: 'asset-id',
    sourceType: 'blob' | 'data-url' | 'remote-url',
    name: 'ShotEasy.png',
    mimeType: 'image/png',
    width: 1920,
    height: 1080
  },
  canvas: {
    size: {
      type: 'auto' | 'custom' | 'default' | 'instagram' | 'x' | 'youtube' | 'pinterest',
      title: 'Auto',
      width: 800,
      height: 600
    },
    background: {
      type: 'none' | 'solid' | 'gradient' | 'builtin-image' | 'upload-image',
      presetKey: 'default_1',
      assetId: null,
      fill: null,
      mode: 'cover' | 'fit' | 'stretch',
      align: 'center',
      blur: 0,
      overlayColor: '#000000',
      overlayOpacity: 0,
      noise: 0
    }
  },
  screenshot: {
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    align: 'center',
    padding: 0,
    paddingColor: 'rgba(255,255,255,1)',
    cornerRadius: 10,
    shadow: 3,
    frame: 'none',
    frameMode: 'cover',
    hdrEnabled: false
  },
  watermark: {
    enabled: false,
    text: 'ShotEasy',
    color: '#00000030',
    direction: 45,
    onlyBackground: false
  },
  shapes: []
}
```

`fill` 保留 LeaferJS 可序列化颜色/渐变对象。图片资源只在文档中保存 `assetId` 或稳定远程标识，不保存 object URL。

### Shape 公共字段

```js
{
  id: 'random-id',
  type: 'Square',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  zIndex: 1,
  editable: true,
  visible: true,
  style: {}
}
```

V1 不提供图层 UI，但保留 `zIndex` 和 `visible`，供现有渲染、历史和未来兼容使用。

### Shape 类型

| 类型 | 特有数据 |
| --- | --- |
| `Square` | `style.stroke`、`style.strokeWidth`、`style.cornerRadius` |
| `SquareFill` | `style.fill`、`style.cornerRadius` |
| `Circle` | `style.stroke`、`style.strokeWidth` |
| `Slash` | `points`、`style.stroke`、`style.strokeWidth` |
| `MoveDownLeft` | `points`、`style.stroke`、`style.strokeWidth` |
| `Pencil` | `points`、`style.stroke`、`style.strokeWidth` |
| `Magnifier` | `style.strokeWidth`、`effect.zoom` |
| `Step` | `text`、`style.fill`、`style.strokeWidth` |
| `emoji` | `text`、`style.fontSize` |
| `text` | `text`、`textStyle` |
| `blur` | `effect.strength`、`effect.cornerRadius` |
| `mosaic` | `effect.blockSize`、`effect.cornerRadius` |
| `spotlight` | `effect.overlayColor`、`effect.opacity`、`effect.cornerRadius` |

现有 shape 数据迁移时，将当前顶层 `fill`、`strokeWidth`、`text` 等字段规范化到新结构。为降低一次性改动风险，M1 期间读取层应兼容旧字段；所有写入统一生成新结构。M7 确认无旧写入后再决定是否删除兼容读取。

## Store 设计

保留 `editor` 和 `option` 两个 MobX store，不引入 Zustand 或 Context 状态副本。

### `editor` 扩展职责

- 保存当前 `ProjectDocument` 的 image 和 shapes 部分。
- 保存 LeaferJS App、选择和工具等运行时状态。
- 提供 `serializeProject()`、`restoreProject(document)`。
- 提供历史 `commit()`、`undo()`、`redo()`、`resetHistory()`。
- 提供 `updateShape(id, patch)`，禁止组件直接改变 Map 内对象。
- 提供底图快照的请求、缓存与失效控制。

### `option` 扩展职责

- 保存 canvas、screenshot 和 watermark 配置。
- 保留现有 setter，内部映射到新字段，避免 UI 一次性重写导致回归。
- 提供 `toDocument()` 和 `restoreFromDocument()`。
- 提供 `applyLayoutPreset(id)`，一次性更新相关字段。

### UI 状态

面板展开、Drawer 开关、搜索词等保持组件局部状态，不进入 store 和历史。

## MobX 与 LeaferJS 同步

### 数据到画布

React 图层组件继续通过 effect 创建 LeaferJS 节点，并订阅 store 字段更新节点属性。

### 画布到数据

必须监听：

- 编辑器移动完成。
- 缩放完成。
- 旋转完成。
- 自由画笔绘制完成。
- 文字编辑完成。
- 删除和复制完成。

交互进行中可更新临时预览，但只在操作结束时写入最终 shape 并提交一个历史快照。不得为每一个 pointer move 创建历史记录。

选择多项的现有能力如果仍可触发，应逐项写回几何数据；V1 不新增多选 UI。

## 撤销与重做

### 历史结构

- 使用现有 `UndoRedoManager` 思路，改为保存去除 `updatedAt` 的项目快照。
- 最大 50 步。
- 初始图片载入后建立基准快照。
- 换图、删除图片和宿主 `defaultImg` 变化时重置历史。
- Undo 后发生新编辑时删除 redo 分支。

### 进入历史的操作

- 新建、删除、移动、缩放、旋转标注。
- 标注颜色、线宽、文字或效果属性修改。
- 尺寸、背景、图片样式、外框、水印、HDR 修改。
- 裁剪结果。
- 应用布局预设。

### 不进入历史的操作

- 视图缩放、视图滚动、适应画布。
- 主题切换。
- 工具选择、对象选择和面板开关。
- 导出格式、倍率和 loading。
- 消息提示。

### 操作合并

- Ant Design Slider 使用完成事件提交历史；连续 `onChange` 只更新预览。
- 颜色选择连续变化在 300ms 无新变化后提交一次。
- 文本输入在失焦、确认或 500ms 无输入后提交一次。
- 一次布局预设应用只提交一个快照。

历史恢复完成后，应取消无效选择，重新应用 document 到 store，再由现有 effect 更新画布；不得直接反向序列化 LeaferJS 整棵树。

## 布局预设技术约束

新增 `rotation` 为 screenshot 选项。旋转后的定位和边界使用现有 `calculateRotatedRectDimensions()` 计算，确保预设不会无意裁切主体。

布局预设配置只包含：

```js
{
  id,
  title,
  scale,
  rotation,
  align,
  padding,
  shadow,
  frame
}
```

预设不得包含背景、HDR、水印、图片资源或 shapes。

## 外框实现

- 继续由 `Screenshot` 图层组合 `container`、`box`、`image` 和装饰节点。
- 外框配置从组件内 switch 常量逐步提取为配置与小型创建函数。
- Card、Stack、Stack 2 和 Polaroid 使用 Leafer Rect 组成。
- Glass Light/Dark 使用半透明填充、描边和阴影；不依赖 CSS backdrop-filter，保证导出一致。
- Arc 风格只绘制通用标题栏和控件占位，不使用第三方品牌资源。
- 切换外框时必须清理前一个外框创建的所有节点和临时样式。

## 背景渲染

### 基础背景

`FrameBox` 仍是最终裁切边界。纯色和渐变继续使用 Leafer fill。图片背景使用 Leafer image fill，并保存 mode 与 align。

### 图片资源

- 内置远程背景配置包含 `id`、分类、缩略图 URL、完整图 URL 和可选版权信息。
- 选择远程背景时先 `fetch` 为 Blob，再创建内部 object URL；获取成功后才替换当前背景。
- 上传背景与原图共用资产存储模块。
- 换图、清空、恢复草稿和组件卸载时释放不再使用的 object URL。
- 远程获取失败、解码失败或 CORS 拒绝时显示中文错误，保持上一个有效背景。

### 轻量效果

- 图片背景模糊通过离屏 Canvas 处理后生成缓存 URL；纯色和渐变不执行模糊。
- 遮罩使用 Frame 内最底层图片之上的全尺寸 Rect。
- 噪点使用本地生成的小尺寸 data URL/SVG 纹理，以 repeat fill 平铺。
- 背景参数变化使用防抖，旧异步任务完成时需检查 task id，禁止覆盖较新的选择。

## 底图快照服务

放大镜、模糊和马赛克共享一个底图快照服务，避免每种效果各自导出：

1. 只捕获背景、外框和主截图，不包含普通标注、水印前景及区域效果自身。
2. 根据图片、裁剪、翻转、HDR、背景、外框、画布尺寸和图片样式生成 revision。
3. revision 未变化时复用快照。
4. 基础内容变化后以防抖方式重新生成。
5. 旧生成任务返回时如 revision 已变化则丢弃结果。

放大镜继续使用原始快照。模糊与马赛克分别缓存处理后的快照变体。

## 文字实现

- 新增 LeaferJS Text 节点并接入官方文字编辑插件。
- `textStyle` 包含 `fontSize`、`fontWeight`、`fill`、`textAlign`、`backgroundColor`、`padding` 和 `cornerRadius`。
- 文字背景通过 Text 的背景样式或与文字绑定的 Rect 实现，选择保证整体移动和导出。
- 双击进入文字编辑，结束编辑后同步 text 与实际尺寸。
- 移动端通过右侧/底部属性输入框编辑，不依赖双击。
- 不加载网络字体，使用项目系统字体栈。

## 区域效果实现

### 模糊

对底图快照通过离屏 Canvas `filter = blur(...)` 生成一份完整模糊图。效果 Rect 使用该图作 clip fill，并依据自身位置设置 offset。

### 马赛克

将底图快照缩小到块尺寸对应分辨率，再关闭平滑放大，得到完整马赛克图。效果 Rect 使用同样的 clip/offset 方式显示局部。

### 聚光

使用 Leafer Group 和 mask：全画布半透明遮罩作为内容，shape 几何作为透明开口。聚光对象的选框只编辑开口，不让全画布遮罩抢占命中。

区域效果移动和缩放时只调整裁切/遮罩参数，不重复处理整张快照。基础 revision 变化时才重新生成位图。

## IndexedDB 草稿

### 公共 API

```js
persistence?: false | {
  key: string;
  autoRestore?: boolean;
}
```

- 省略或传 `false`：不读取也不写入草稿。
- 传对象：以 `key` 隔离宿主数据，`autoRestore` 默认 `true`。
- 独立站传 `{ key: 'shoteasy-default', autoRestore: true }`。
- `defaultImg` 存在时不自动恢复草稿，成功加载后以它建立新项目。

### 数据库

数据库名：`shoteasy`，版本从 1 开始。

对象仓库：

- `projects`：key 为 persistence key，值为 ProjectDocument。
- `assets`：key 为 asset id，值包含 Blob、MIME、名称、创建时间和引用用途。

保存流程：项目变化后 750ms 防抖，先确保关联 Blob 已写入，再写 ProjectDocument。只有项目数据变化触发保存；视图缩放和面板状态不触发。

恢复流程：读取项目、验证 `version` 和必填字段、加载相关 Blob、创建运行时 object URL、恢复 store、建立历史基准。

清理流程：用户清空当前图片时删除对应 project 和不再引用的 assets。组件卸载只释放 object URL，不删除草稿。

异常处理：

- 数据损坏或版本未知：忽略草稿并提示，不自动覆盖坏数据。
- Blob 缺失：草稿视为不可恢复，回到初始页。
- `QuotaExceededError`：本次编辑继续，停止该会话自动保存并提示用户。
- IndexedDB 不可用：降级为无草稿模式，不影响编辑与导出。

## npm 组件兼容

现有入口保持：

```js
import { ImageBeautifier } from 'image-beautifier';
import 'image-beautifier/lib/style.css';
```

现有 Props 均保留。只新增 `persistence`，默认关闭，因此旧消费者行为不变。

独立站默认深色通过 `src/main.jsx` 显式传入 `isDark`，不得改变组件未传 `isDark` 时的既有判断顺序。

继续支持宿主替换头部左右内容。新的全局操作布局必须为 `headLeft` 和 `headRight` 保留稳定区域。

## 第三方参考和许可证

- 默认只参考 Screenshot Studio 的信息架构、交互和公开效果。
- 不复制其整体组件、store 或导出管线。
- 若某个独立算法必须复用，提交中记录原仓库 URL、文件路径、commit 和修改说明，并按 Apache-2.0 要求维护声明。
- 不复制参考站品牌名、Logo、设备素材或缩略图。
