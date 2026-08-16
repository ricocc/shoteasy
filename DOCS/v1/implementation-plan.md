# V1 执行方案

## 执行约定

- 所有实现以 [V1 总纲](./README.md)、[产品规格](./product-spec.md)和[技术设计](./technical-design.md)为准。
- 阶段顺序固定为 M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7。
- 每个阶段开始时把对应 TODO 标为 `[-]`；完成代码不等于阶段完成，必须满足退出条件并记录验证结果。
- 不得跨阶段同时重写同一核心模块。例如 M2 布局期间不顺手实现 M5 区域效果。
- 工作树中存在用户改动时，先确认重叠文件，禁止覆盖无关修改。

## 目标代码组织

不要求一次性移动现有文件。新增模块按以下职责组织，旧组件在对应里程碑逐步接入：

```text
src/
├─ components/
│  ├─ layout/                 V1 顶部、左栏、右栏、移动抽屉和工作台布局
│  ├─ toolbar/                底部工具栏及上下文工具
│  ├─ panels/                 比例、外框、布局、背景、图片和对象属性面板
│  └─ editor/layers/          原有和新增 LeaferJS 图层
├─ models/
│  └─ projectDocument.js      schema、默认值、验证与迁移
├─ stores/
│  ├─ editor.js               编辑和运行时状态
│  ├─ option.js               画布/图片/背景配置
│  └─ history.js              项目快照历史封装
├─ services/
│  ├─ assetStore.js           Blob、object URL 和资源生命周期
│  ├─ draftStore.js           IndexedDB 草稿
│  └─ baseSnapshot.js         放大镜与区域效果共享快照
└─ utils/
   ├─ backgroundConfig.js
   ├─ frameConfig.js
   ├─ layoutPresets.js
   └─ sizeConfig.js
```

现有组件可保留原路径并变成新面板的薄封装，避免大规模移动与功能重写同时发生。

## M0：开发基线

### 目标

建立可复现的安装和验证环境，并留下旧功能基准。

### 实施步骤

1. 确认 Node 与 pnpm 版本，以当前验证环境的 pnpm 10.12.1 为基准，在 `package.json` 增加 `packageManager`。
2. 专门修复损坏的 `pnpm-lock.yaml`：删除无效锁文件后由 package.json 重新解析依赖，检查 diff 中不存在非预期依赖升级。
3. 安装 `mage-icons-react` 和与当前 LeaferJS 版本一致的 `@leafer-in/text-editor`；不得提前加入其他大型库。
4. 执行 frozen install，确认新锁文件可用。
5. 运行 lint、站点构建和库构建，记录所有既有失败；若存在失败，先判断是旧问题还是环境问题。
6. 使用 `src/assets/demo.png` 按 [验收标准](./acceptance.md) 的旧功能清单记录基线结果。
7. 保存关键基准信息到 `TODO.md` 的 M0 验证记录：命令、浏览器、已知失败、导出尺寸。

### 约束

- M0 不修改 UI 和业务逻辑。
- 除修复锁文件和安装已批准依赖外，不做依赖升级。
- 不运行 `pnpm release`。

### 退出条件

- `pnpm install --frozen-lockfile` 成功。
- lint、`pnpm build`、`pnpm build:lib` 均成功，或旧失败已有明确记录和单独处理决定。
- 当前主要用户流程已有基线记录。

## M1：状态与历史

### 目标

建立 V1 后续功能共同依赖的可序列化事实来源和撤销/重做。

### 实施步骤

1. 新建 `projectDocument.js`，实现版本常量、默认文档、轻量字段校验、旧 store 数据到 v1 文档转换。
2. 为 option 增加 `toDocument()` 和 `restoreFromDocument()`，保留所有旧 setter。
3. 为 editor 增加 `serializeProject()`、`restoreProject()` 和统一 `updateShape()`。
4. 将 shape 新写入格式规范化，同时兼容读取旧 shape 字段。
5. 监听 LeaferJS 移动、缩放和旋转结束事件，将最终几何写回 shape；自由绘制仍只在完成时提交。
6. 用现有 `UndoRedoManager` 或等价封装建立 50 步项目快照历史。
7. 把现有 Header 中注释的撤销/重做按钮接回临时位置，M2 再迁移到新顶部栏。
8. 把 Slider、颜色和文本类操作接入合并策略，避免高频快照。
9. 换图、清空、defaultImg 变化时重置历史；恢复历史时取消无效选择。

### 重点检查

- history 中不能包含 LeaferJS App、Blob、object URL、message 或 DOM。
- `updatedAt` 不参与快照相等判断。
- Undo/redo 不能重新创建多份事件监听。
- 放大镜快照不进入项目文档。

### 退出条件

- 所有现有标注移动、缩放、旋转后可撤销和重做。
- 尺寸、背景、圆角、阴影、水印和 HDR 可撤销和重做。
- 视图缩放和主题切换不会污染历史。
- 连续 Slider 拖动只新增一个历史步骤。
- 原有导出结果无可见变化。

## M2：布局、中文与视觉

### 目标

只重组控制界面，不改变画布业务结果。

### 实施步骤

1. 建立 V1 Workspace 外壳：TopBar、LeftRail、CanvasArea、RightInspector、BottomToolbar。
2. 独立站入口显式启用深色；组件入口继续使用现有主题判断。
3. 将下载/复制和设置移到顶部右侧，保留格式与倍率 Popover。
4. 将尺寸和外框入口迁到左侧；右侧暂时继续承载原控制组件。
5. 将现有标注工具迁移到底部工具栏，颜色与线宽改为上下文控制。
6. 将右侧拆成背景、图片、边框阴影、水印/HDR 分组。
7. 把所有可见英文文案统一改为中文，包括错误、权限、导出和删除确认。
8. 改造 `Icon.jsx` 为 Mage Icons 映射层；为图标统一 size、className、aria-hidden 和事件透传。
9. 逐项替换 Lucide 图标；全部替换并完成构建后删除 `lucide-react`。
10. 实现桌面三栏以及平板/手机抽屉和横向滚动工具栏。

### 视觉规则

- 深色背景使用中性灰黑，面板与画布工作区通过层级而非大面积边框区分。
- 主强调色统一，不复刻参考产品的品牌色值。
- 控件圆角、间距、阴影使用少量固定 token，禁止每个组件自行定义相近值。
- 触控按钮最小命中区域 40px；纯图标按钮必须有 Tooltip 或 aria-label。

### 退出条件

- 桌面、平板和手机均能访问全部现有核心功能。
- `headLeft` 和 `headRight` 自定义内容正常。
- 画布层级和导出像素结果与 M0 基准一致。
- 源码中不再直接导入 `lucide-react`。

## M3：比例、外框与 3D 旋转

### 目标

完成左侧结构控制能力。

### 实施步骤

1. 将尺寸配置标准化为可搜索条目，保留当前 Auto、自定义和平台预设数据。
2. 比例面板支持分类、搜索、宽高输入和选中态；搜索为空时显示本地全部分类。
3. 将现有 Screenshot 外框 switch 拆成配置与创建函数，先保证旧外框结果一致。
4. 使用 LeaferJS 基础节点实现新增七类外框；每类外框提供独立预览缩略图。
5. 所有外框切换统一执行 cleanup，禁止残留前一个标题栏、阴影和 cornerRadius。
6. 增加 screenshot X/Y/Z 三轴旋转和仿射立体强度，使用变换后的四角边界参与定位。
7. 新建六个快捷角度配置；应用时调用一个 store action 并提交一次历史。
8. 使用 CSS 生成轻量角度缩略图，不为每个预设实例化完整 Leafer App。

### 退出条件

- 原有和新增外框可来回切换，无残留节点或样式。
- 三轴旋转和六个快捷角度不覆盖背景、HDR、水印和 shapes。
- Auto 尺寸在导入和裁剪后仍正常更新。
- 组合旋转与最大立体强度不会意外裁掉主体。

## M4：背景系统

### 目标

在不引入图片搜索服务的情况下，提供清晰、可靠的背景工作流。

### 实施步骤

1. 将 backgroundConfig 从依赖 key 命名分类改为显式 `type` 和 `category` 字段，同时兼容旧 key。
2. 重组现有纯色、渐变和远程图片为统一背景选择器。
3. 增加“无背景”和本地背景上传。
4. 背景图片支持 Cover、Contain、Stretch 和九宫格位置。
5. 建立 assetStore，集中负责 File/Blob、加载、object URL 创建、引用和释放。
6. 远程背景获取成功后才提交 store；失败时保留原选择。
7. 增加图片背景模糊缓存、遮罩 Rect 和 repeat 噪点纹理。
8. 背景异步处理使用 task id 或 AbortController，防止旧结果覆盖新选择。

### 退出条件

- 五种背景类型均可预览、撤销、重做和导出。
- 上传背景不会替换主截图。
- 图片模式、位置、模糊、遮罩和噪点与导出一致。
- 连续切换背景后不存在明显 object URL 泄漏。
- 断网或 CORS 失败不会清空当前有效作品。

## M5：文字与区域效果

### 目标

补齐截图说明和隐私遮挡的高价值工具。

### 实施步骤

1. 建立共享底图快照服务，把现有放大镜改为使用该服务。
2. 定义底图 revision 和失效条件，保证异步结果按版本应用。
3. 接入 LeaferJS 文字编辑插件并增加 text shape。
4. 实现文字创建、双击编辑、属性面板编辑、移动、缩放、旋转、删除和历史。
5. 生成模糊和马赛克完整快照变体，区域节点只处理 clip 与 offset。
6. 实现 blur 和 mosaic shape 的绘制、选择、强度调整和导出。
7. 使用 Leafer mask 实现 spotlight shape；控制柄只作用于聚光开口。
8. 验证多个区域效果同时存在时的 zIndex、选择和快照循环问题。

### 退出条件

- 文字和三种区域效果均可创建、编辑、撤销、重做和删除。
- 裁剪、翻转、HDR、外框、背景和尺寸变化后效果自动更新。
- 区域移动和缩放期间不重复处理整张底图。
- 放大镜不包含其他标注，区域效果不递归捕获自身。
- 1x/2x/3x 导出位置一致。

## M6：本地草稿

### 目标

为独立站提供可靠恢复，同时不改变旧组件默认行为。

### 实施步骤

1. 实现 draftStore 的 IndexedDB 打开、升级、读取、写入和删除。
2. assetStore 增加 Blob 持久化与恢复。
3. App 新增 `persistence` Prop，默认 `false`。
4. 独立站入口传入固定 key；组件只有明确传配置才启用。
5. 项目变化后 750ms 防抖保存；写入顺序为 assets 后 project。
6. 加载时处理 defaultImg 优先级，再决定是否恢复草稿。
7. 清空时删除项目和孤立资源；卸载只释放 object URL。
8. 实现损坏草稿、未知版本、Blob 缺失、配额不足和 IndexedDB 不可用提示。

### 退出条件

- 独立站刷新后恢复画布、背景、外框和全部标注。
- defaultImg 不被旧草稿覆盖。
- 两个不同 persistence key 不共享数据。
- 未传 persistence 的组件不访问 IndexedDB。
- 清空后刷新不会恢复被删除作品。
- 保存失败不影响继续编辑和导出。

## M7：回归与交付

### 实施步骤

1. 按 [验收标准](./acceptance.md) 完整执行旧功能和 V1 功能清单。
2. 覆盖透明 PNG、JPG/WebP 白底以及 1x/2x/3x。
3. 在临时 Vite React 消费项目中加载 `build:lib` 产物，验证全部旧 Props 和新增 persistence。
4. 执行 lint、站点构建、库构建和 preview。
5. 检查 bundle 产物，确认未意外打包整套图标或引入 Screenshot Studio 重依赖。
6. 更新 `DOCS/architecture.md`、`user-guide.md`、`component-api.md`、`development.md` 和根 README。
7. 将 TODO 中剩余项逐一完成、明确顺延或记录已知问题，不得无说明留空。

### 退出条件

- 所有阻断级和高优先级验收项通过。
- 旧组件集成方式保持有效。
- 文档只把实际完成的 V1 能力写成已实现。
- 没有未说明的构建失败、权限限制或浏览器差异。

## 风险与处理

| 风险 | 处理方式 |
| --- | --- |
| 锁文件重建导致依赖漂移 | M0 单独提交并审查，不混入业务修改 |
| Store 与 LeaferJS 状态不一致 | M1 先统一写入口和变换结束同步 |
| UI 重排导致功能入口丢失 | M2 对照 M0 基线逐项迁移，不删除旧组件后再补功能 |
| 远程背景污染导出 | 先 fetch Blob，本地 URL 成功后才设置画布 |
| 快照效果循环捕获 | 共享底图快照，明确排除标注和效果层 |
| 大图导致内存增长 | 缓存按 revision 替换并及时 revoke object URL |
| 草稿覆盖宿主图片 | defaultImg 优先，组件 persistence 默认关闭 |
| Mage Icons 包体过大 | 通过适配层按具体文件/导出引用并检查构建产物 |
| 参考代码带来许可证问题 | 默认只参考行为，代码复用必须登记来源和许可 |
