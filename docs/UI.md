# UI / UX Specification — RWR Toolbox

本文件是 UI 的最高权威来源。任何 UI 实现（人写或 AI 生成）都必须以此为准。

设计方法论基线：《Refactoring UI》(Adam Wathan & Steve Schoger)。
所有数值刻度来自该书，不是随手定的。

---

## 【技术栈（不可偏离）】

- Framework: Angular v20（standalone + signals + `@if/@for` 新控制流）
- Styling: Tailwind CSS v4（CSS-first，无 `tailwind.config.js`）
- UI Components: DaisyUI v5
- Icons: lucide-angular（集中注册于 `src/app/shared/icons/index.ts`）
- i18n: Transloco（运行时）
- 运行环境：Desktop Application（Tauri，**非 Web / 非 Mobile**）

---

## 【产品定位】

- 工具型桌面客户端，面向 RWR（Running With Rifles）核心玩家 / MOD 使用者
- 长时间运行、高频操作，常与游戏同时窗口化运行
- 目标不是「好看」，而是：**稳定、可维护、高信息密度、工程友好**

---

## 【分辨率约束】

- 最小支持 / 默认启动：`800 × 600`（必须完全可用）
- 推荐：`1280 × 720` 或更高
- 最大支持：`3840 × 2160` (4K)，布局正确、元素不拥挤

强制要求：禁止页面级横向滚动条；禁止内容被裁剪；各区域允许独立纵向滚动。
宽内容（表格、代码块）必须在自己的 `overflow-x-auto` 容器内滚动。

---

## 【设计系统 — 权威 token】

**唯一色彩事实源是 `src/styles.css` 中的两个 `@plugin "daisyui/theme"` 块。**

### 主题：军事工具风

自定义 `light` / `dark` 双主题（`themes: false`，不再打包 DaisyUI 内置主题）：

| 角色 | 取向 | 说明 |
|---|---|---|
| `base-100/200/300` | 暖橄榄色调灰阶 | 灰阶带色相（light 约 90–95°，dark 同色相），**从不使用无色相纯灰** |
| `base-content` | 暖黑 / 暖白 | 非纯黑纯白 |
| `primary` | 军绿 olive drab | 主操作、菜单选中、链接 |
| `secondary` | 琥珀 | 次级强调 |
| `accent` | 卡其 / 沙色 | 第三级 |
| `info / success / warning / error` | 钢蓝 / 绿 / 琥珀 / 红 | `success` 与 `primary` 拉开约 20° 色相，避免军绿与成功绿混淆 |

所有 `*-content` 对其底色的对比度已验算 ≥ 4.39:1。

### 非颜色 token

```
--radius-selector: 0.25rem   徽章 / 复选框 / 小芯片
--radius-field:    0.25rem   按钮 / 输入框 / select / tab
--radius-box:      0.375rem  卡片 / 面板 / modal / 下拉容器
--border: 1px    --depth: 1    --noise: 0
```

### 字体

`@theme` 中的 `--font-sans` / `--font-mono` 含 CJK 回退栈
（PingFang SC → Microsoft YaHei → Noto Sans CJK SC → 文泉驿），覆盖 Tauri 三平台。
不加载 Web Font（CSP `font-src` 仅 `'self' data:`）。

### 阴影海拔（5 档，按 z 位置选，不靠手感调 blur）

| 类 | 用途 |
|---|---|
| `shadow-sm` | 静置卡片、工具栏 |
| `shadow-md` | hover 抬升、sticky 表头 |
| `shadow-lg` | dropdown / popover |
| `shadow-xl` | 拖拽中元素、toast |
| `shadow-2xl` | **仅** modal |

**border 与 shadow 不叠加**——两者做同一件事，二选一。

---

## 【排版规范】

### 字号阶梯（最小 12px）

只用 Tailwind 标准刻度。**禁止任意值字号 `text-[Npx]`**——这是本项目历史上最大的排版债务（曾有 100 处 9/10/11px）。

| 类 | 用途 |
|---|---|
| `text-xs` (12px) | 辅助层专用：徽章、单位、时间戳、uppercase 小节标签、表格密集数值 |
| `text-sm` (14px) | **正文默认档**：说明文字、表单值、表格主列、可点击项 |
| `text-base` (16px) | 卡片标题 |
| `text-lg` / `text-xl` / `text-2xl` | 区块标题 / 页面标题 |

**升档三问**（任一为「是」→ 至少 `text-sm`）：
1. 用户必须读它才能完成任务？
2. 它可点击 / 可交互？
3. 它是表单值或表格主列？

### 弱化文字（3 档语义，不得混用其它机制）

| 档 | 写法 |
|---|---|
| 主文字 | 默认，不写颜色类 |
| 次级（说明、次要列） | `text-base-content/70` |
| 三级（占位、时间戳、空态描述） | `text-base-content/50` |

- **`opacity-*` 只用于整块元素淡出**（禁用态、hover 显隐、装饰图标/水印）。
  文字弱化一律走颜色 alpha，否则元素内的图标和边框会跟着一起淡掉。

### 彩色面板上的文字（易错点）

**`text-base-content/N` 只在中性底（`base-100/200/300`）上成立。**
把它放到 `alert-info`、`badge-error`、`bg-primary` 这类饱和底上，是中性色相压彩色色相，
必然发灰——实测 `text-base-content/70` 压 `alert-info`：亮色 **1.85:1**、暗色 **1.70:1**，
远低于 AA 的 4.5:1（这正是本项目曾经踩过的坑，机械替换 `opacity-70` 时引入）。

底色类型决定可用的文字色：

| 底 | 文字 |
|---|---|
| 中性底 `base-*` | `base-content` + `/70` `/50` 弱化档 |
| 饱和底 `alert-info` / `badge-error` / `bg-primary` | 对应 `*-content` 色，**且不再做弱化**（实心底上没有弱化余量） |
| soft 底 `alert-soft` | 本质是带色相的中性底，可用 `base-content`；需要更强对比时显式写 `text-base-content` 覆盖 daisyUI 默认的主题色文字 |

**要在面板内做层级，就别用实心底**——改用 `alert-soft`：
底色是 `color-mix(色 8%, base-100)`，中性文字在上面有 8.8–13.2:1 的余量，
弱化档也够用。

### 提示面板的响度

`alert-info` / `alert-success` 这类**被动提示**一律用 soft 变体（`alert alert-soft alert-info`）。
只有需要打断用户的 `alert-error` / `alert-warning` 才用实心。
理由：一块饱和色面板会比页面上的主操作按钮更响，而一条格式说明不该盖过「选择文件」。

面板内部同样要分主次：**用户真正要用的内容（如文件名规格、命令、路径）给全强度 + `font-mono`，
引导句反而收一档**。把 payload 弱化成灰字是把信息藏起来。

### 字重

两档：`font-medium`（次强调）与 `font-semibold`（标题 / 强调）。
`font-bold` 仅用于页面标题级。**禁止 400 以下字重**。

### uppercase 必带 tracking

`uppercase` + `text-xs` → `tracking-wider`；`text-sm` 及以上 → `tracking-wide`。
小节标签统一：`text-xs font-semibold tracking-wider text-base-content/70 uppercase`。

### 其它

- 行长 45–75 字符（`max-w-[65ch]`）；长段落不得居中
- 混合字号文本基线对齐，不要居中对齐

---

## 【共享组件目录（强制使用）】

位于 `src/app/shared/components/`，统一从 barrel `index.ts` 导入。
**下列模式已有组件覆盖，禁止在页面中重新手写。**

| selector | 用途 |
|---|---|
| `app-page-header` | 页面唯一的 h1 + 右侧 `[actions]` 按钮组。**每个页面必须有且仅有一个** |
| `app-section-title` | 卡片 / 区块小标题（uppercase 弱化档） |
| `app-empty-state` | 空状态：`sm` 卡片内 / `md` 默认 / `lg` 整页；`[action]` 插槽放 CTA |
| `app-pagination` | 页码分页（滑动窗口 + 首末页固定）；`[info]` 插槽放统计文案 |
| `app-label-value` | 详情面板的「标签 + 值」字段对 |
| `app-stat-card` | 统计卡：`[value]` / `[desc]` / `[figure]` 插槽 |
| `app-filter-toolbar` | 表格上方的筛选控件面板（纯布局） |
| `highlight` 管道 | 搜索词高亮（`shared/pipes/highlight.pipe.ts`），输出已转义 |

组件约定：standalone + `ChangeDetectionStrategy.OnPush` + signal API
（`input()` / `output()` / `model()`）；接收 i18n key 内部翻译，数据文本走 `ng-content`。

---

## 【DaisyUI v5 类黑名单】

以下类在 DaisyUI v5 中**不存在**，写了也不生效（v4 遗留）：

| 禁用（v4） | v5 替代 |
|---|---|
| `form-control` | `<fieldset class="fieldset">` + `<legend class="fieldset-legend">`，或 `flex flex-col gap-1` |
| `label-text` | 字段标题 → `fieldset-legend`；行内说明 → `<span class="label">` |
| `input-bordered` / `select-bordered` / `textarea-bordered` | 直接删除（v5 默认带边框；需无边框用 `input-ghost`） |
| `card-compact` | `card-sm` |
| 裸 `active`（menu 项） | `menu-active` |

**自定义 CSS 中引用主题色必须用 v5 变量名 `--color-*`**
（`--color-base-200`、`--color-primary` …）。
v4 短名 `--b1/--b2/--bc/--p/--rounded-box` 已不存在，写了是静默失效。

---

## 【颜色使用规则】

- 只用 DaisyUI 语义色：`bg-base-*`、`text-base-content`、`btn-primary`、`badge-soft badge-error` …
- **禁止 Tailwind 调色板硬编码**（`bg-gray-100`、`text-blue-700`、`bg-yellow-200` …）——
  它们不随主题变化，在暗色主题下必然对比失效
- 颜色不得单独承载信息：每个颜色信号必须配图标或文字
- 装饰性的「三色轮转」（每张卡片换一个主题色）是反模式：
  颜色要么有语义，要么不上色

---

## 【布局与间距】

- 间距只用 Tailwind 标准刻度；同一模式在全应用保持同一个值
- 页面容器统一：内容页 `p-4 space-y-4`；宽文档页加 `mx-auto max-w-5xl` / `max-w-2xl`
  （外层壳 `app.component.html` 已有 `p-2`）
- 空间要有层级：组**之间**的间距必须大于组**内部**的间距
- 先给足白，再往回收；不要靠边框分隔——优先用间距、背景色差、阴影

---

## 【Desktop Layout Skeleton（结构锚点）】

宏观布局由 `src/app/app.component.html` 承载，禁止引入新的宏观布局层级：

```txt
AppComponent (app.component.html)
├─ aside      侧边导航（menu，数据源 shared/constants/menu-items.ts）
├─ header     顶栏（状态面板 / 主题 / 快捷键开关）
├─ main       router-outlet 内容区（独立滚动）
├─ footer     底部状态栏（API 连接、版本、update-prompt）
└─ aside      右侧状态面板（可开关）+ 快捷键 modal
```

---

## 【Tailwind / CSS 使用决策顺序（强制）】

1. 是否已有共享组件（见上表）可以直接用？
2. 是否已有 DaisyUI 组件类可以表达？
3. 是否可以用 Tailwind utility 组合实现？
4. 是否**确实无法**用 utility 表达？

➡️ **只有第 4 点成立时，才允许写自定义 CSS。**

当前全局组件类豁免清单（`src/styles.css` 的 `@layer components`）——
新增前必须先证明 utility 无法表达：

| 类 | 为什么无法用 utility |
|---|---|
| `.markdown-body` | 样式作用于运行时生成的 HTML，工具类够不着 |
| `.custom-scrollbar` | `::-webkit-scrollbar` 伪元素无工具类等价物 |
| `.table-sticky-zebra` | 需要 `:nth-child` + 后代选择器：sticky 单元格不继承行背景，冻结列必须自行重绘斑马纹 |
| `.control-area` | 旧筛选栏容器，**待删**——已被 `app-filter-toolbar` 取代 |

禁止：创建重复 Tailwind 功能的自定义 class；在组件 `styles` 中写布局 / 间距 / 排版。

---

## 【国际化（i18n）— NON-NEGOTIABLE】

- 语言：英文（默认）、中文；实现方式 Transloco（运行时）
- 翻译文件：`src/assets/i18n/en.json`、`src/assets/i18n/zh.json`
- **所有用户可见文本必须国际化**，禁止模板 / TS 中硬编码文案
- 模板统一用结构指令 `*transloco="let t"`；组件内联模板可用 `| transloco` 管道
- Key 层级点命名：`menu.dashboard`、`common.confirm`、`servers.column.name`
- 新增 key 必须**同时**提供中英文案；禁止占位翻译（TODO / 待翻译）

---

## 【图标】

- 只用 `lucide-angular`，使用前必须先在 `src/app/shared/icons/index.ts` 注册
- 禁止模板中手写 `<svg>`
- 图标有其被绘制的尺寸：常用 `h-4 w-4`(16px) / `h-5 w-5`(20px) / `h-3.5 w-3.5`(14px)；
  大空态图标 `h-12 w-12` 以内。不要把 16px 图标放大 3–4 倍

---

## 【LLM UI Execution Contract】

当你作为 AI 被要求设计或实现 UI 时：

**范围**
- 仅实现当前需求涉及的 UI；禁止生成完整应用或未来功能 UI；禁止主动扩展产品范围

**粒度**
- 以 Angular Component 为最小单元；单一职责、可复用、可国际化
- 禁止「万能组件」或「巨型页面」

**动手前必查**
1. 这个模式在共享组件表里有没有？有就用，别手写
2. 我用的类在 v5 黑名单里吗？
3. 字号在刻度上吗？弱化用的是颜色 alpha 还是 opacity？
4. 颜色是语义色还是硬编码调色板？

**自检命令**（改完 UI 应全部返回 0 行）：

```bash
grep -rEn "text-\[(9|10|11)px\]" src/app
grep -rEn "label-text|input-bordered|select-bordered|textarea-bordered|form-control|card-compact" src/app
grep -rn "bg-gray-|bg-red-100|bg-yellow-200|text-blue-700" src/app
grep -rn "uppercase" src/app --include="*.html" | grep -v tracking
grep -rEn "var\(--b[123]\)|var\(--bc\)|var\(--p\)|--rounded-box" src/
```

彩色底上的中性文字无法用 grep 可靠检出（要看 DOM 祖先），改完 alert / badge / 彩色面板时人工核对：
**这块底是彩色的吗？是的话文字色必须来自同一色相。**

配套静态审计与截图工具见 `.claude/skills/refactoring-ui/scripts/`。
注意：审计脚本读源码文本而非渲染结果，它对 DaisyUI `.btn` 会误报
缺少 hover / focus-visible（daisyUI 自带），需人工判读。

---

## 【结语】

本 UI 规范是 **AI 与人类共同开发时的可执行 UI 合约**。
当实现与本文件冲突时，以本文件为准；当本文件与《Refactoring UI》冲突时，先改本文件并说明理由。
