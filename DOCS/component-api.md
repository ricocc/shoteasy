# `ImageBeautifier` 组件 API

## 构建与导入

库入口为 `src/index.js`，仅导出命名组件 `ImageBeautifier`。

```jsx
import { ImageBeautifier } from 'rico-screenshot';
import 'rico-screenshot/lib/style.css';

export default function Page() {
  return <ImageBeautifier />;
}
```

本地生成库产物：

```bash
pnpm build:lib
```

Vite 会以 ES module 形式输出 `lib/image-beautifier.es.js`（历史命名，为兼容已发布用户保留），样式通常输出为 `lib/style.css`。库构建把 `package.json` 中的所有 dependencies/peerDependencies 标记为 external，因此消费端必须能解析这些运行时依赖。

## Props

| 属性 | 类型（按实现推断） | 默认值 | 说明 |
| --- | --- | --- | --- |
| `defaultImg` | `string` | `undefined` | 初始或外部更新的图片地址/data URL；变化时重新载入 |
| `headLeft` | `ReactNode` | 内置 Logo | 替换头部左侧内容 |
| `headRight` | `ReactNode` | 内置主题按钮 | 替换头部右侧内容 |
| `isDark` | `boolean` | `undefined` | 真值时启用暗色；假值仍可能被本地主题记录覆盖 |
| `boxClassName` | `string` | `''` | 合并到顶层容器的 className |
| `onClear` | `() => void` | `undefined` | 用户确认删除当前截图后调用 |
| `persistence` | `false` 或 `{ key: string, autoRestore?: boolean }` | `false` | 显式开启 IndexedDB 草稿；按 `key` 隔离，`autoRestore` 默认开启 |

`defaultImg` 通过 `<img>` 加载；非 data URL 会设置 `crossOrigin="Anonymous"`。远程服务器必须允许跨域，否则载入或导出可能失败。

`persistence` 默认关闭，组件不会访问 IndexedDB。开启后，项目变化会以 750ms 防抖保存；关联的原图和上传背景会保存为 Blob。组件卸载只释放运行时 object URL，不删除草稿。传入 `defaultImg` 时优先使用宿主图片，不自动覆盖为草稿。

## 宿主布局

组件根节点固定使用 `w-full h-[100vh]`，并带有固定 ID `shoteasy-container`。嵌入非全屏区域时，可通过 `boxClassName` 传入 Tailwind/CSS 类覆盖高度，但宿主构建必须保留对应样式。

```jsx
<ImageBeautifier
  defaultImg={imageDataUrl}
  isDark={theme === 'dark'}
  boxClassName="h-[720px]"
  headLeft={<strong>My Editor</strong>}
  onClear={() => setImageDataUrl(null)}
  persistence={{ key: 'my-editor', autoRestore: true }}
/>
```

## 集成限制

- 仅支持浏览器环境；模块和组件使用 DOM、Canvas、媒体、剪贴板及 localStorage API。
- MobX store 是全局单例，不建议同页挂载多个实例。
- `isDark={false}` 不能强制覆盖 localStorage 中的 `dark`；需要宿主清理 `SHOTEASY_BEAUTIFIER_THEME` 或后续调整主题 API。
- 内部 UI 文案为中文，当前没有统一国际化接口。
- 没有受控 option/shapes API，也没有导出完成、编辑变化等事件回调。
- 组件使用固定 DOM ID；多实例还会产生重复 ID。
- 剪贴板、屏幕捕获和 EyeDropper 能力取决于浏览器与安全上下文。

## 发布信息

- 包名：`rico-screenshot`（产物文件沿用 `image-beautifier.es.js` 历史命名）
- 当前版本：`1.0.4`
- 模块格式：ES module
- 许可证：MIT
- `package.json#files`：`lib`、`license`、`README.md`

发布脚本 `pnpm release` 会直接执行 `npm publish`。发布前应完成构建与 lint，并人工检查 `lib/` 内容；不要在普通文档或代码修改中运行发布命令。
