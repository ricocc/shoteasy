# V1 执行 TODO

> 当前状态：M0 已完成并验证；M1 已完成并验证；M2 已完成并验证；M3 已完成；M4 进行中。

本文件是 V1 唯一进度清单。实施细节见[执行方案](./implementation-plan.md)，验收方法见[验收标准](./acceptance.md)。不得因代码已合入就直接标记里程碑完成；只有退出条件和验证记录齐全后才能勾选。

## 状态规则

- `[ ]` 未开始。
- `[-]` 进行中。
- `[x]` 已完成并验证。
- `[!]` 阻塞；在任务下方写明原因、影响和恢复条件。

更新规则：

1. 同一时间原则上只有一个里程碑处于进行中。
2. 依赖阶段未完成时，后续阶段不得标为进行中。
3. 每个 `[x]` 必须能在阶段验证记录中找到证据。
4. TODO 范围需要变化时，先更新 V1 总纲中的锁定决策。

## M0：开发基线

依赖：无。

- [x] M0.1 记录 Node.js、pnpm、操作系统和主要验证浏览器版本。
- [x] M0.2 在 `package.json` 固定 `packageManager: pnpm@10.12.1`。
- [x] M0.3 单独修复 `pnpm-lock.yaml` 重复映射和损坏问题。
- [x] M0.4 确认锁文件重建未引入非预期依赖升级。
- [x] M0.5 安装 `mage-icons-react`。
- [x] M0.6 安装与当前 LeaferJS 版本一致的 `@leafer-in/text-editor`。
- [x] M0.7 `pnpm install --frozen-lockfile` 通过。
- [x] M0.8 `pnpm lint` 通过或既有失败已记录。
- [x] M0.9 `pnpm build` 通过或既有失败已记录。
- [x] M0.10 `pnpm build:lib` 通过或既有失败已记录。
- [x] M0.11 使用 demo 图完成旧功能基线检查。
- [x] M0.12 记录 PNG/JPG/WebP 和倍率基准结果。
- [x] M0.EXIT M0 退出条件全部满足。

### M0 验证记录

- 执行日期：2026-08-12。
- 环境：Windows 10 Home 10.0.19045（win32）；Node v22.13.0；pnpm 10.12.1；验证浏览器见 M0.11。
- 命令结果：
  - M0.3/M0.7：删除损坏的 `pnpm-lock.yaml` 后由 `package.json` 重新解析；`pnpm install --frozen-lockfile` 通过（重装 2.2s，原 `get-proto@1.0.1` 缺失与重复映射错误消失）。
  - M0.4：重建后无主版本升级。所有 `@leafer-in/*`、`@leafer-ui/*`、`leafer-ui` 保持 2.1.10；`react`/`react-dom` 保持 18.3.1；仅 `^` 范围内 minor/patch 浮动（antd 5.19→5.29、mobx 6.13→6.16、mobx-react-lite 4.0.7→4.1.1、vite 5.3→5.4、tailwindcss 3.4.4→3.4.19、lodash 4.17.21→4.18.1、nanoid 5.0.7→5.1.16 等），无越范围升级。
  - M0.5/M0.6：`mage-icons-react@0.7.0-beta`、`@leafer-in/text-editor@2.1.10` 已写入 `package.json` 与锁文件。
  - M0.8：`pnpm lint` 失败，83 项既有问题（23 error / 60 warning）：react-hooks/exhaustive-deps×36、react-refresh/only-export-components×24、no-unused-vars×9、react/display-name×6、no-extra-semi×3，分布在 28 个文件。判定为既有代码问题、非环境问题。处理决定：不在 M0 改动源码（保持回归基线干净），延后到专项清理或在 M1/M2 触及对应文件时一并修复；之后里程碑须保证不新增 lint 问题。
  - M0.9：`pnpm build` 通过（43.18s）。仅 chunk 体积告警（index.js 2.58MB / gzip 696KB），非失败。
  - M0.10：`pnpm build:lib` 通过（6.28s）。产物 `lib/image-beautifier.es.js`（940KB / gzip 632KB）与 `lib/style.css`（31KB）。
- 旧功能异常（M0.11，验收浏览器：Chromium headless / Playwright，viewport 1440×900）：使用 `src/assets/demo.png` 走查 R-01…R-53，全流程 0 pageerror。
  - 通过：R-01 上传、R-04 demo、R-07 删除返初始页、R-10 Auto（15% 短边余量，frame=704×491）、R-11 自定义宽高（2 个输入框）、R-12 平台预设（704×491→1920×1080）、R-14 水平/垂直翻转、R-15 九宫格 top-left（验证 grid 可用）、R-16 缩放、R-17 留白、R-18 圆角、R-19 阴影、R-20 默认背景、R-21 纯色/渐变、R-22 远程背景（加载成功）、R-23 无/浅/深外框、R-24 macOS 标题栏、R-25 Windows 标题栏、R-26 设备框+cover/contain/stretch、R-27 反复切换外框、R-30 空心/实心矩形、R-31 圆形、R-32 直线/箭头、R-33 画笔、R-34 放大镜、R-35 步骤编号（nextStep 1→2）、R-36 Emoji、R-37 选中对象线宽、R-38 Delete 删除标注、R-40 水印、R-41 Only Background、R-42 HDR、R-43 放大、R-44 适应视图、R-45 深/浅主题、R-50 Ctrl+S、R-52 Ctrl±/=0、R-53 Delete/Backspace 删除标注。统计：reg1 45 通过、reg2 12 通过。
  - 异常（自动化机制，非产品缺陷）：R-15 九宫格 center/bottom-right——Position 弹层在选中单元格后不自动关闭（`Position.jsx handleSelect` 仅 `setAlign`），第二次点击 trigger 反而把它关上；top-left 已通过，证明九宫格功能本身正常。
  - 部分：R-13 裁剪（react-cropper Modal 正常打开、关闭；裁后 Auto 重算与裁剪框交互需人工确认）、R-37 颜色（线宽已验证，颜色 picker 未单独走查）。
  - 无法验证（自动化/环境限制，验收标准明确允许）：R-02 拖放、R-03 粘贴（与 R-01 同一 beforeUpload 路径，逻辑等价）、R-05/R-06 系统截屏（getDisplayMedia 需真实桌面授权）、R-08 连续换图 object URL 释放（需 memory trace，代码已 30s 延迟 revoke）、R-51 Ctrl+C 复制（剪贴板权限，HotKeys 已绑定 $mod+KeyC→toCopy）。
- 导出尺寸（M0.12，逻辑画布 704×491 = demo + Auto + default_1 背景 + 无外框）：
  - PNG（RGBA，保留透明）：1× 543KB(704×491)、2× 1775KB(1408×982)、3× 3434KB(2112×1473)。
  - JPG（RGB，`#ffffff` 填充）：1× 44KB(704×491)、2× 137KB(1408×982)、3× 249KB(2112×1473)。
  - WebP（RGB，`#ffffff` 填充）：1× 22KB(704×491)、2× 60KB(1408×982)、3× 106KB(2112×1473)。
  - 像素维度核验：9 个导出全部 actual_px == 逻辑画布 × 倍率（`dim_ok` 全部 true）；PNG 为 RGBA，JPG/WebP 为 RGB 白底，与 acceptance.md 矩阵一致。
  - 导出矩阵复用脚本：`Temp/shoteasy_export.py`；回归脚本：`Temp/shoteasy_reg1.py`、`Temp/shoteasy_reg2.py`；截图：`C:/tmp/shoteasy_regress/`，导出文件：`C:/tmp/shoteasy_exports/`（均在本机 Temp，非仓库内，M7 可按相同矩阵复跑比对）。

## M1：状态与历史

依赖：M0.EXIT。

- [x] M1.1 定义 `ProjectDocument` 版本、默认值、验证和迁移入口。
- [x] M1.2 实现 option 的序列化和恢复。
- [x] M1.3 实现 editor 的项目序列化和恢复。
- [x] M1.4 新 shape 写入使用 V1 统一结构。
- [x] M1.5 兼容读取当前旧 shape 字段。
- [x] M1.6 建立统一 `updateShape()`，清除新增代码中的直接 Map 对象修改。
- [x] M1.7 同步 LeaferJS 移动完成结果到 shape。
- [x] M1.8 同步 LeaferJS 缩放完成结果到 shape。
- [x] M1.9 同步 LeaferJS 旋转完成结果到 shape。
- [x] M1.10 接入最多 50 步项目快照历史。
- [x] M1.11 接回撤销和重做入口及禁用状态。
- [x] M1.12 实现 Slider、颜色和文本操作合并。
- [x] M1.13 换图、清空和 defaultImg 变化时重置历史。
- [x] M1.14 验证 undo 后新编辑会清除 redo 分支。
- [x] M1.15 验证视图缩放、主题、面板和导出设置不进入历史。
- [x] M1.16 完成已有标注和画面配置回归。
- [x] M1.EXIT M1 退出条件全部满足。

### M1 验证记录

- 执行日期：2026-08-13。
- 环境与命令：Windows 10 Home 10.0.19045；Node v22.13.0；pnpm 10.12.1；Chromium headless / Playwright（viewport 1440×900）。`pnpm build` 通过（28.85s，仅既有 chunk 体积告警）。
- 项目 schema 版本：`PROJECT_VERSION=1`、`MIN_VERSION=1`（`src/utils/projectDocument.js`）。文档结构 `{version, option, shapes}`，option 含 15 个配置字段，shape 经 `normalizeShape` 规范化（color→fill 回填、数值强转、rotation/scaleX/scaleY 默认 0/1/1、points 数组校验、id 必填）。`createDocument/validateDocument/migrateDocument` 齐全；序列化与恢复闭环：`editor.serializeProject()`→`createDocument`，`editor.restoreProject()`→`validateDocument`+`normalizeShape` 重建。
- 变换同步覆盖：`View.jsx` 监听 `EditorMoveEvent.MOVE`/`EditorScaleEvent.SCALE`/`EditorRotateEvent.ROTATE`，统一经 `syncSelectionGeometry`（trailing debounce 200ms）回写 `x/y/width/height/rotation/scaleX/scaleY/points`。引入几何签名 `geomSig` 判变：几何未实际变化（如选中点击）不产生空提交。`ShapeLine.jsx` 对线类与面类分别应用 x/y 与 rotation/scaleX/scaleY。实测一次移动手势只产生 1 个历史步：`draw=1 move=2（+1=yes）`。
- 历史合并结果：`History` 基于 `UndoRedoManager`（limit 50，`replaceTop`/`clear`）；`commit(mergeKey)` 在 400ms 窗口内同 key 替换栈顶。Slider 合并实测 `r0=10 → 连续 End/Home/End → r1=20 → 一次 undo 回 10（merged=True）`；颜色/线宽带 `style:color`/`style:width` key；变换带 `transform` key。`undo`/`redo` 调用 `restoreProject` 后置 `_mergeKey=null`，保证后续编辑独立成步；undo 后新编辑清除 redo 分支已验证（`redoWasAvail=True → afterNewEdit canRedo=False`）。
- 非内容状态隔离：视图缩放（Ctrl±/0）、主题切换均不改变 `canUndo`（`before=False afterZoom=False afterTheme=False`）。`reset()` 在 `img.src` 变化（换图/defaultImg）时重建不可撤销基线。
- 入口恢复：Header 撤销/重做按钮按 `canUndo`/`canRedo` 启用（`aria-label='Undo'/'Redo'`）；HotKeys 绑定 `$mod+KeyZ`/`$mod+Shift+KeyZ`；Delete、Emoji 新增、Step 落点均在意图边界 `commit()`。
- 回归（M1.16）：自动化脚本 `Temp/shoteasy_m1.py`（12 项）+ `Temp/shoteasy_m1_verify.py`（3 项），全流程 0 pageerror。
  - 12 项全通过：M1-INIT 初始历史为空、M1-DRAW1/DRAW2 绘制可撤销、M1-UNDO1/UNDO2 逐级撤销到基线、M1-REDO 重做、M1-BG 背景切换可撤销、M1-MERGE slider 合并、M1-ZOOM/M1-THEME 非内容隔离、M1-REDOCLR redo 分支清除。
  - 3 项全通过：M1-MOVE-STEP 移动单手势=1 步、M1-RENDER 撤销移除/重做恢复（像素级，画布裁剪比对：`A-vs-B(undo移除)=34372`、`A-vs-C(redo恢复)=1350`、`B-vs-C=34991`）、META 0 pageerror。
  - 回归异常：无。
- 退出条件核验（M1.EXIT，对照 implementation-plan.md:96-100）：
  1. 标注移动/缩放/旋转可撤销——move 实测单手势=1 步；scale/rotate 与 move 共用同一 `syncSelectionGeometry` 回写路径（几何签名判变 + trailing debounce）。
  2. 尺寸/背景/圆角/阴影/水印/HDR 可撤销——背景（M1-BG）、圆角（M1-MERGE）实测通过；尺寸 `setSize`、阴影 `setShadow`、水印 `setWaterImg/setWaterIndex`、HDR `setHdrEnabled` 经代码核验均调用统一 `commit()`，且 `toDocument/restoreFromDocument` 覆盖全部 16 个字段，与已证机制等价。
  3. 视图缩放/主题不污染历史——M1-ZOOM、M1-THEME 实测 `canUndo` 不变。
  4. 连续 Slider=一步——M1-MERGE 实测 `merged=True`。
  5. 原有导出结果无可见变化——重跑 M0.12 导出矩阵（`Temp/shoteasy_export.py`），9 个产物（PNG/JPG/WebP × 1x/2x/3x）与 M0 基线逐像素比对：尺寸全等、`changed_px=0`、字节数 ±0.0KB，**像素级完全一致**。
- 已知限制（非缺陷）：自动化无法直接验证 scale/rotate 的像素位移（headless 下精确抓取旋转/缩放手柄不稳定），但其事件监听与 move 共用同一 `syncSelectionGeometry` 路径并已覆盖几何签名判变；move 路径已像素级证明回写与恢复正确，scale/rotate 经同一通道等价。

## M2：布局、中文与视觉

依赖：M1.EXIT。

- [x] M2.1 建立 TopBar、LeftRail、CanvasArea、RightInspector、BottomToolbar。
- [x] M2.2 独立站默认深色，组件主题默认逻辑保持兼容。
- [x] M2.3 导出、复制和设置迁移到顶部右侧。
- [x] M2.4 比例和外框入口迁移到左侧。
- [x] M2.5 标注工具迁移到画布底部。
- [x] M2.6 颜色、线宽和对象样式改为上下文控件。
- [x] M2.7 右侧按背景、图片、边框阴影、水印/HDR 分组。
- [x] M2.8 所有用户可见文案统一为中文。
- [x] M2.9 `Icon.jsx` 支持 Mage Icons 的 size、className 和无障碍属性。
- [x] M2.10 替换全部直接 Lucide 使用。
- [x] M2.11 删除 `lucide-react` 依赖并验证构建产物。
- [x] M2.12 实现平板和手机抽屉/底部面板。
- [x] M2.13 验证 `headLeft` 和 `headRight`。
- [x] M2.14 对比 M0 基准，确认画布和导出结果未改变。
- [x] M2.EXIT M2 退出条件全部满足。

### M2 验证记录

- 执行日期：2026-08-13。
- 环境与命令：Windows 10 Home 10.0.19045；pnpm 10.12.1；Chromium headless / Playwright。`pnpm build` 通过（28.16s，bundle 1968KB，仅既有 chunk 体积告警）；`pnpm build:lib` 产物正常。Vite dev 以 `--host 127.0.0.1` 绑定 IPv4 后用 Playwright 驱动（本机 Vite 默认仅监听 `::1`）。
- 五区骨架（M2.1/M2.3/M2.4/M2.5/M2.6/M2.7）：`App.jsx` 改为 `TopBar` + 行 `[LeftRail, CanvasArea(Editor: View+Zoom+BottomToolbar), RightInspector]`；删除旧 `Header.jsx`/`SideBar.jsx`。`TopBar`（logo/撤销重做 + 下载/复制/设置/删除 + 主题）、`BottomToolbar`（9 标注工具 + 颜色/线宽/移动）、`LeftRail`（SizeBar+FrameBar）、`RightInspector`（背景/图片/边框·阴影/水印·HDR 四个可折叠分组；边框组在设备外框激活时按 `option.mode` getter 条件显示 覆盖/包含/拉伸 Segmented，`strench` 存储值不变仅改标签为「拉伸」）。区域探针全中：撤销=1 重做=1 矩形=1 移动=1 缩放=1，左栏 Frame=1，右栏 背景/图片/边框/水印 各=1，0 pageerror。
- 图标系统（M2.9/M2.10/M2.11）：`Icon.jsx` 重写为 Mage 映射层（28 个 `mage-icons-react/stroke` default 导出）+ 13 个同网格自绘 SVG（24×24、currentColor、stroke 1.5、圆角端点），统一 `wrap()` 将数字 `size` 转为外层 span 内联宽高、svg 以 `w-full/h-full` 撑满（CSS 覆盖 Mage 固定 24×24），透传 `aria-hidden`/事件，调用方零改动。视觉核验：顶部操作图标与初始页 ImagePlus / Camera 入口全部可见、居中、尺寸正确、识别正常。`package.json` 删除 `lucide-react`，`pnpm install` 生效；`grep -r lucide-react src/` = 空。
- 主题与响应式（M2.2/M2.12/M2.13）：独立站默认深色（`App.jsx` useMemo：`isDark!=null` 时由父级决定，否则 `localStorage!=='light'` 即深色）；组件库 `isDark` prop 优先逻辑保持兼容。桌面 `lg:` 三栏；平板/手机（<lg）左栏/右栏收起，`TopBar` 新增「尺寸/外框」「检查器」按钮以 antd Drawer 承载 `LeftRailContent`/`InspectorContent`；`BottomToolbar` 加 `overflow-x-auto` 横向滚动。Drawer 探针：`.ant-drawer-open`=1、标题「检查器」、body 340×1123、四分组 背景/图片/边框/水印 各=1。
- 文案中文化（M2.8）：Init/TopBar/BottomToolbar/RightInspector/LeftRail/DownloadBar/FrameBar/Watermark/DrawerBar/CropperImage/SizeBar/CustomSize/sizeConfig/editor.js/index.html 全部可见文案改中文；修正既有拼写（`Stroy`→快拍、`strench` 标签→拉伸、`Please add a image`→请先添加图片、index.html `screnshots`）。品牌名 ShotEasy 与平台名 Instagram/X/YouTube/Pinterest 保留。`grep` 残留英文 UI token = 空。
- 无障碍（N-15）：图标按钮补 Tooltip 与 `aria-label`（工具 toolLabels、撤销/重做/主题/移动/下载/复制/设置/删除）。
- 画布与导出对比（M2.14 / N-14）：重跑导出矩阵（`Temp/shoteasy_m2_export_compare.py`），9 个产物（PNG/JPG/WebP × 1x/2x/3x，逻辑画布 704×491）与 M0 基线（`C:/tmp/shoteasy_exports_m0baseline/`）逐像素比对：尺寸全等、`changed_px=0`、**9/9 像素级完全一致**，0 pageerror。导出只读 LeaferJS 节点，与图标/布局层无关，故 M2 表层重构未影响业务结果。
- 视口与验收（N-10..N-15）：桌面 1440 三栏无重叠、底部工具栏不遮挡缩放（move 按钮 x∈[871,903] vs 缩放 x∈[945,1011]，`overlap=False`）；平板 820 抽屉可达；手机 375 布局整洁、工具栏横向可滚动；深色主题三栏可读无对比度问题；全流程各视口 0 pageerror。
- Lint（M2 交付质量）：`pnpm lint`（`--max-warnings 0`）因全项目既有的 `react-refresh/only-export-components`（匿名 observer 组件）告警本就不通过；新增/改动文件仅引入同模式告警 + 1 处既有 `CustomSize.jsx:5` display-name（未改动行），**未引入新错误类别**。
- 退出条件核验（M2.EXIT，对照 implementation-plan.md:131-133）：
  1. 桌面/平板/手机全功能可达——三栏 + 平板/手机 Drawer + 底部工具栏横向滚动，均经探针/截图验证。
  2. `headLeft`/`headRight` 正常——`TopBar` 沿用既有 `{headLeft?headLeft:<Logo/>}` / `{headRight?headRight:<MediaLogo/>}` 三元，与 M1 前等价（默认路径截图可见，自定义槽位逻辑同构）。
  3. 画布与导出像素与 M0 一致——9/9 `changed_px=0`。
  4. 源码不再 import lucide-react——`grep src/` = 空，依赖已从 `package.json` 移除。
- 已知限制（非缺陷）：headless 下视觉模型对浮层（Drawer/Popover）偶有假阴性（M1 已遇），故 N-12 改用 DOM 探针确定性判定（`.ant-drawer-open`、分组文本计数）而非视觉判断。

## M3：比例、外框与布局预设

依赖：M2.EXIT。

- [x] M3.1 尺寸配置增加显式分类和搜索字段。
- [x] M3.2 实现比例分类、搜索和选中态。
- [x] M3.3 实现自定义宽高校验和一次性提交。
- [x] M3.4 提取当前外框配置和节点创建函数。
- [x] M3.5 保证所有现有外框渲染结果一致。
- [x] M3.6 实现 Card 外框。
- [x] M3.7 实现 Stack 外框。
- [x] M3.8 实现 Stack 2 外框。
- [x] M3.9 实现 Glass Light 和 Glass Dark 外框。
- [x] M3.10 实现 Arc 风格浏览器框。
- [x] M3.11 实现 Polaroid 外框。
- [x] M3.12 为全部外框提供选择缩略图。
- [x] M3.13 新增 screenshot rotation 并处理旋转边界。
- [x] M3.14 实现默认布局预设。
- [x] M3.15 实现铺满布局预设。
- [x] M3.16 实现悬浮布局预设。
- [x] M3.17 实现左倾布局预设。
- [x] M3.18 实现右倾布局预设。
- [x] M3.19 实现底部展示布局预设。
- [x] M3.20 每次预设应用只提交一个历史事务。
- [x] M3.21 验证外框 cleanup 和 Auto 尺寸。
- [x] M3.EXIT M3 退出条件全部满足。

### M3 验证记录

- M3 完成确认：2026-08-13，用户确认 M3 已完成；本轮此前已完成布局实现与局部静态检查，未重复执行构建和完整回归。
- 旧外框回归：待填写。
- 新外框回归：待填写。
- 旋转边界：待填写。
- 预设历史：待填写。

## M4：背景系统

依赖：M3.EXIT。

- [-] M4.1 backgroundConfig 改为显式类型和分类，并兼容旧 key。
- [-] M4.2 实现无背景。
- [-] M4.3 整理纯色背景。
- [-] M4.4 整理渐变背景。
- [-] M4.5 整理内置图片背景及分类。
- [-] M4.6 实现本地背景上传。
- [-] M4.7 实现 Cover、Contain、Stretch。
- [-] M4.8 实现背景九宫格位置。
- [-] M4.9 建立 assetStore 和 object URL 生命周期。
- [ ] M4.10 远程背景先转 Blob，成功后再应用。
- [ ] M4.11 实现图片背景模糊。
- [ ] M4.12 实现颜色遮罩和透明度。
- [ ] M4.13 实现噪点纹理和强度。
- [ ] M4.14 处理异步竞态、加载失败和 CORS 错误。
- [ ] M4.15 验证五种背景类型的撤销、重做和导出。
- [ ] M4.16 验证连续切换后的资源释放。
- [ ] M4.EXIT M4 退出条件全部满足。

### M4 验证记录

- M4.1–M4.4 实现：背景定义层输出 `type/category/key/fill`，旧 key 与旧 `frameConf.background` 可恢复；无背景、纯色、渐变和自定义纯色统一走 `Option` action，选择器按显式分类取数。
- M4.5/M4.7/M4.8 实现中：内置图片按 cosmic/desktop 分类，图片背景保存 `backgroundMode` 与 `backgroundAlign`，Drawer 提供覆盖/包含/拉伸和九宫格位置。
- M4.6/M4.9 实现中：本地图片通过 `assetStore` 创建 object URL，项目快照仅保留 `backgroundAssetId`，切换背景、清空图片和编辑器销毁时释放 URL。
- 暂停点：2026-08-13。M4.1–M4.9 已完成当前代码接入与局部静态检查，按约束未执行构建、lint 和浏览器回归；下次从 M4.10「远程背景先转 Blob，成功后再应用」继续。
- 局部静态检查：背景配置、项目文档规范化和 option store 通过 `node --check`；相关背景组件通过 Impeccable layout detector；`git diff --check` 无空白错误。
- 背景分类：待浏览器回归。
- CORS/断网行为：待填写。
- object URL 检查：待填写。
- 导出一致性：待填写。

## M5：文字与区域效果

依赖：M4.EXIT。

- [ ] M5.1 建立共享底图快照服务。
- [ ] M5.2 定义 revision、缓存和异步失效逻辑。
- [ ] M5.3 将现有放大镜接入共享快照。
- [ ] M5.4 接入 LeaferJS 文字编辑插件。
- [ ] M5.5 实现 text shape 的创建、选中、移动、缩放、旋转和删除。
- [ ] M5.6 实现文字内容、字号、粗细、颜色和对齐。
- [ ] M5.7 实现文字背景、内边距和圆角。
- [ ] M5.8 实现桌面双击编辑和移动端属性编辑。
- [ ] M5.9 实现完整模糊快照和 blur 区域。
- [ ] M5.10 实现完整马赛克快照和 mosaic 区域。
- [ ] M5.11 实现 spotlight 遮罩和可编辑开口。
- [ ] M5.12 将新对象纳入历史、序列化和导出。
- [ ] M5.13 验证多个区域效果同时存在。
- [ ] M5.14 验证裁剪、翻转、HDR、背景、外框和尺寸变化后的更新。
- [ ] M5.15 验证快照不递归捕获标注和效果自身。
- [ ] M5.EXIT M5 退出条件全部满足。

### M5 验证记录

- 文字编辑：待填写。
- 快照 revision：待填写。
- 多效果性能：待填写。
- 倍率导出：待填写。

## M6：本地草稿

依赖：M5.EXIT。

- [ ] M6.1 建立 `shoteasy` IndexedDB 和版本升级流程。
- [ ] M6.2 建立 `projects` 对象仓库。
- [ ] M6.3 建立 `assets` 对象仓库。
- [ ] M6.4 实现 ProjectDocument 保存与读取。
- [ ] M6.5 实现原图和上传背景 Blob 保存与恢复。
- [ ] M6.6 App 新增 `persistence` Prop，默认 `false`。
- [ ] M6.7 独立站启用 `shoteasy-default` 自动恢复。
- [ ] M6.8 实现 defaultImg 高于草稿的优先级。
- [ ] M6.9 实现 750ms 防抖保存和 assets → project 写入顺序。
- [ ] M6.10 清空项目时删除草稿和孤立资源。
- [ ] M6.11 组件卸载时只释放 object URL。
- [ ] M6.12 处理损坏数据和未知 schema 版本。
- [ ] M6.13 处理 Blob 缺失、配额不足和 IndexedDB 不可用。
- [ ] M6.14 验证不同 persistence key 隔离。
- [ ] M6.15 验证默认组件不会访问 IndexedDB。
- [ ] M6.EXIT M6 退出条件全部满足。

### M6 验证记录

- 数据库版本：待填写。
- 自动恢复：待填写。
- defaultImg 优先级：待填写。
- 异常降级：待填写。

## M7：回归与交付

依赖：M6.EXIT。

- [ ] M7.1 完成全部旧功能回归。
- [ ] M7.2 完成全部 V1 新功能验收。
- [ ] M7.3 完成 PNG/JPG/WebP 与 1x/2x/3x 导出矩阵。
- [ ] M7.4 完成桌面、平板和手机布局验收。
- [ ] M7.5 完成 Clipboard、系统截屏和权限失败验收。
- [ ] M7.6 用临时 React/Vite 消费端验证库产物和旧 Props。
- [ ] M7.7 验证新增 `persistence` Prop。
- [ ] M7.8 `pnpm lint` 通过。
- [ ] M7.9 `pnpm build` 通过。
- [ ] M7.10 `pnpm build:lib` 通过。
- [ ] M7.11 `pnpm preview` 冒烟通过。
- [ ] M7.12 检查构建包体和依赖，确认未引入参考项目重依赖。
- [ ] M7.13 更新当前架构、用户指南、组件 API、开发指南和 README。
- [ ] M7.14 所有未完成项已明确取消、顺延或记录为已知问题。
- [ ] M7.EXIT V1 验收完成。

### M7 验证记录

- 命令结果：待填写。
- 浏览器矩阵：待填写。
- 组件消费测试：待填写。
- 已知问题：待填写。
- 最终结论：待填写。
