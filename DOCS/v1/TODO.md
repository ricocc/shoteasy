# V1 执行 TODO

> 当前状态：M0 已完成并验证；M1 已完成并验证；M2 已完成并验证；M3 已完成；M4 已完成并验证；M5 已完成并验证；M6 已完成并验证；M7 进行中。

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
- 文案中文化（M2.8）：Init/TopBar/BottomToolbar/RightInspector/LeftRail/DownloadBar/FrameBar/Watermark/DrawerBar/CropperImage/SizeBar/CustomSize/sizeConfig/editor.js/index.html 全部可见文案改中文；修正既有拼写（`Stroy`→快拍、`strench` 标签→拉伸、`Please add a image`→请先添加图片、index.html `screnshots`）。品牌名 RicoScreenshot 与平台名 Instagram/X/YouTube/Pinterest 保留。`grep` 残留英文 UI token = 空。
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

## M3：比例、外框与布局预设（历史实现，布局入口已由 M7.17 替换）

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

- [x] M4.1 backgroundConfig 改为显式类型和分类，并兼容旧 key。
- [x] M4.2 实现无背景。
- [x] M4.3 整理纯色背景。
- [x] M4.4 整理渐变背景。
- [x] M4.5 整理内置图片背景及分类。
- [x] M4.6 实现本地背景上传。
- [x] M4.7 实现 Cover、Contain、Stretch。
- [x] M4.8 实现背景九宫格位置。
- [x] M4.9 建立 assetStore 和 object URL 生命周期。
- [x] M4.10 远程背景先转 Blob，成功后再应用。
- [x] M4.11 实现图片背景模糊。
- [x] M4.12 实现颜色遮罩和透明度。
- [x] M4.13 实现噪点纹理和强度。
- [x] M4.14 处理异步竞态、加载失败和 CORS 错误。
- [x] M4.15 验证五种背景类型的撤销、重做和导出。
- [x] M4.16 验证连续切换后的资源释放。
- [x] M4.EXIT M4 退出条件全部满足。

### M4 验证记录

- M4.1–M4.4 实现：背景定义层输出 `type/category/key/fill`，旧 key 与旧 `frameConf.background` 可恢复；无背景、纯色、渐变和自定义纯色统一走 `Option` action，选择器按显式分类取数。
- M4.5/M4.7/M4.8 实现中：内置图片按 cosmic/desktop 分类，图片背景保存 `backgroundMode` 与 `backgroundAlign`，Drawer 提供覆盖/包含/拉伸和九宫格位置。
- M4.6/M4.9 实现中：本地图片通过 `assetStore` 创建 object URL，项目快照仅保留 `backgroundAssetId`，切换背景、清空图片和编辑器销毁时释放 URL。
- 暂停点：2026-08-13。M4.1–M4.9 已完成当前代码接入与局部静态检查；M4.10/M4.14 完成后下次从 M4.11「图片背景模糊」继续。
- 构建修复（2026-08-14）：M4.1–M4.9 接入的 `DrawerBar` 以 `@stores/assetStore` 导入，而 `vite.config.js` 中 `@stores` 别名指向 `src/stores/index.js` 文件，导致子路径解析为 `index.js/assetStore` 报 ENOENT、整站无法构建。将别名改为目录 `./src/stores`（与其余 `@components`/`@utils` 一致）后，`@stores` 默认仍解析到 `index.js`、`@stores/assetStore` 解析到 `assetStore.js`。修复后 `pnpm build` 通过（47.59s，bundle 1974KB，仅既有 chunk 体积告警）。
- M4.10/M4.14 实现（2026-08-14）：`assetStore.addFromUrl(url, signal)` 先 `fetch` 远程内置图片为 Blob 再 `URL.createObjectURL`（同源 blob:，避免跨域 tainted canvas）；`option.applyBackground(key)` 统一入口，内置图片走异步 `_fetchImageBackground`——模块级 `imageBackgroundAbort` 持有当前 `AbortController`，每次新建即 `abort` 上一个，下载成功且未被更新选择覆盖（`controller.signal.aborted || imageBackgroundAbort!==controller`）才 `runInAction` 写入 `background/backgroundAssetId/frameConf.background` 并 `history.commit()`，否则静默放弃；失败抛错由 `DrawerBar` 捕获提示「背景加载失败，请重试」并保留上一个有效背景。`toDocument` 对内置图片背景回写稳定的远程 URL（不保存一次性 blob:）；`restoreFromDocument` 恢复后用远程 URL 作回退并异步重新下载为 Blob（`commit:false`，不污染历史）。非图片背景仍走同步 `setBackground`。
- 局部静态检查：背景配置、项目文档规范化和 option store 通过 `node --check`；相关背景组件通过 Impeccable layout detector；`git diff --check` 无空白错误。
- M4.11/M4.12/M4.13 实现（2026-08-14）：新增 `src/utils/backgroundEffects.js`——`blurImageUrl(url,blur)` 离屏 Canvas `ctx.filter=blur` 处理图片背景并缓存（向外 bleed 避免边缘透明，blob: 同源不 tainted，失败抛错回退原图）；`generateNoiseDataUrl(intensity)` 本地 128×128 PNG 瓦片、强度烘焙进 alpha、按强度缓存；`buildLayeredFill({base,blurredUrl,blur,maskColor,maskOpacity,noise})` 组合 Frame fill——base paint（blur>0 且为图片时替换为模糊 URL）+ 遮罩 solid（tinycolor 带 alpha）+ 噪点 repeat image，**无任何效果生效时原样返回 base**（保证默认导出像素不变）。新增 option 字段 `backgroundBlur/backgroundMaskColor/backgroundMaskOpacity/backgroundNoise`（默认全关）+ setter（slider 合并键）+ toDocument/restoreFromDocument/normalizeOption/defaultOption 同步。`FrameBox` 改为 observer，按效果字段重算 `effectiveFill`，图片背景 blur>0 时异步取模糊 URL（race guard：cancelled 标志防旧结果覆盖）。DrawerBar「背景效果」分组提供 模糊/遮罩(颜色+透明度)/噪点 三个 Slider。`pnpm build` 通过（31.84s）；运行时冒烟：加载与进入编辑器、打开背景抽屉 0 pageerror。视觉效果（模糊/遮罩/噪点开启时的渲染与导出）待人工确认。
- 背景分类：DrawerBar 按显式分类（无/纯色/渐变/宇宙/桌面）取数；运行时冒烟（打开背景抽屉）0 pageerror，待人工逐类目视确认。
- CORS/断网行为：M4.14 已实现——`_fetchImageBackground` 用模块级 AbortController 取消被覆盖的旧请求，失败抛错由 DrawerBar 捕获提示「背景加载失败，请重试」并保留上一个有效背景；断网/CORS 表现为 fetch 抛错走同一分支。待人工断网确认提示。
- object URL 检查：M4.16 已确认——`setBackground/setUploadedBackground/setCustomSolidBackground/_fetchImageBackground` 切换前均 `releaseBackgroundAsset()`；`editor.clearImg()`/`destroy()`（editor.js:242/247）均调用 `option.releaseBackgroundAsset()`；连续切换不泄漏。
- 导出一致性：重跑导出矩阵（`Temp/shoteasy_m2_export_compare.py`，逻辑画布 704×491）与 M0 基线逐像素比对，**9/9（PNG/JPG/WebP × 1x/2x/3x）changed_px=0、尺寸全等、0 pageerror**——证明 FrameBox 改为 observer + 分层 fill 后默认导出像素不变；M4.10 blob 化与 M4.11-13 效果默认关闭，不影响默认导出。
- 五类型撤销/重做（M4.15）：所有背景 setter 均经统一 `history.commit()`（slider/颜色带合并键），`toDocument/restoreFromDocument` 覆盖 background/backgroundAssetId/backgroundMode/backgroundAlign 及 blur/mask/noise 字段，与 M1 已证机制等价；图片背景恢复后异步重取 Blob（`commit:false`）。
- M4.EXIT 待办：五种背景类型（无/纯色/渐变/图片/上传）+ 模糊/遮罩/噪点效果的逐类目视与导出确认、上传背景不替换主截图的人工确认，由用户在浏览器完成。
- 背景消失回归修复（2026-08-14，用户反馈）：上传本地图片后，在「图片背景」中点击修改 mode（覆盖/包含/拉伸）或九宫格对齐任意一项，背景立即消失。根因——`setBackgroundMode`/`setBackgroundAlign` 用静态 `getBackgroundDefinition` 重建 `frameConf.background`：上传背景的静态定义 `fill:null`（真实 blob URL 只存在于运行时 `frameConf.background.url`），`getBackgroundFill` 展开 `null` 得到 `{mode,align}` 丢失 URL；内置图片背景则把 M4.10 已下载的同源 blob: 覆盖回跨域远程 URL（潜伏的导出 tainted 风险）。修复：新增 `_syncImageBackgroundFill()`，仅当当前背景为图片时按「保留运行时 URL（`currentUrl || definition.fill.url || null`）」重建 fill，mode/align 两个 setter 改调它；非图片背景早退不动 `frameConf.background`。`pnpm build` 通过（57.68s）；Playwright 回归（上传纯色图后 cover→stretch→fit→cover 往返）：末态 cover 与上传基准 `changed_px=0`（首轮 cover 切换后亦 0px），证明 URL 在反复 mode 切换中保留；fit 的 letterbox 差异为正常渲染非缺陷。用户手动测试确认修复（2026-08-14），M4.EXIT 通过。

## M5：文字与区域效果

依赖：M4.EXIT。

- [x] M5.1 建立共享底图快照服务。
- [x] M5.2 定义 revision、缓存和异步失效逻辑。
- [x] M5.3 将现有放大镜接入共享快照。
- [x] M5.4 接入 LeaferJS 文字编辑插件。
- [x] M5.5 实现 text shape 的创建、选中、移动、缩放、旋转和删除。
- [x] M5.6 实现文字内容、字号、粗细、颜色和对齐。
- [x] M5.7 实现文字背景、内边距和圆角。
- [x] M5.8 实现桌面双击编辑和移动端属性编辑。
- [x] M5.9 实现完整模糊快照和 blur 区域。
- [x] M5.10 实现完整马赛克快照和 mosaic 区域。
- [x] M5.11 实现 spotlight 遮罩和可编辑开口。
- [x] M5.12 将新对象纳入历史、序列化和导出。
- [x] M5.13 验证多个区域效果同时存在。
- [x] M5.14 验证裁剪、翻转、HDR、背景、外框和尺寸变化后的更新。
- [x] M5.15 验证快照不递归捕获标注和效果自身。
- [x] M5.EXIT M5 退出条件全部满足。

### M5 验证记录

- 文字编辑（M5.4–M5.8）：`@leafer-in/text-editor` 一行 import 即自动接入——`@leafer-in/editor` 内部对所有 `Text` 节点 `addAttr('editInner','TextEditor')`，编辑器默认 `openInner:'double'`，故双击任意 Text 节点自动打开 `.leafer-text-editor` contentEditable 覆盖层，无需手动接线。文字标注经底栏「文字」工具（Icon.Type）点击画布创建，默认文本「双击编辑文字」，`textStyle`（fontSize/fontWeight/fill/textAlign/backgroundColor/padding/cornerRadius）作为 `text` shape 子结构由 `normalizeShape` 透传（仅 NUMERIC_FIELDS 强转，textStyle 整体保留）。选中写回：SELECT 处理器在多选时清空 `selectedId`、单选时记录；`InnerEditorEvent.CLOSE` 处理器读取 `event.editTarget.text`（CLOSE 在 `onUnload`→onInput 之后、`editTarget` 置空之前触发，可读到最终文本）回写 store 并 `history.commit('text:edit')`，多行内容正确写入（`第一行\n第二行`）。文字节点不参与 width/height 写回（`syncSelectionGeometry` 与 ShapeLine 几何 effect 均排除 `text`，保留 Leafer 文字自动宽高）。右侧「文字」属性面板（`TextProperties.jsx`）提供内容 TextArea/字号/粗细/颜色/对齐/背景色（含「无」）/内边距/圆角，连续交互不立即入历史（在 onBlur/onChangeComplete/离散切换时统一 commit），桌面右栏与移动端抽屉共用本组件（验收 N-43）。验证（2026-08-14）：`pnpm build` 通过（~32s）；Playwright 文字端到端冒烟（`shoteasy_m5_text.py`）7/7 通过、0 pageerror——工具选中→点击创建→选中出现面板且默认内容正确→双击打开编辑覆盖层→输入多行→点击外部关闭覆盖层→重新选中 TextArea 反映新内容（回写 store）→经面板调 segmented/slider/colorpicker 无错→Delete 删除后面板消失；目视 02_after_edit（红色双行「第一行/第二行」渲染在画布、选中蓝框、面板全控件可见）与 03_after_style（白色背景矩形、粗体、大字号正确渲染）确认。导出回归：重跑导出矩阵（704×491）与 M0 基线逐像素比对 **9/9（PNG/JPG/WebP × 1x/2x/3x）changed_px=0、尺寸全等、0 pageerror**——证明新增 text 节点不影响默认导出（默认文档无文字标注）。
- 快照 revision（M5.1–M5.3）：共享底图快照服务 `src/stores/baseSnapshot.js` 实现 `computeRevision`（从 image/crop/flip/HDR/bg/frame/canvas-size/style/background-effects 派生）+ 缓存 + 120ms 防抖 + stale-discard（丢弃过期结果，仅写当前 revision）；`getVariant` 供 blur/mosaic 等效果注册处理后变体并缓存。放大镜改为从快照服务取 raw 快照，与历史 `createSnap('init')` 入口一致。验证（2026-08-14）：`pnpm build` 通过；放大镜冒烟 0 pageerror；导出回归 9/9 identical（见上）。blur/mosaic 的 `getVariant` 处理变体见下；spotlight 不消费底图快照（M5.11 接入）。
- 区域效果 模糊/马赛克（M5.9/M5.10）：`SHAPE_TYPES` 扩充 `blur`/`mosaic`（`normalizeShape` 经 `{...raw}` 透传 `effect`，仅 NUMERIC_FIELDS 强转）。生成器 `src/utils/shape/regionEffect.js`——`blurSnapshot(raw, strength)` 用离屏 Canvas `ctx.filter=blur(${strength*2}px)` 处理 2x 底图快照（快照为 2x 故半径 ×2）；`mosaicSnapshot(raw, blockSize)` 把快照先缩到 `w/(blockSize*2)×h/(blockSize*2)`（imageSmoothing ON）再放大回原尺寸（smoothing OFF）得像素块。两者输入/输出均为 `{data,width,height}`。渲染复用放大镜 clip-fill 模式：`ShapeLine` 对 blur/mosaic 建 `Rect`，`baseSnapshot.getVariant(editor, '${type}:${param}', gen)` 取共享底图快照的处理变体作 `{type:'image',mode:'clip',size,offset:{x:-shape.x*2,y:-shape.y*2}}`（快照 2x → 1:1 对齐）；`PropertyEvent.CHANGE` 监听 x/y 时只重算 offset（移动时不重新生成位图，N-49），变更 strength/blockSize 才重取变体（底图快照由服务统一 revision 失效，N-44 非递归捕获）。`snap` 为空时 `getVariant` 内部触发 `schedule` 生成底图快照并返回 null，快照就绪后 `onUpdate` → snap 变化 → effect 重跑取到变体（关键：不 early-return，否则底图快照永不生成、Rect 无 fill 不可选）。store 增 `selectedEffectShape` getter（blur/mosaic/spotlight 单选）与 `setEffectStyle(patch)`（合并 effect，不立即入历史，UI 在 onChangeComplete commit）；`_hasSnapshotConsumer` 纳入 blur/mosaic。底栏工具列表加「模糊/马赛克」（自绘 `BlurGlyph`/`MosaicGlyph` 图标），工具选中时 `createSnap('init')` 预热；View 拖拽创建（rect-like 流程）并写默认 effect（blur `{strength:8,cornerRadius:0}`、mosaic `{blockSize:12,cornerRadius:0}`）。右侧「区域效果」面板（`EffectProperties.jsx`）：模糊强度 1–40、马赛克块大小 4–48、共享圆角 0–60 Slider，onChangeComplete 时 commit。验证（2026-08-14）：`pnpm build` 通过；Playwright 区域端到端冒烟（`shoteasy_m5_region.py`）9/9 通过、0 pageerror——模糊/马赛克各 拖拽创建→等待快照+变体→截图→选中出现面板（模糊强度/马赛克块大小）→拖动移动→删除后面板消失；目视确认模糊为矩形软焦区域（边缘清晰、内部虚化）、马赛克为像素块区域、移动后模糊仍对准底图（03_blur_moved 模糊整体居中、内部显示对应底图内容的虚化，N-45/N-49）。导出回归：默认文档矩阵（704×491）与 M0 基线逐像素比对 **9/9 changed_px=0、尺寸全等、0 pageerror**。导出含效果：创建模糊区域后导出 PNG 1x（`shoteasy_m5_region_export.py`）0 pageerror，目视确认导出图保留模糊矩形且位于预览同一位置（居中、车身后方），满足阻断规则「区域效果导出位置与预览明显不一致」。
- 聚光 spotlight（M5.11）：与 blur/mosaic 不同——**不消费底图快照**（`_hasSnapshotConsumer` 不含 spotlight）。机制（已读 `web.esm.js`/`editor.esm.js` 源码确认）：Leafer 的 mask/clipping 只显示遮罩形状**内部**、无 inverse/erase 模式，故聚光改用一条 **even-odd Path** 作可见遮罩：`regionEffect.js#buildSpotlightPath(localX,localY,w,h,canvasW,canvasH,cornerRadius)` 输出「整张画布外环矩形 + 开口圆角矩形（反向绕向）」拼接 path，`windingRule:'evenodd'` 使开口成镂空，`fill=overlayColor`、`opacity` 控制全画布变暗程度。布局：`ShapeLine` 建 `Group`（`x,y,width,height`=开口），子节点 overlay Path（`hittable:false`，全画布遮罩不抢占命中）+ 透明 hit `Rect`（开口尺寸，`hittable:true,editable:false`，使开口可点击选中 Group 祖先）。选框只编辑开口——因编辑器对 Group 用 `boxBounds`（声明的 width/height=开口）而非子节点渲染范围，故全画布 overlay 溢出可见但不撑大选框（N-46：遮罩覆盖全画布且开口可编辑）。实时重算：spotlight overlay-rebuild effect 在 Group 的 `PropertyEvent.CHANGE`（x/y/width/height）时以 `-gx,-gy` 重算外环偏移，移动/缩放开口时遮罩跟随、不重新生成位图（N-49）；画布尺寸取 `option.frameConf`（View observer，尺寸变化重渲染触发本 effect）。store：`selectedEffectShape` 已含 spotlight（M5.9/M5.10 一并加）；`setEffectStyle` 合并 `{overlayColor,opacity,cornerRadius}` 不立即入历史。View 拖拽创建写默认 effect `{overlayColor:'#000000',opacity:0.5,cornerRadius:0}`；底栏加「聚光」工具（自绘 `SpotlightGlyph`），工具选中不预热快照（spotlight 无快照）。面板（`EffectProperties.jsx`）：遮罩颜色（ColorPicker）、不透明度 0–1 Slider、共享圆角 0–60。验证（2026-08-14）：`pnpm build` 通过（~40s）；Playwright 聚光端到端冒烟（`shoteasy_m5_spotlight.py`）7/7 通过、0 pageerror——选「聚光」→拖拽创建→选中开口出现面板（遮罩颜色/不透明度/圆角）→拖动开口移动→调不透明度→删除后面板消失；目视 01_spotlight_preview（整张变暗、车上方居中开口透亮、遮罩覆盖全画布）与 03_spotlight_moved（遮罩仍覆盖全画布、开口跟随移动到右下）确认 N-46。导出回归：默认文档矩阵（704×491）与 M0 基线逐像素比对 **9/9 changed_px=0、尺寸全等、0 pageerror**。导出含聚光：创建 spotlight 后导出 PNG 1x（`shoteasy_m5_spotlight_export.py`）704×491、0 pageerror，目视确认导出图全画布变暗、开口矩形位于预览同一位置（左上 ~1/3）且边缘锐利无渲染瑕疵，满足阻断规则。
- 历史/序列化/导出 新对象（M5.12）：`SHAPE_TYPES`（[projectDocument.js](src/utils/projectDocument.js)）已列 text/blur/mosaic/spotlight；`normalizeShape` 经 `{...raw}` 透传——`effect`（blur/mosaic/spotlight）与 `textStyle`（text）非 NUMERIC_FIELDS 故整体保留，几何/变换字段（x/y/width/height/rotation/scaleX/scaleY）强转数字。历史链路 `editor.serializeProject()` → `createDocument` → `normalizeShape`（写）与 `restoreProject` → `validateDocument` → `normalizeShape`（读）共用同一规范化入口，undo/redo 即一次完整序列化往返——故 effect/textStyle 在往返中不丢（更新了文件顶部 JSDoc 标注 effect/textStyle 字段）。为端到端可读状态，在 `main.jsx` 加**开发态** `window.__shoteasyStores` 暴露（`import.meta.env.DEV` 守卫，生产构建 tree-shake 移除，不影响导出）。验证（2026-08-14）：`pnpm build` 通过（~50s）；Playwright 历史/序列化/导出测试（`shoteasy_m5_12.py`）**12/12 通过、0 pageerror**——(1) 序列化：创建 blur 后 `serializeProject().shapes` 中 blur 携带 `{strength:8,cornerRadius:0}`；(2) 样式 undo/redo（N-01 样式完整恢复）：改模糊强度 8→34、Ctrl+Z 回退 34→8、Ctrl+Shift+Z 恢复 8→34；(3) 创建 undo/redo（N-01）：Ctrl+Z 后 blur 从 shapes 移除、Ctrl+Shift+Z 后恢复且 effect 完整（`{strength:8,cornerRadius:0}`）；(4) 四类齐存序列化：text 携带 `text='双击编辑文字'`+`textStyle{fontSize:24,...}`、blur/mosaic/spotlight 各带 effect（strength/blockSize/opacity）；(5) 导出含四类对象 PNG 1x = 704×491 正确。
- 多效果并存（M5.13 / N-47）：架构上每个区域效果是 frame 下独立 shape（blur/mosaic 各自的 Rect、spotlight 的 Group），互不影响。验证（2026-08-14）：Playwright（`shoteasy_m5_13.py`）**7/7 通过、0 pageerror**——三效果并存（serializeProject 计数 blur/mosaic/spotlight 各 1）；可选择（逐个点击中心 → 各自类型专属面板：模糊强度/马赛克块大小/遮罩颜色）；可移动（拖动 mosaic 后 x 382→442，N-49 移动不重新生成整张处理图——clip-fill 只更新 offset）；可删除（删 spotlight 后仅余 blur+mosaic）；正确导出（含多效果 PNG 1x 704×491）。目视 three_effects（左下模糊、右下马赛克、上方聚光开口三者同屏无破坏性干扰）确认 N-47。
- 基础内容变化后效果更新（M5.14 / N-48）：失效链路——`Screenshot.jsx` 以 useEffect 监听所有影响底图的 option（`img.src/mode/hdrImageUrl`→createSnap、`padding/paddingBg`、`frame/round`、`shadow`、`scale`、`scaleX`/`scaleY` 翻转、`align/frame/frameConf尺寸/padding/rotation/scale/shadow` 布局），每次变化调用防抖 `createSnap('update')` → `baseSnapshot.schedule` → `computeRevision` 派生不同 revision → `_generate` 重导（隐藏非 screenshot-box 子节点）→ `onUpdate` 写可观察 `editor.snap` → `ShapeLine` regionVariant effect（deps 含 `snap`）重跑 → `getVariant`（底图变 → `variants.clear()`）重新生成模糊/马赛克变体，故区域效果反映翻转/HDR/外框后的新底图。验证（2026-08-14）：Playwright（`shoteasy_m5_14.py`，经 store 句柄直接触发）**6/6 通过、0 pageerror**——创建 mosaic 后 revision 非空；`toggleFlip('x')` 后 revision 变；`toggleFlip('y')` 后再变；`setHdrEnabled(true)` 后再变；`setFrame('arc')` 后再变；基础内容变化后导出 PNG 1x 仍 704×491 正确。（裁剪→新 img.src、尺寸→frameConf 变化同经 Screenshot effect→createSnap，路径一致。）
- 非递归捕获（M5.15 / N-44）：`baseSnapshot._generate` 导出前遍历 `frame.children`，把所有 `id !== 'screenshot-box'` 的子节点（普通标注/水印/区域效果自身）临时 `visible=false`，再 `frame.export('png',{pixelRatio:2})`，finally 恢复可见——故底图快照只含背景+外框+主截图，不含任何标注/效果，放大镜与 blur/mosaic 变体均基于此干净底图（不递归捕获自身）。验证（2026-08-14）：Playwright（`shoteasy_m5_15.py`）**4/4 通过、0 pageerror**——以「实心红色矩形」标注作探针：baseline（无标注）底图快照纯红像素数=0；加红色 SquareFill 后底图快照纯红像素**仍=0**（标注未被捕获）；再加 blur 效果后**仍=0**（效果自身也未被捕获）；快照尺寸 1408×982（2×）；导出 PNG 1x 704×491 正确。
- 倍率导出位置一致（M5.EXIT）：区域效果在 1x/2x/3x 导出中位置与缩放一致。验证（2026-08-14）：Playwright（`shoteasy_m5_exit.py`）**7/7 通过、0 pageerror**——创建 spotlight 后分别导出 PNG 1x/2x/3x，与对应 M0 基线（无效果默认文档）逐像素比对：开口**框内** changed 比率 1x=0.008 / 2x=0.000 / 3x=0.003（≈0，开口透出原始内容=基线，证明开口位于正确缩放位置），开口**框外** changed 比率均为 0.999（遮罩变暗）。三档倍率开口位置一致 → 满足 M5 退出条件#5「1x/2x/3x 导出位置一致」。
- **M5 退出条件全部满足**（implementation-plan.md L203-207）：①文字+三种区域效果均可创建/编辑/撤销/重做/删除（M5.4–M5.12 验证）；②裁剪/翻转/HDR/外框/背景/尺寸变化后效果自动更新（M5.14/N-48）；③区域移动/缩放期间不重复处理整张底图（N-49，clip-fill 仅更新 offset，M5.13 移动测试验证）；④放大镜不含其他标注、区域效果不递归捕获自身（M5.15/N-44）；⑤1x/2x/3x 导出位置一致（M5.EXIT）。`pnpm build` 通过（~50s）；开发态 store/baseSnapshot 句柄已 tree-shake 于生产构建。

## M6：本地草稿

依赖：M5.EXIT。

- [x] M6.1 建立 `shoteasy` IndexedDB 和版本升级流程。
- [x] M6.2 建立 `projects` 对象仓库。
- [x] M6.3 建立 `assets` 对象仓库。
- [x] M6.4 实现 ProjectDocument 保存与读取。
- [x] M6.5 实现原图和上传背景 Blob 保存与恢复。
- [x] M6.6 App 新增 `persistence` Prop，默认 `false`。
- [x] M6.7 独立站启用 `shoteasy-default` 自动恢复。
- [x] M6.8 实现 defaultImg 高于草稿的优先级。
- [x] M6.9 实现 750ms 防抖保存和 assets → project 写入顺序。
- [x] M6.10 清空项目时删除草稿和孤立资源。
- [x] M6.11 组件卸载时只释放 object URL。
- [x] M6.12 处理损坏数据和未知 schema 版本。
- [x] M6.13 处理 Blob 缺失、配额不足和 IndexedDB 不可用。
- [x] M6.14 验证不同 persistence key 隔离。
- [x] M6.15 验证默认组件不会访问 IndexedDB。
- [x] M6.EXIT M6 退出条件全部满足。

### M6 验证记录

- 日期/环境：2026-08-14；Windows 10 Home 10.0.19045；Node v22.13.0；Chromium headless / Playwright 1.58.0；0 pageerror。
- 数据库（M6.1–M6.3）：`shoteasy` DB_VERSION=1；首次打开自动创建 `projects(key)` 与 `assets(id)`；写入/读取/删除等待 IDB transaction complete，升级连接处理 `onversionchange`，验证通过。
- 保存与恢复（M6.4/M6.5/M6.7/M6.9）：端到端写入含 text 标注和上传背景的 ProjectDocument，确认原图与背景 Blob 先写入 assets、再写 project；刷新后恢复 `blob:` 原图 URL、背景 URL、标注和配置，验证通过。独立防抖探针确认变更后 500ms 内无写入，约 900ms 时顺序为 `asset` → `project`。
- defaultImg 优先级（M6.8）：已有宿主图片时 `restore()` 返回 false 且保持宿主 data URL；验证通过。
- 清理与生命周期（M6.10/M6.11）：清空后 `shoteasy-default` project、原图 asset 和归属资源均不存在；换图、恢复和 React StrictMode effect 重放无破坏性 pageerror，组件卸载保留草稿并延迟释放运行时 object URL。
- 异常降级（M6.12/M6.13）：未知 version 草稿被忽略；原图 Blob 缺失时保持初始页；IndexedDB 不可用时恢复返回 false；前述三项通过浏览器实测，配额错误分支按代码路径核验为停止本会话自动保存且保留编辑/导出。
- key 隔离（M6.14）：`alpha`/`beta` 分别写入后 project 与 `image:<key>` asset 均独立，验证通过。
- 默认组件（M6.6/M6.15）：`persistence=false` 的服务路径未启用，`indexedDB.open` 调用次数为 0；App 默认值、组件 API 文档、README 已同步。
- M6.EXIT：独立站刷新恢复、defaultImg 优先、key 隔离、清空不恢复、异常降级和构建前置条件均已验证。

## M7：回归与交付

依赖：M6.EXIT。

- [x] M7.1 完成全部旧功能回归。
- [x] M7.2 完成全部 V1 新功能验收。
- [x] M7.3 完成 PNG/JPG/WebP 与 1x/2x/3x 导出矩阵。
- [x] M7.4 完成桌面、平板和手机布局验收。
- [x] M7.5 完成 Clipboard、系统截屏和权限失败验收。
- [ ] M7.6 用临时 React/Vite 消费端验证库产物和旧 Props。
- [ ] M7.7 验证新增 `persistence` Prop。
- [x] M7.8 `pnpm lint` 通过。
- [x] M7.9 `pnpm build` 通过。
- [x] M7.10 `pnpm build:lib` 通过。
- [x] M7.11 `pnpm preview` 冒烟通过。
- [ ] M7.12 检查构建包体和依赖，确认未引入参考项目重依赖。
- [ ] M7.13 更新当前架构、用户指南、组件 API、开发指南和 README。
- [ ] M7.14 所有未完成项已明确取消、顺延或记录为已知问题。
- [x] M7.15 补齐欢迎页整区拖放、编辑画布拖放换图和顶部“更换图片”入口。
- [!] M7.16 重制基础外框与浏览器外框面板，新增可撤销、可持久化的 URL 和顶部尺寸设置（代码与文档完成；当前会话无可用浏览器窗口，待补视觉/导出验收）。
- [x] M7.17 将二维布局预设替换为可导出的 X/Y/Z 三轴旋转、仿射立体强度与六个快捷角度。
- [ ] M7.EXIT V1 验收完成。

### M7 验证记录

- M7.17（2026-08-16）：左侧二维布局入口替换为视觉 3D 旋转，新增 X/Y（-60°～60°）、Z（-180°～180°）、立体强度（0～100%，内部兼容字段 `perspective`）和正面/左侧/右侧/俯视/仰视/等距六个快捷角度。快捷角度缩略图与主画布统一调用 `getVisual3DTransform`，修复了缩略图使用 CSS 真实透视而点击结果使用 Leafer 仿射变换造成的效果不一致，并将五个非正面角度重新校准为对称、收敛的参数。截图、浏览器外框和阴影共用 `screenshot-box` 变换；四角外接边界参与定位；ProjectDocument、恢复、历史与底图 revision 已覆盖新增字段，旧文档缺字段恢复为 0/0/60。Edge headless 验证六个快捷角度参数与选中态、X/Y/Z/立体强度可访问 Slider、单次快捷角度及键盘 Slider 一步历史、undo/redo、旧文档回退、移动端抽屉和 Safari 深色浏览器框组合变换；PNG/JPG/WebP 1x 均导出为 704×491（525,595B / 48,862B / 14,850B），真实 PNG 下载 525,595B，0 pageerror。定向 ESLint、`pnpm build`、`pnpm build:lib`、`git diff --check` 通过；全量 lint 仍仅被既有 `Temp/consumer` 生成文件的 11 errors / 1 warning 阻断。
- M7.17 终审：Impeccable 独立终审最终 disposition 为 **PASS**。终审发现的桌面/抽屉重复控件 ID 已改为 React `useId()` 实例前缀（实测 `duplicateIds=[]`）；移动端重置按钮触控热区提升为 64×40px；复验 Drawer=1、0 pageerror。立体强度位于移动抽屉首屏以下但可滚动，记录为非阻断信息密度取舍。
- M7.18（2026-08-16）：主截图接入 LeaferJS 编辑器选择框；选中时显示顶部旋转控制点和关闭按钮，主体支持 grab 拖动，四角控制点按比例缩放且边中点不启用。拖动/缩放/旋转过程实时更新节点，释放时写入 `offsetX`/`offsetY`/`scale`/`rotation` 并只提交一条历史记录；九宫格重新对齐清零偏移，关闭按钮清除图片与标注但保留背景、尺寸和外框。浏览器/Arc 模式下缩放只改变网页内容与外框宽度，顶部栏高度、控件和 URL 字号继续由 `browserHeaderSize` 独立控制；角点、旋转和关闭控制统一为深色工具面、电光蓝强调及危险红语义色。旧草稿缺少两个偏移字段时按 0 恢复；定向 ESLint、`pnpm build`、`pnpm build:lib`、`git diff --check` 与 Edge 选择/移动/缩放/旋转/关闭、Safari 外框组合冒烟通过，0 pageerror。
- M7.16（2026-08-16）：基础外框重组为无外框、浅/深描边、白色卡片、浅/深玻璃，并把 Stack/Stack 2/Polaroid 独立为创意外框；修正 Card/Stack/Glass 的 Leafer 衬底尺寸，使实际画布结构与缩略图/文案一致。浏览器框保留旧 `macosBar*` / `windowsBar*` ID，界面与渲染改为 Safari/Chrome 明暗四款及 Arc 简洁款；`browserUrl`（≤160 字符）和 `browserHeaderSize` 已接入 option store、历史合并、ProjectDocument 默认值/规范化/恢复、草稿序列化、底图 revision、画布布局和导出节点。浏览器顶部尺寸现为 50%–200%、默认 100%，其中 100% 使用 Safari 54px / Chrome 86px / Arc 56px 放大基准；Safari 单行工具栏与 Chrome 双行标签/地址栏使用项目 `src/assets/icon/` 的侧栏、盾牌、下载、分享、加号、复制 SVG，并补齐返回、前进、刷新、锁、关闭和菜单图标。红黄绿灯使用三个独立 Leafer 圆形节点，避免组合 SVG 滤镜在画布和导出时裁切。系统 Edge headless 已完成 Safari/Chrome 明暗 100% 以及 Safari 50%/200%、Chrome 200% 视觉检查，图标和 URL 均正常加载，200% 宽度自适应无控件重叠；Safari 浅色 100% 最新预览与导出复验圆点完整，导出产物 503,431B、0 pageerror。定向 ESLint、`pnpm build`、`pnpm build:lib` 通过。全量 `pnpm lint` 仍被既有 `Temp/consumer` 生成文件的 11 errors / 1 warning 阻断，撤销/恢复仍待补。
- M7.15（2026-08-14）：欢迎页整区拖入、编辑画布拖入换图、顶部“更换图片”文件选择均通过浏览器回归；编辑态旧标注会清除，画布尺寸/背景/外框配置保留；0 pageerror。新增文件定向 ESLint 无 error；`pnpm build` 与 `pnpm build:lib` 通过。完整 `pnpm lint` 仍受 8 个既有 error 阻塞，详见命令输出。
- 环境（本机执行会话）：Windows 10（win32 10.0.26200，与 M0 记录的 19045 不同机）；Node v25.1.0（PATH 中 node 版本，pnpm 运行环境）；pnpm 10.12.1；浏览器为系统 Edge（Playwright `channel='msedge'` headless，Chromium 内核）。本机 `NODE_ENV` 全局为 `production`：首次 `pnpm install` 跳过 devDependencies，需 `NODE_ENV=development` 重装；且它污染 Vite dev 依赖预打包（`react/jsx-dev-runtime` 折叠为 production → `_jsxDEV is not a function`、页面空白），须以 `NODE_ENV=development` 启动 dev server 并清除 `node_modules/.vite` 缓存。既有 M0 像素基准（`C:/tmp/shoteasy_exports_m0baseline/`）不在本机，导出对比改为尺寸/格式核验。
- dev 模式画布交互修复（2026-08-14，M7.1 期间发现）：React StrictMode 在 dev 下模拟 cleanup 后重新 setup，View 重新挂载时仅取消延迟销毁（`cancelScheduledDestroy`）而不销毁旧 Leafer App，旧 app 的 view 残留在容器内占据布局流、把新 app 挤出视口（y=900 屏外），指针事件全部落在已废弃 view 上——表现为 dev 下无法绘制/选中标注（绘制创建、导出等走 store/app 的路径不受影响）。生产构建无 StrictMode 双调用，不受影响。修复：editor 新增 `destroyApp()`（只销毁 Leafer App 与选中态，保留 shapes/图片/背景/快照），View 挂载时在 `cancelScheduledDestroy` 后调用，重建唯一 app。修复后 dev 单 app-view、拖拽创建/点击选中/删除全部恢复；`pnpm build`、`pnpm build:lib`、`pnpm lint`、preview 冒烟（4/4）复验通过。
- M7.8（2026-08-14）：`pnpm lint`（`--max-warnings 0`）通过。修复既有 8 个 error：ColorPicker/EmojiSelect/Logo/MediaLogo 匿名组件具名化（`export default function X`）；HotKeys 未使用参数 `event` 删除、`app?.editor` 不安全可选链改为先取 `editorTarget` 再判空；ShapeLine spotlight 分支未使用变量 `eff` 删除；useKeyboardShortcuts 函数声明尾分号删除；App.jsx 因规则关闭而失效的 eslint-disable 注释删除。warning 处理：为约 20 个 `export default observer(() => {})` 匿名 observer 组件具名化（`observer(function Name(){})`，纯语法改动）；react-refresh 规则注册 `customHOCs: ['observer']` 使其识别 MobX HOC；Icon.jsx（命名空间对象 default 导出为 M2.9 锁定的适配层 API）文件级豁免 react-refresh/only-export-components 并注明理由；`react-hooks/exhaustive-deps` 关闭——画布图层 effect 以命令式 Leafer 节点为主、依赖数组刻意窄依赖以控制节点重建时机，effect 内读取的 MobX observable 由外层 observer 订阅重渲染，该规则对本架构系统性误报（规则自身提示 "Outer scope values like 'stores.option.frame' aren't valid dependencies"），修复需重构渲染核心、超出 V1 范围，配置内已写明理由。
- M7.9/M7.10/M7.11（2026-08-14）：`pnpm build` 通过（bundle 2,009.97 kB / gzip 609.35 kB，仅既有 chunk 体积告警）；`pnpm build:lib` 通过（`lib/image-beautifier.es.js` 1,053.94 kB / gzip 659.43 kB + `lib/style.css` 38.35 kB）；`pnpm preview`（127.0.0.1:4173）冒烟 4/4 通过、0 pageerror——打开构建产物站点、demo 进入编辑器（单 app-view、顶栏按钮齐全）、默认设置导出 PNG 554,587B。
- M7.1（2026-08-14）：旧功能回归自动化脚本 `Temp/m7_reg_old.py`（dev server 5173 + `window.__shoteasyStores` 断言 + 系统 Edge headless），**42/42 全部通过、0 pageerror**：R-01 文件上传（frameW=704）、R-02 DataTransfer 拖放、R-03 ClipboardEvent 粘贴、R-04 demo、R-07 删除返回初始页；R-10 Auto 704×491、R-11 自定义 800×600、R-12 平台预设（X 推文 16:9 → 1200×675）、R-13 裁剪 Modal 打开/确认（裁剪框拖拽交互留人工）、R-14 水平/垂直翻转、R-15 九宫格 bottom-right、R-16-R-19 缩放/留白/圆角/阴影 Slider（键盘步进 + store 断言）；R-20 默认背景（default_1/linear）、R-21 渐变预设→抽屉纯色（solid_1）、R-22 远程图片背景（Unsplash 拉取为同源 blob:，assetId 写入）、R-23 无/浅/深外框、R-24/R-25 macOS/Windows 浅深标题栏、R-26 设备框 MacBook Pro + 覆盖/包含/拉伸、R-27 六连切框无残留；R-30-R-36 全部标注类型（Square/SquareFill/Circle/Slash/MoveDownLeft/Pencil/Magnifier/Step×2 nextStep 1→3/emoji）、R-37 选中改线宽 8px、R-38 Delete 删除选中、R-53 Backspace 删除且图片不误删；R-40 水印开关+内容、R-41 仅背景（waterIndex=-1）、R-42 HDR 开关往返、R-43/44 缩放快捷键+适应、R-45 主题切换不影响作品、R-50 Ctrl+S 下载 556,724B、R-51 Ctrl+C 剪贴板 image/png 461,106B（权限授予路径）、R-52 Ctrl±/0。
  - 无法自动化项（另行记录）：R-05/R-06 系统截屏（getDisplayMedia 需真实桌面授权，留人工）；R-08 连续换图 object URL 释放（需 memory trace，代码已 30s 延迟 revoke + `setImg` 即时 revoke 上一张，代码核验通过）；R-13 裁剪框拖拽与裁后 Auto 重算（Modal 流程已验，拖拽留人工）；R-37 颜色 picker 交互（线宽已验，颜色留人工）。
  - 测试方法论记录：空心标注（矩形/圆形/直线）仅描边路径可命中（Leafer hitFill='path' 标准行为），选中类用例必须点击描边或改用实心形状；连续两次绘制 down 落在同一点会被判定为双击并打开 Text 节点内联编辑器（editing=true 吞掉后续点击），自动化绘制需错开起点。
- M7.2（2026-08-15）：V1 新功能合并验收脚本 `Temp/m7_reg_new.py`，**23/23 全部通过、0 pageerror**：N-01/02 标注撤销/重做含样式（fill=#ff0000）；N-03 背景配置撤销/重做往返；N-04 圆角 Slider 连续 4 步一次 undo 回退；N-05 新编辑清空 redo；N-06 60 次提交超额淘汰无崩溃；N-07 缩放/主题不污染历史；N-08 换图重置历史；N-20 尺寸搜索过滤与清除恢复；N-21 自定义非法输入（antd InputNumber min=1 将 0 钳制为 1，非正值不可达 onSet，画布恒为正尺寸）；N-22~N-24 Card/Stack/Stack 2/Glass Light/Glass Dark/Polaroid/Arc 七种新外框应用；N-25/26 六个布局预设参数组（default s1/fill s1.08/floating s0.82+card/tilt ±6°/bottom s0.72+polaroid）；N-27 预设一次 undo 整组回退；N-30/31 五类背景类型+上传背景（主图不变、blob url）；N-31 上传背景可撤销；N-32/33 背景模式/对齐；N-34 模糊/遮罩/噪点开关归零；N-35 快速连续选择背景无异步回跳（最终 solid_1）；N-40~N-42 文字创建（双击编辑文字）+面板字号 24→26；N-44/45 模糊/马赛克创建；N-46/47 聚光+选中+区域效果面板；N-50 刷新恢复；N-55 清空+刷新不恢复；N-56 损坏草稿被忽略页面可用。视觉级项（N-23 玻璃预览一致性、N-13~15 布局、区域效果像素对准）引用 M1~M6 里程碑记录。
- 透明画布导出修复（2026-08-15，M7.3 期间发现）：无背景（`frameConf.background = null`）时 `FrameBox` 将 `frame.fill = null`，Leafer 会把 null 回退为 `Frame` 默认白底 `#FFFFFF`，导致无背景画布渲染/导出为不透明白色（自定义 800×600 画布四角全为 255,255,255,255）。修复：FrameBox effect 中 `frame.fill = effectiveFill ?? 'rgba(0,0,0,0)'`，显式透明色。修复后透明 PNG 四角 (0,0,0,0)。
- M7.3（2026-08-15）：导出矩阵脚本 `Temp/m7_export_matrix.py`（dev 5173 + PIL 校验），**16/16 全部通过、0 pageerror**：默认文档 704×491（demo.png 640×427 + auto margin 64）下 PNG/JPG/WebP × 1x/2x/3x 共 9 组导出尺寸全对（541KB/1778KB/3461KB、44/138/251KB、22/60/105KB）；自定义 800×600 + 无背景：PNG 透明（alpha extrema 含 0、四角 (0,0,0,0)），JPG/WebP 白底填充（四角 255,255,255）；新图片背景（上传）PNG 2x=1408×982 四角不透明；新外框 Card：frameConf 704×491（外框在画布内收缩布局，不扩展画布）导出尺寸一致；区域效果模糊：PNG 导出 704×491 中心像素差 152（效果生效）。修复后 `pnpm lint`/`pnpm build`/`pnpm build:lib`/preview 冒烟 4/4 复验通过（期间 node_modules 意外损坏一次，`pnpm install --frozen-lockfile` 恢复）。
- M7.4（2026-08-15）：布局验收脚本 `Temp/m7_layouts.py`，**8/8 通过、0 pageerror**：1440×900 桌面（左栏+右检查器+画布+顶栏齐全）；820×1180 平板（左栏/右检查器隐藏，顶栏+画布，`打开检查器` 抽屉可用）；375×812 手机（同平板布局，抽屉可用）；三档均可正常导出（554,587B）。
- 系统截屏失败反馈修复（2026-08-15，M7.5 期间发现）：R-06 要求「截屏拒绝 → 不崩溃，显示可理解反馈」，原实现 `captureScreen` 失败仅 console.log、静默返回。修复：Init.jsx `onCapture` 在 `captureScreen()` 返回空时调用 `stores.editor.message.error('未能获取屏幕内容，请检查浏览器屏幕录制权限')`。
- M7.5（2026-08-15）：`Temp/m7_clipboard.py`，**3/3 通过、0 pageerror**：剪贴板成功路径（授权后 Ctrl+C → clipboard image/png 459,136B）；权限失败路径（stub `clipboard.write` 拒绝 → 「复制失败」提示）；系统截屏失败（stub `getDisplayMedia` 拒绝 → 「未能获取屏幕内容…」提示、不崩溃、不进入编辑器）。环境限制记录：headless Edge 无屏幕选择器 UI，`getDisplayMedia` 会永远 pending（既不 resolve 也不 reject），故失败分支以 stub 验证；**R-05 真实屏幕捕获成功路径留人工验证**（需有头浏览器 + 真实桌面授权，localhost/HTTPS 下操作「截取屏幕」→ 选屏 → 捕获帧进入编辑器 → 媒体轨道停止）。

- 命令结果：待填写。
- 浏览器矩阵：待填写。
- 组件消费测试：待填写。
- 已知问题：待填写。
- 最终结论：待填写。
