# 开发指南

## 环境与安装

建议使用 Node.js 18+ 和 pnpm 9/10。仓库当前没有声明 `engines` 或 `packageManager`，CI/维护者应尽量固定实际使用版本以减少依赖漂移。

正常情况下应执行：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发服务器由 Vite 启动。项目没有环境变量、后端服务或数据库迁移。

### 已知的安装阻塞（已修复）

历史问题：`pnpm-lock.yaml` 曾因依赖快照重复写入（如 `eastasianwidth@0.2.0` 在文件中重复出现）属于无效 YAML，`pnpm install --frozen-lockfile` 报 `ERR_PNPM_BROKEN_LOCKFILE: duplicated mapping key`。2026-08-12 的提交 `11cc0ac` 重新生成锁文件后问题消除，当前 `--frozen-lockfile` 可正常通过（已验证 `packages` / `importers` 两段无重复键）。

若今后再次出现同类问题，标准修复流程：

1. 确认使用与 `packageManager` 字段一致的 pnpm 版本（`corepack enable`）；
2. 删除 `pnpm-lock.yaml` 后执行 `pnpm install` 重新生成；
3. 审查锁文件 diff（关注依赖版本意外漂移），再以 `pnpm install --frozen-lockfile` 验证后提交。

`pnpm install --lockfile=false` 仅可作本地临时诊断，不具备可复现性，不能视为锁文件已验证，也不应提交生成的临时内容。

## 常用命令

| 命令 | 用途 | 预期产物 |
| --- | --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 | 无提交产物 |
| `pnpm build` | 构建独立站点 | `dist/` |
| `pnpm build:lib` | 构建 npm ES 模块 | `lib/` |
| `pnpm lint` | 检查 `.js/.jsx` | 无 |
| `pnpm preview` | 预览站点构建 | 需要先有 `dist/` |
| `pnpm release` | 发布 npm 包 | 外部副作用，只有明确发布时运行 |

项目没有测试命令。每次代码修改至少应运行 lint 和对应构建，并按改动范围完成浏览器手工验证。

## 路径别名

`vite.config.js` 与 `jsconfig.json` 共同定义：

| 别名 | 目录/文件 |
| --- | --- |
| `@components` | `src/components` |
| `@assets` | `src/assets` |
| `@style` | `src/style`（仅 Vite 配置） |
| `@stores` | `src/stores/index.js` |
| `@utils` | `src/utils` |
| `@hooks` | `src/hooks` |

新增别名时要同步更新 Vite 和 `jsconfig.json`，否则编辑器跳转与实际构建会不一致。

## 修改常见功能

### 新增画面选项

1. 在 `src/stores/option.js` 添加默认值和 action。
2. 在 `src/components/sideBar/` 增加控制项。
3. 在 `Screenshot.jsx`、`FrameBox.jsx` 或相应图层中增加响应式 effect。
4. 检查设备框、自动尺寸、HDR、放大镜快照和导出的组合行为。

### 新增标注工具

1. 在 `Header.jsx` 的 `toolList` 加入工具。
2. 在 `View.jsx` 决定是单击还是拖拽创建，并定义初始业务数据。
3. 在 `ShapeLine.jsx` 创建对应 Leafer 节点，并同步几何、颜色、线宽和 editable 状态。
4. 验证选择、移动、缩放、旋转、删除、zIndex 和导出。

### 新增背景

在 `src/utils/backgroundConfig.js` 添加唯一键、预览 `class` 和 Leafer `fill`。键名应包含 `solid`、`gradient`、`cosmic` 或 `desktop`，侧栏按该字符串分类。远程图片必须验证 CORS 和导出可用性。

### 新增尺寸预设

在 `src/utils/sizeConfig.js` 添加类别或条目，提供实际 `width`/`height` 与展示比例 `w`/`h`。尺寸值直接成为最终导出逻辑像素。

## 手工回归清单

最低建议覆盖：

1. 文件、拖放、粘贴和示例图片能进入编辑器；若改动媒体能力，再测屏幕捕获。
2. Auto、自定义及至少一个预设尺寸能正确调整画布。
3. 背景、圆角、阴影、留白、翻转、位置和缩放能实时更新。
4. 普通边框、浏览器标题栏和至少一个设备框显示正确。
5. 每种受影响标注能创建、选中、变形和删除；放大镜能随底图样式更新。
6. 水印前景/仅背景与 HDR 开关正常。
7. PNG/JPG/WebP 以及 1x/2x/3x 至少各抽查一组，导出尺寸正确。
8. 复制和所有相关快捷键在 HTTPS 或 localhost 下工作。
9. 亮/暗主题和窄屏布局无明显回归。
10. 删除图片后回到初始页，LeaferJS 画布与标注已清理。

## 已知技术债与风险

- 锁文件损坏，frozen install 失败。
- README 和部分源码注释在当前文件内容中呈现乱码，需要单独确认原始编码后修复。
- 无自动化测试、CI 配置和浏览器兼容性矩阵。
- `UndoRedoManager` 未接入，界面也未开放撤销/重做。
- store 与固定 DOM ID 导致多实例不安全。
- `App.jsx` 在组件渲染阶段调用 `setMessage`、`setClearFun`，并用 `useMemo` 执行主题副作用；后续重构应改为合适的 effect。
- blob 图片载入创建的 object URL 没有在换图/清理时回收，长会话可能积累内存。
- `text2Svg` 将水印文字直接拼入 SVG/HTML 字符串，应对特殊字符进行转义。
- 外部 Unsplash 背景、浏览器媒体和剪贴板权限会影响功能稳定性。
- `package.json` 将库运行依赖列为 dependencies，但库构建又全部 external；发布前应核对消费者依赖策略。

## 文档维护

功能、公共属性、命令、依赖策略或目录职责变化时，同步更新 `DOCS/` 和根目录 `AGENTS.md`。文档应描述已合入的事实；规划项要明确标为未实现。
