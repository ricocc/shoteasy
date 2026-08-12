# ShotEasy / Image Beautifier 文档

本目录记录当前仓库的实际实现。项目是一个运行在浏览器中的截图与图片美化编辑器，也可以构建为 `image-beautifier` React 组件库。它没有后端服务：图片读取、编辑、截屏、复制和导出均在浏览器端完成。

## 当前版本文档

以下文档描述仓库中已经存在的实现，应作为判断“当前是否可用”的依据：

- [项目概览](./project-overview.md)：功能边界、技术栈、目录职责与当前状态。
- [架构与数据流](./architecture.md)：MobX 状态、LeaferJS 画布、图层组合和导出链路。
- [用户功能](./user-guide.md)：导入、画布设置、标注、边框、水印、HDR 与导出。
- [开发指南](./development.md)：环境、命令、开发约定、验证方法和已知问题。
- [组件 API](./component-api.md)：npm 库入口、`ImageBeautifier` 属性和集成限制。

## V1 规划中的实现规范

[`v1/README.md`](./v1/README.md) 是 V1 开发的总入口。V1 文档描述计划中的目标和实现约束，除非对应 TODO 已完成并附有验证记录，否则不得将其中功能视为当前已经实现。

- [V1 产品规格](./v1/product-spec.md)：产品定位、界面布局、功能范围和明确不做事项。
- [V1 技术设计](./v1/technical-design.md)：项目文档、历史记录、草稿、背景、外框、文字与区域效果。
- [V1 实施计划](./v1/implementation-plan.md)：M0—M7 的执行步骤、依赖关系和退出条件。
- [V1 TODO](./v1/TODO.md)：唯一任务进度清单，完成项必须附验证结果。
- [V1 验收规范](./v1/acceptance.md)：旧功能回归、新功能、导出、组件 API 和浏览器验收矩阵。

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
