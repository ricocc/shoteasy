# ShotEasy / Image Beautifier 文档

本目录记录当前仓库的实际实现。项目是一个运行在浏览器中的截图与图片美化编辑器，也可以构建为 `image-beautifier` React 组件库。它没有后端服务：图片读取、编辑、截屏、复制和导出均在浏览器端完成。

## 文档导航

- [项目概览](./project-overview.md)：功能边界、技术栈、目录职责与当前状态。
- [架构与数据流](./architecture.md)：MobX 状态、LeaferJS 画布、图层组合和导出链路。
- [用户功能](./user-guide.md)：导入、画布设置、标注、边框、水印、HDR 与导出。
- [开发指南](./development.md)：环境、命令、开发约定、验证方法和已知问题。
- [组件 API](./component-api.md)：npm 库入口、`ImageBeautifier` 属性和集成限制。

## 快速定位

| 目标 | 主要文件 |
| --- | --- |
| 应用入口 | `src/main.jsx`、`src/App.jsx` |
| npm 库入口 | `src/index.js` |
| 编辑器运行时状态 | `src/stores/editor.js` |
| 美化选项状态 | `src/stores/option.js` |
| LeaferJS 画布初始化 | `src/components/editor/View.jsx` |
| 截图图层与设备框 | `src/components/editor/layers/Screenshot.jsx` |
| 标注图形 | `src/components/editor/layers/ShapeLine.jsx` |
| 右侧配置栏 | `src/components/sideBar/SideBar.jsx` |
| 导出与复制 | `src/components/sideBar/DownloadBar.jsx` |
| 尺寸预设 | `src/utils/sizeConfig.js` |
| 背景预设 | `src/utils/backgroundConfig.js` |

## 当前验证状态

仓库的 `pnpm-lock.yaml` 含有重复 YAML 映射键，`pnpm install --frozen-lockfile` 会报 `ERR_PNPM_BROKEN_LOCKFILE`。在修复锁文件前，无法完成可复现的依赖安装；详情见[开发指南](./development.md#已知的安装阻塞)。
