# 项目概览

## 项目定位

RicoScreenshot（包名 `image-beautifier`）将一张本地图片、粘贴图片或屏幕截图放入可配置画布，叠加背景、留白、圆角、阴影、浏览器/设备外框、标注、水印与 HDR 风格处理，最后导出 PNG、JPG 或 WebP。

项目提供两种交付形态：

1. 独立站点：`src/main.jsx` 将 `App` 挂载到 `index.html#root`，由 `pnpm dev` 或 `pnpm build` 使用。
2. React 组件库：`src/index.js` 导出 `ImageBeautifier`，由 `pnpm build:lib` 构建到 `lib/`。

## 已实现能力

- 通过文件选择、拖放、剪贴板粘贴、屏幕捕获或内置示例导入图片。
- 自适应画布、自定义尺寸，以及 Instagram、X、YouTube、Pinterest 等尺寸预设。
- 缩放、裁剪、水平/垂直翻转和九宫格对齐。
- 图片留白、留白颜色、圆角、阴影和整体缩放。
- 纯色、渐变、Unsplash 远程图片背景。
- 基础/创意外框、可配置 URL 与顶部尺寸的 Safari/Chrome/Arc 浏览器框，以及 MacBook、iMac、iPad、iPhone 设备框。
- 可导出的视觉 3D 旋转：X/Y/Z 三轴、仿射立体强度、六个快捷角度和一次性撤销/重做。
- 矩形、实心矩形、圆形、直线、箭头、自由画笔、局部放大镜、步骤编号和 Emoji 标注。
- 重复文字水印，可切换到截图下方；浏览器 Canvas 实现的 HDR 风格增强。
- PNG/JPG/WebP 导出，1x/2x/3x 像素倍率，以及 PNG 剪贴板复制。
- 亮色/暗色主题、画布缩放与快捷键。
- 独立站通过 IndexedDB 自动保存和恢复草稿；组件库默认关闭，可用 `persistence` 显式开启。

## 尚未完成或未接入

- 撤销/重做：已接入顶部栏；渐变角度、图片样式重置等操作会生成可恢复的项目历史记录。
- 文本美化、代码美化和 GIF：当前不提供入口，仍不属于可用功能。
- 自动化测试：`package.json` 没有 `test` 脚本，仓库内也没有测试文件。
- 服务端能力：没有 API、数据库、账户系统或上传服务。

## 技术栈

| 类别 | 选型 | 用途 |
| --- | --- | --- |
| UI 框架 | React 18 | 组件与生命周期 |
| 构建 | Vite 5、SWC | 开发服务器、站点/库构建 |
| 状态 | MobX、mobx-react-lite | 编辑器与美化选项的响应式状态 |
| 画布 | LeaferJS 2.1.10 及插件 | 图层、选择器、缩放、拖拽、导出 |
| 组件库 | Ant Design 5 | 按钮、抽屉、弹层、滑块、消息等 |
| 样式 | Tailwind CSS 3、CSS | 布局、主题、局部组件样式 |
| 图片裁剪 | CropperJS、react-cropper | 裁剪弹窗 |
| 图标/Emoji | lucide-react、Emoji Mart | 工具栏与 Emoji 选择器 |
| 工具 | lodash、nanoid、tinykeys | 防抖、ID、快捷键等 |

## 目录职责

```text
.
├─ DOCS/                         项目维护文档
├─ src/
│  ├─ assets/                    示例图、设备框、光标和 SVG 资源
│  ├─ components/
│  │  ├─ editor/                 LeaferJS 画布、缩放、快捷键与图层
│  │  ├─ header/                 标注工具栏和主题入口
│  │  ├─ init/                   未导入图片时的初始页
│  │  └─ sideBar/                尺寸、外观、背景、水印、导出设置
│  ├─ hooks/                     图片载入、粘贴、导出快捷键
│  ├─ stores/                    MobX 单例状态
│  ├─ style/                     Tailwind 入口和项目 CSS
│  ├─ utils/                     配置、图像/SVG 工具、截屏与未接入历史栈
│  ├─ App.jsx                    可嵌入的顶层组件
│  ├─ index.js                   组件库导出入口
│  └─ main.jsx                   独立站点入口
├─ index.html                    独立站点页面、SEO 与 Umami 脚本
├─ vite.config.js                路径别名及站点/库双构建配置
└─ package.json                  脚本、依赖和 npm 包元数据
```

## 外部依赖与运行条件

- 远程背景来自 `images.unsplash.com`；加载失败或跨域策略变化会影响预览与导出。
- 独立页面从 `cloud.umami.is` 加载统计脚本；组件库本身不会注入该脚本。
- 屏幕捕获依赖 `navigator.mediaDevices.getDisplayMedia()`。
- 剪贴板复制依赖 `navigator.clipboard.write()` 和 `ClipboardItem`。
- 取色器仅在实现 `window.EyeDropper` 的浏览器显示。
- 上述屏幕、剪贴板类 API 通常要求 HTTPS 或 localhost，并受浏览器权限控制。
