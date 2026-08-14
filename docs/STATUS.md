# STATUS

TL;DR：

- 这是 **RWR Toolbox 的项目状态快照**（技术栈/架构/完成度/关键约束）。
- 需要了解“现在做到哪了”先看这里；规划与决策请看 `PLAN.md`。

## 项目概述

- **项目名称**: RWR Toolbox
- **版本**: 0.2.1（以 `package.json` / `src-tauri/tauri.conf.json` 为准，两者必须一致）
- **类型**: Tauri + Angular 桌面客户端
- **目标游戏**: Running With Rifles (RWR)

## 技术栈

| 类别     | 技术           | 版本    |
| -------- | -------------- | ------- |
| 前端框架 | Angular        | 20.3.15 |
| 语言     | TypeScript     | 5.8.3   |
| 构建     | Angular CLI    | 20.3.13 |
| 包管理   | pnpm           | —       |
| 国际化   | Transloco      | 8.2.0   |
| 桌面框架 | Tauri          | 2.x     |
| 样式     | Tailwind CSS   | 4.2.4（CSS-first，无配置文件） |
| UI 组件  | DaisyUI        | 5.5.19  |
| 图标     | Lucide Angular | 0.562.0 |
| 虚拟滚动 | Angular CDK    | 20.2.14 |

## 项目架构（快照）

```
src/app/
├── app.component.*          # 主应用布局（支持 800x600 高密度布局）
├── app.config.ts            # 全局配置（Transloco, Lucide, Router）
├── app.routes.ts            # 路由配置
├── transloco-loader.ts      # 运行时多语言加载器
├── notfound/                # 404 页
├── core/                    # 应用壳专用，不对外复用
│   ├── components/
│   │   └── update-prompt.component.ts   # 状态栏更新提示
│   ├── services/            # cache / http-client（Tauri）/ ping / settings / version-check
│   ├── utils/               # performance.utils.ts
│   └── workers/             # data-processor.worker.ts
├── shared/                  # 跨 feature 复用
│   ├── components/          # 共享展示型组件（barrel: index.ts）
│   │   ├── page-header/             # 页面唯一 h1 + actions 插槽
│   │   ├── section-title/           # 卡片/区块小标题
│   │   ├── empty-state/             # 空状态（sm/md/lg）
│   │   ├── pagination/              # 页码分页
│   │   ├── label-value/             # 详情面板标签-值对
│   │   ├── stat-card/               # 统计卡
│   │   └── filter-toolbar/          # 表格筛选面板（纯布局）
│   ├── adapters/            # virtual-scroll.adapter.ts
│   ├── icons/index.ts       # lucide 图标集中注册表（用前必须注册）
│   ├── services/            # game-translation / theme
│   ├── pipes/               # highlight.pipe.ts（输出已转义）
│   ├── utils/               # highlight.utils.ts（高亮实现 + 标记类常量）、hotkey-share.utils.ts
│   ├── constants/           # menu-items.ts（i18n key 驱动）、weapon-classes.ts
│   ├── guards/              # path-detected.guard.ts
│   ├── interfaces/          # menu-item / route-data
│   └── models/              # 12 个：column / common / directory / hotkeys / items /
│                            #        mod / player / server / sort / tab / theme / weapons
└── features/                # 功能模块（各自带 services/ 与 *-columns.ts 列配置）
    ├── dashboard/           # 仪表板（统计卡 + 快捷操作 + 活动时间轴）
    ├── servers/             # 服务器列表（sticky 列表格 + Ping）
    ├── players/            # 玩家搜索（多数据库切换 + 服务端搜索）
    ├── data/                # 数据管理
    │   ├── local/           # tab 容器
    │   ├── items/           # 物品表（CDK 虚拟滚动双表格）
    │   └── weapons/         # 武器表（同上，与 items 结构重复，见下方「已知技术债」）
    ├── mods/                # Mod 管理：mods-layout / install / bundle / assets
    ├── hotkeys/             # 快捷键配置
    ├── settings/            # 应用设置（语言、主题、路径）
    ├── about/               # 关于页面
    └── shared/services/     # scrolling-mode.service.ts
```

> 注意：`features/shared/` 与 `app/shared/` 并存且命名重叠，容易混淆。
> 前者只放 feature 之间共享的服务，新代码优先放 `app/shared/`。

## 功能实现状态（快照）

### ✅ 已完成

#### 1. 国际化迁移 (100%)

- [x] 移除 `@angular/localize` 构建时国际化
- [x] 集成 **Transloco** 运行时国际化
- [x] 建立 `en.json` 和 `zh.json` 翻译资源文件
- [x] 实现运行时语言切换（Settings 页面）
- [x] 翻译所有已完成的 UI 文本（菜单、仪表盘、服务器、玩家）

关键文件：

- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`
- `src/app/app.config.ts`

#### 2. 800x600 布局优化 (100%)

- [x] 侧栏宽度固定 200px，增加 `truncate` 防止文字溢出
- [x] 仪表盘 Stats Grid 采用响应式（小屏 2列，大屏 4列），增加卡片内边距提升可读性
- [x] 状态面板（Right Panel）优化宽度并添加滚动条
- [x] 服务器和玩家表格在 800px 下自动隐藏次要列，保持核心数据可见
- [x] 恢复标准字体大小（`text-sm`/`text-xs`），避免过度缩小导致阅读困难
- [x] 优化组件间距，平衡信息密度与视觉舒适度

关键文件：

- `src/app/app.component.html`
- `src/app/features/dashboard/dashboard.component.html`
- `src/app/features/servers/servers.component.html`

#### 3. 服务器管理 (100%)

- [x] 服务器列表展示
- [x] 多条件过滤与排序
- [x] 收藏功能集成
- [x] Ping 检测集成
- [x] 适配 Transloco

#### 4. 应用设置 (100%)

- [x] 语言切换功能
- [x] 界面结构完成
- [x] 游戏路径配置逻辑（支持多目录扫描）
- [x] 主题切换集成（支持自动/浅色/深色）


#### 5. 仪表板 (100%)

- [x] 高密度布局设计
- [x] 快速操作入口
- [x] 实时对接 API 统计数据 (服务器、玩家、本地模组)
- [x] 实时 API 延迟检测 (Ping)
- [x] 最近活动时间轴（支持滚动）
- [x] 项目更新日志同步 (CHANGELOG.md)

#### 6. 玩家搜索 (100%)

- [x] 响应式表格布局
- [x] 多数据库（Invasion, Pacific 等）切换
- [x] 分页导航逻辑
- [x] 收藏夹集成
- [x] 服务器端搜索（带 500ms 防抖，支持查询全库玩家）
- [x] 搜索时保持分页状态
- [x] 更改数据库/排序时自动重置到第一页
- [x] 完整的国际化支持（包括分页器翻译 key）
- [x] 列可见性切换（17 列可选，持久化设置，支持中英文）

API 限制说明：

- 由于接口限制，无法获取总页数，分页器仅显示“第 X 页”而非“第 X / Y 页”

列可见性功能：

- 默认显示 9 列：序号、用户名、击杀、死亡、分数、K/D、时长、经验、军衔
- 可选显示 8 列：连杀、摧毁目标、摧毁载具、治疗、TK、移动距离、射击次数、投掷次数
- 序号列固定在左侧，始终可见
- 设置持久化到 localStorage

关键文件：

- `src/app/features/players/services/player.service.ts`
- `src/app/features/players/players.component.ts`
- `src/app/features/players/players.component.html`
- `src/app/features/players/player-columns.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`


#### 7. 热键编辑器 (100%)

- [x] Rust 后端：XML 解析/生成、文件读写
- [x] Profile 管理：创建/删除/切换/导入导出
- [x] 热键编辑：表格视图、冲突检测
- [x] 三标签页 UI：读取、配置方案、编辑
- [x] 完整国际化支持（中英文）

关键文件：

- `src-tauri/src/hotkeys.rs`
- `src/app/shared/models/hotkeys.models.ts`
- `src/app/features/hotkeys/services/hotkey.service.ts`
- `src/app/features/hotkeys/hotkeys.component.ts`


#### 8. 数据管理 (100%)

- [x] **001-fix-data-scanning**: 修复数据扫描错误和 UX 改进
    - [x] 模板文件解析修复（支持 `@file` 相对路径引用）
    - [x] 并行扫描（使用 rayon 提升性能）
    - [x] 自动扫描触发（首次进入 /data 页面自动加载）
    - [x] 多目录激活状态管理（可启用/禁用扫描目录）
    - [x] 包数量显示（设置页面显示 "X packages"）
    - [x] 抽屉图片布局优化（图片内联显示）
    - [x] 本地游戏数据目录扫描 (基础扫描功能已完成)
    - [x] 资源文件预览

关键文件：

- `src-tauri/src/weapons.rs` - 武器扫描引擎
- `src-tauri/src/items.rs` - 物品扫描引擎
- `src-tauri/src/directories.rs` - 目录验证
- `src/app/features/data/weapons/weapons.component.ts` - 武器列表组件
- `src/app/features/data/items/items.component.ts` - 物品列表组件
- `src/app/features/settings/services/directory.service.ts` - 目录管理服务

#### 9. UI 重构至军事风设计系统 (100%)

- [x] 自定义 DaisyUI `light`/`dark` 双主题（`themes: false`，不再打包 35 套内置主题）
- [x] 清理 DaisyUI v4 遗留：失效的 `var(--b2)` 类变量、95 处 no-op 类、孤儿样式文件
- [x] 建立字号阶梯（下限 12px，移除 100 处任意值字号）与 3 档弱化机制
- [x] 建立 5 档阴影海拔与统一圆角 token
- [x] 抽取 7 个共享展示组件 + `highlight` 管道，消除跨页重复
- [x] 移除破坏暗色主题的硬编码调色板值

关键文件：

- `src/styles.css` - 主题定义 + `@theme` token + 全局组件类
- `src/app/shared/components/` - 共享组件层
- `docs/UI.md` - 规范权威来源

### 已知技术债

- **items / weapons 模板重复**：两页各约 1000 行，CDK 双表格表头同步实现逐段对应，
  属复制粘贴分叉。合并为泛型 data-table 的方案已设计，但需要在 Tauri 桌面端用真实
  游戏数据做滚动性能对比后才能落地（浏览器端跑不了）。
- **DashboardService 状态往返**：内部用 signal，却经 `toObservable()` + `combineLatest`
  暴露，组件再 `toSignal()` 转回，违反 `CONSTRUCTION.md` 原则 IV。新代码不要照抄。
- **`features/shared/` 与 `app/shared/` 命名重叠**：见架构快照下方注释。

## 设计规范（快照）

> 完整规范见 `docs/UI.md`（唯一权威来源）。以下仅为要点。

### UI/UX 原则

1. **Desktop-first**：针对 800x600 最低分辨率深度优化
2. **军事工具风主题**：自定义 DaisyUI `light`/`dark` 双主题（暖橄榄灰阶 + 军绿主色 + 琥珀次色 + 小圆角），
   定义在 `src/styles.css`，是全应用唯一色彩事实源
3. **高信息密度，但字号有下限**：最小 12px（`text-xs`），
   **禁止任意值字号 `text-[Npx]`**——`text-xs` 只承担辅助层，正文默认 `text-sm`
4. **弱化文字用颜色 alpha**：`text-base-content/70`（次级）、`/50`（三级）；
   `opacity-*` 只用于整块元素淡出
5. **共享组件优先**：页头/小节标题/空态/分页/标签值对/统计卡/筛选栏已组件化，禁止手写
6. **运行时切换**：语言与主题切换无需重新构建
7. **键盘友好**：Ctrl+1..8 页面切换、Ctrl+S（状态面板）等快捷键

## 开发命令（快照）

```bash
pnpm start           # 开发服务器
pnpm tauri dev       # Tauri 桌面端开发
pnpm build           # 构建生产版本
pnpm format:all      # Prettier 全量格式化
```

## 注意事项（快照）

1. **i18n**：新增文本必须在 `src/assets/i18n/` 中添加 key（中英双语），不要在模板中直接写硬编码文本。
2. **布局**：使用 `hidden md:table-cell` 等类来控制在窄屏下的列显隐。
3. **状态**：优先使用 Signals 管理组件内部状态。
4. **DaisyUI v5**：`form-control` / `label-text` / `input-bordered` / `card-compact` 等 v4 类已被移除，
   写了不生效；自定义 CSS 引用主题色必须用 `--color-*`，v4 短名 `--b2/--bc/--p` 已不存在。
