# AGENTS.md

本文件适用于整个仓库。更完整的项目背景见 [`DOCS/README.md`](DOCS/README.md)。

## 项目摘要

- 这是 React 18 + Vite 的浏览器端图片美化编辑器，也通过 `src/index.js` 发布 `ImageBeautifier` 组件。
- React/Ant Design/Tailwind 负责界面，MobX 负责全局状态，LeaferJS 负责画布、图层、编辑和导出。
- 没有后端、数据库或环境变量。媒体捕获、Canvas、剪贴板、下载和远程图片均在浏览器端运行。
- `src/stores/editor.js` 与 `src/stores/option.js` 导出单例；不要假设多实例隔离或 SSR 可用。

## 开始工作前

1. 阅读 `DOCS/project-overview.md` 和与任务相关的专题文档。
2. 如果任务属于 V1，必须继续阅读 `DOCS/v1/README.md`、对应专题设计、`DOCS/v1/implementation-plan.md` 和 `DOCS/v1/TODO.md`，确认当前里程碑、依赖项和退出条件。
3. 检查 `git status --short`，保留用户已有改动，不修改无关文件。
4. 用 `rg` / `rg --files` 定位代码；路径别名定义在 `vite.config.js` 和 `jsconfig.json`。
5. 先确认功能是否已实现。撤销/重做、文本美化、代码美化、GIF 和自动化测试目前未完成，不要在文档或 UI 中误称可用。

## 安装与命令

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm build
pnpm build:lib
```

注意：当前 `pnpm-lock.yaml` 有重复映射键，frozen install 会失败。除非任务明确要求修复依赖，否则不要顺手重写或提交锁文件；执行 V1 M0 时才视为已有明确授权。临时诊断可使用 `pnpm install --lockfile=false`，但验证结果必须注明不是可复现安装。

`pnpm release` 会执行 `npm publish`，具有外部副作用；只有用户明确要求发布并确认包内容时才能运行。

## 代码导航

- `src/App.jsx`：公共顶层组件、主题、初始图与布局。
- `src/stores/editor.js`：图片、Leafer App、标注、工具、主题和清理生命周期。
- `src/stores/option.js`：尺寸、背景、截图样式、设备框、水印与 HDR。
- `src/components/editor/View.jsx`：Leafer App 初始化、绘制事件、缩放与图层编排。
- `src/components/editor/layers/`：最终画布、截图/设备框、标注和水印图层。
- `src/components/header/`：标注工具栏。
- `src/components/sideBar/`：画面配置和导出。
- `src/utils/sizeConfig.js` / `backgroundConfig.js`：尺寸与背景数据源。
- `src/index.js`：npm 组件库公共入口；`src/main.jsx`：独立站入口。

## 实现约定

- 使用现有 ES module、函数组件、Hooks、MobX action 和路径别名风格；不要无故引入另一套状态或样式方案。
- React 图层组件通过 effect 管理 LeaferJS 节点。创建节点后必须在 cleanup 中移除节点/监听器/计时器；创建 Leafer App 的代码还要处理销毁。
- 新增 option 时同时检查 store、侧栏控制、对应画布 effect、自动尺寸、设备框、放大镜快照和导出。
- 新增标注时同时检查 `Header.jsx` 工具入口、`View.jsx` 创建事件、`ShapeLine.jsx` 节点映射，以及选择/变形/删除/导出。
- `editor.shapes` 的业务数据和 Leafer 节点状态必须保持同步；不要只改其中一侧。
- 背景配置键依赖名称中的 `solid`、`gradient`、`cosmic`、`desktop` 分类。远程背景需考虑 CORS 与导出污染。
- 新增/修改路径别名时同步更新 `vite.config.js` 和 `jsconfig.json`。
- 保持公共组件 API 向后兼容。改变 `ImageBeautifier` props、库入口或样式产物时更新 `DOCS/component-api.md` 和 README。
- 浏览器全局 API 使用前考虑能力检测、安全上下文、权限拒绝和资源清理；不要把浏览器专用代码移到会在 SSR 顶层执行的位置。
- 不要把计划项写成已实现事实。代码中的现有乱码注释/README 属于已知编码问题，若任务不涉及编码修复，不要大范围改写源文件。

## V1 工作约束

- `DOCS/v1/README.md` 中的锁定决策是 V1 实现的最高优先级规范；临时偏好不得覆盖它。
- 严格按 M0—M7 顺序推进。当前阶段退出条件未满足时，不开始依赖该阶段的后续任务。
- 开始任务时将 `DOCS/v1/TODO.md` 对应项标为“进行中”；只有代码、文档和要求的验证全部完成并记录结果后，才能标为“完成”。阻塞项要写明原因。
- 不得在里程碑内顺手加入未列入 V1 的功能，也不得为视觉优化替换 React、Vite、MobX、LeaferJS、Ant Design 或现有构建方式。
- 不得破坏已有 `ImageBeautifier` Props、库入口、导出格式和快捷键。独立站新增默认行为不得静默改变 npm 组件的默认行为。
- V1 默认只借鉴 Screenshot Studio 的交互和组织方式；如复用具体源码，必须先记录来源文件、修改范围和 Apache-2.0 声明。
- 设计需要变化时，先更新 V1 锁定决策及影响分析，再改代码和 TODO；不得让实现先于规范漂移。
- 每个阶段都要执行对应的现有功能回归，不得只验证新增功能。

## 验证要求

- 文档或纯配置变更：检查链接、命令、文件名和实现描述，运行可用的 Markdown/项目检查。
- JS/JSX 变更：至少运行 `pnpm lint` 和相关构建（站点用 `pnpm build`，库 API/入口用 `pnpm build:lib`）。
- 项目没有测试套件；按 `DOCS/development.md` 的手工回归清单验证受影响路径，并在交付说明中列出未能验证的浏览器能力。
- 涉及导出时至少检查透明 PNG、JPG/WebP 白底、像素倍率和最终尺寸；涉及远程背景时检查网络/CORS；涉及剪贴板或截屏时在 HTTPS/localhost 验证权限流程。
- 若依赖安装因已知锁文件问题失败，应原样报告，不要把未运行的构建或 lint 声称为通过。

## 文档同步

代码职责、功能、公共 API、开发命令、依赖安装方式或已知限制发生变化时，更新 `DOCS/`。V1 工作还要同步 `DOCS/v1/TODO.md` 和对应验收记录。保持文档链接为相对仓库路径，并明确区分当前实现与规划内容。
