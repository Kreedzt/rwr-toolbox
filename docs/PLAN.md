## PLAN.APPENDIX

TL;DR：
- 这里收纳 **实现参考与关键细节**（协议/解析策略/多平台差异/数据结构）。
- `PLAN.md` 只保留“决策与边界”，不要在那边贴长代码；长细节统一进本附录。

## 目录
- Ping（跨平台命令与输出解析）
- 服务器列表 API（拉取策略与 XML 解析要点）
- 玩家列表 API（HTML 解析与分页判定）
- 热键编辑器（数据结构与 profile 策略）
- 本地 Mod / RWRMI（打包/读取/备份/还原/安装）

---

## Ping：跨平台命令与输出解析

### 用途
- 对服务器列表做延迟检测（桌面端调用系统 `ping`）。

### 命令差异（建议）
- **Windows**：`cmd /C ping -n 3 -w <timeout_ms> <addr>`（常见需要先切 UTF-8 codepage）
- **macOS**：`ping -c 3 -t <timeout_s> <addr>`
- **Linux**：`ping -c 3 -W <timeout_s> <addr>`

### 解析要点（历史实现思路）
- **Windows**：通常从输出末行的统计信息中提取 `Average=xxms`；丢包时返回 `-1`。
- **macOS/Linux**：从末行 `round-trip min/avg/max/stddev = ...` 提取 `avg`（第二段）。

### 注意事项
- 输出语言/编码可能随系统区域设置变化；解析要尽量稳健（优先按结构而非纯文本）。
- 桌面端应限制并发 Ping 数量，避免 UI 卡顿与系统资源飙升。

---

## 服务器列表 API：拉取策略与 XML 解析要点

### 用途
- 拉取官方服务器列表（数量相对少），用于 `/servers` 页面。

### 拉取策略（推荐）
- 每页 size=100 批量拉取，直到返回为空或不足一页 → 前端分页/筛选/排序。
- 请求加 `_t=<Date.now()>` 防缓存；每批次设置超时；失败时可返回已拉到的数据并提示“部分更新失败”。

### 解析要点（XML）
- 官方返回一般是 XML（不同接口可能结构略有差异）。
- 解析时要兼容：`result.server_list.server` 与 `result.server` 两种形态；单个 server 可能被解析为 object 而非 array。
- 玩家列表字段（player）可能是单值/数组/空，需要统一成 `string[]` 并过滤空白。

### 注意事项
- 真实可用的服务器列表 endpoint 以 `PLAN.md` 为准；如出现历史文档中的不同 endpoint（例如 `view_servers.php`），需以当前工程实现与实际可用性验证后再更新文档口径。

---

## 玩家列表 API：HTML 解析与分页判定

### 用途
- 拉取玩家排行列表（数据量大），用于 `/players` 页面。

### 拉取策略（推荐）
- 每次只拉取单页（接口慢且通常拿不到总数）。
- 通过响应 HTML 中是否出现 **Next/Previous** 链接判断是否还有下一页（`hasNext/hasPrevious`）。
- size 建议 20–100；排序多为降序。

### 解析要点（HTML → 结构化）
- 使用 HTML/XML parser（例如 `fast-xml-parser`）把表格解析出来。
- 表格定位要做“多路径兜底”：`html.body.table` / `table` / `body.table` 等。
- 数据行要过滤表头（含 `<th>` 的行）。
- 单元格内容要兼容多形态：纯文本、`#text`、`<a>`、`<img>`（军衔图标 src）。

### 分页判定（Next/Previous）
- 在解析后的对象树里递归扫描 `<a>` 节点文本：\n
  - 文本等于 `NEXT` → `hasNext=true`\n
  - 文本等于 `PREVIOUS` → `hasPrevious=true`

### 注意事项
- 由于没有总页数：分页器避免展示 “X/Y”，只展示 “第 X 页”更符合事实。
- 建议对请求做防抖与取消（输入搜索时），避免频繁打接口。

---

## 热键编辑器：数据结构与 profile 策略

### 用途
- 读取/编辑/写回游戏的 `hotkeys.xml`，并支持多套 profile 保存与切换。

### 建议数据结构（来自历史草稿，供实现参考）
```ts
// xml 原始格式配置项
export interface IHotkeyRawConfigItem {
  '@_index': string;
  '@_text': string;
  '@_comment'?: string;
}

export interface IHotkeyRawConfig {
  hotkeys: {
    hotkey: IHotkeyRawConfigItem[];
  };
}

// 单项 hotkey 配置
export interface IHotkeyConfigItem {
  label: string;
  value: string;
}

// 单项 profile
export interface IHotkeyProfileItem {
  id: string;
  title: string;
  config: IHotkeyConfigItem[];
}

export type IHotkeyConfig = {
  hotkeys: IHotkeyProfileItem[];
};

export type IHotKeyProfileCreateItem = Omit<IHotkeyProfileItem, 'id'>;

// 分享配置（可选）
export interface IShareProfileItem {
  type: 'profile';
  value: Omit<IHotkeyProfileItem, 'id'>;
}
```

### 操作要点（建议）
- 从游戏读取 `hotkeys.xml` → 解析为 raw → 转换为内部 profile
- 支持：导入/导出 profile、重置默认、写入指定 profile 到游戏文件

---

## 本地 Mod / RWRMI：打包/读取/备份/还原/安装

### 用途
- 为“非 Workshop 的本体 Mod”提供管理能力：打包分发、安装、备份与回滚。

### RWRMI 打包格式（建议约定）
- 产物命名：`[RWRMI][{game_version}]{title} v{version}.zip`
- ZIP 内建议包含：
  - `config.json`（title/description/authors/version/game_version）
  - `README.md`
  - `CHANGELOG.md`
  - `mod/`（实际 Mod 内容，保持目录结构）

### 安装与备份（建议流程）
- 安装前：根据 zip 中将要覆盖的文件清单，在缓存目录生成备份 zip（可恢复）。
- 安装时：解压到目标目录（注意路径穿越保护与权限）。
- 恢复：从备份 zip 解压回目标目录，尽量恢复文件权限（unix mode）。

### 注意事项
- 解压需防御 Zip Slip（只允许 `enclosed_name` / 规范化后仍在目标目录内的路径）。
- 对已存在文件的覆盖策略要明确（提示/强制/跳过/对比哈希），并在代码注释或 issue 中记录决策理由。

