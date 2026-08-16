# rico-screenshot

![preview](https://github.com/CH563/image-beautifier/blob/main/preview.png)

纯前端（无后端）的截图 / 图片美化编辑器：图片读取、编辑、标注、导出全部在浏览器端完成。既可以作为独立网站运行，也可以打包成 `image-beautifier` React 组件库供第三方集成。

上游在线预览：<https://screenshot.shoteasy.fun/>

## 功能特性

- 截图美化：渐变/纯色/纹理背景、圆角、阴影、留白
- 图片标注：方框、圆圈、箭头、直线、Emoji 表情
- 图片局部放大（放大镜）
- 添加水印（支持仅背景水印、HDR 效果）
- 修改尺寸，内置各社媒平台发布的尺寸预设
- 设备套壳（MacBook / iPhone 等设备边框）
- 浏览器窗口边框模拟
- 画布任意缩放和拖拽
- 多格式导出：PNG / JPG / WebP，1x / 2x / 3x 倍率
- 一键复制到剪贴板、快捷键支持

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9 / 10（仓库声明 `packageManager: pnpm@10.12.1`，推荐用 [corepack](https://nodejs.org/api/corepack.html) 自动匹配版本）

### 安装与启动

```bash
# 启用 corepack 以使用仓库指定的 pnpm 版本（可选）
corepack enable

# 安装依赖
pnpm install

# 启动开发服务器（Vite）
pnpm dev
```

启动后浏览器打开 Vite 输出的地址（默认 <http://localhost:5173>）即可看到编辑器。

> **已知问题**：当前仓库的 `pnpm-lock.yaml` 存在重复 YAML 键，`pnpm install --frozen-lockfile` 会报 `ERR_PNPM_BROKEN_LOCKFILE`。如遇此问题，本地可临时使用 `pnpm install --lockfile=false` 绕过（不具备可复现性，详见 [DOCS/development.md](DOCS/development.md#已知的安装阻塞)）。

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 构建独立站点，产物在 `dist/` |
| `pnpm build:lib` | 构建 npm ES 模块组件库，产物在 `lib/` |
| `pnpm preview` | 本地预览 `dist/` 构建结果 |
| `pnpm lint` | ESLint 检查 `.js` / `.jsx` |

项目没有后端服务、环境变量和数据库迁移；也没有自动化测试，改动后请至少运行 `pnpm lint` 和对应构建，并做浏览器手工验证（回归清单见 [DOCS/development.md](DOCS/development.md)）。

## 作为 React 组件使用

安装 npm 包：

```bash
npm install image-beautifier
```

React 组件示例：

```jsx
import { ImageBeautifier } from 'image-beautifier';
import 'image-beautifier/lib/style.css';

function App() {
  return (
    <ImageBeautifier
      persistence={{ key: 'my-editor', autoRestore: true }}
    />
  );
}
```

组件默认不读写本地草稿；需要恢复草稿时显式传入 `persistence`。完整 Props 说明见 [DOCS/component-api.md](DOCS/component-api.md)。

## 文档

详细文档在 [`DOCS/`](DOCS/README.md) 目录：

- [项目概览](DOCS/project-overview.md)：功能边界、技术栈、目录职责
- [架构与数据流](DOCS/architecture.md)：MobX 状态、LeaferJS 画布、图层与导出链路
- [用户功能](DOCS/user-guide.md)：导入、画布、标注、边框、水印与导出
- [开发指南](DOCS/development.md)：环境、命令、开发约定、回归清单
- [组件 API](DOCS/component-api.md)：npm 库入口与 `ImageBeautifier` 属性
- [V1 规划](DOCS/v1/README.md)：二次开发的 roadmap 与任务清单

## 技术栈

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [LeaferJS](https://github.com/leaferjs/ui)：画布渲染引擎
- [MobX](https://mobx.js.org/)：状态管理
- [Ant Design 5](https://ant.design/) + [Tailwind CSS](https://tailwindcss.cn/)：UI

## Roadmap / TODO

- [ ] Redo / Undo 步骤记录
- [ ] 接入 Unsplash 背景图
- [ ] 文字卡片
- [ ] 代码美化卡片
- [ ] GIF 动画

## 致谢与协议

本项目基于开源项目 [image-beautifier](https://github.com/CH563/image-beautifier)（RicoScreenshot 截图插件内核）二次开发，上游将用于谷歌截图插件 [RicoScreenshot](https://chromewebstore.google.com/detail/nmppkehciohcgcehlnifgeokgioidknh)。

[MIT License](license) © Chenliwen
