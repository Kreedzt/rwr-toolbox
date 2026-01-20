# Quickstart：Weapons Directory Scanner（武器目录扫描）

**Feature**: 001-weapons-directory-scanner  
**Branch**: `001-weapons-directory-scanner`

---

## 前置条件

### 1) 游戏目录路径（示例）

`validate_game_path` 支持两种输入：
- **传 media 目录**（内部自动拼接 `packages`）
- **直接传 packages 目录**

示例：
- **macOS（Steam / App Bundle）**：
  - `.../RunningWithRifles.app/Contents/Resources/media`
  - `.../RunningWithRifles.app/Contents/Resources/media/packages`
- **Windows（Steam）**：
  - `...\Running With Rifles\media`
  - `...\Running With Rifles\media\packages`

### 2) 开发环境

- Node.js 20.x
- Rust（Tauri 2.x；建议 Rust 1.75+）
- Angular CLI 20.3.x

---

## 开发启动

```bash
npm run tauri dev
```

会启动：
- Angular dev server：`http://localhost:1420`（以 `angular.json` 配置为准）
- Tauri backend：热重载

---

## 运行流程（MVP）

### 1) 配置游戏路径

1. 进入 Settings 页面
2. 填写游戏路径
3. 点击验证（调用 `validate_game_path`）

### 2) 扫描武器

1. 进入 Data → Local（或数据页的对应入口）
2. 点击“扫描武器”（调用 `scan_weapons`）
3. 扫描完成后展示表格 + 总数 + 错误汇总

---

## 关键实现提示（避免踩坑）

### Rust：XML 解析“没有值”的根因与修复方向

`.weapon` 的关键字段是 **attribute**（例如 `<weapon @key> / <specification @retrigger_time> / <stance @state_key>`）。

如果 `serde` 结构体按 element 写（比如 `#[serde(rename = "key")]`），就会解析出 `None/0/""`。修复应改为 attribute 映射（如 `#[serde(rename = "@key")]`）。

可用 `docs-ai/rwr/ak47.weapon` 作为最小样本验证解析。

### Angular v20：语法与架构强制

- 控制流：`@if/@for`（禁止 `*ngIf/*ngFor`）
- Service 状态：`signal()/computed()`（Signals 单一真源）
- 组件输入/输出：`input()/output()`（禁止 `@Input/@Output`）
- 文案：全部 Transloco key（禁止硬编码）

---

## 手工测试清单

**Last Updated**: 2026-01-15

### US1 - Scan and Display Weapons

- [X] Settings：路径验证正确 + 跨会话持久化 (`settings.service.ts:58-63`)
- [X] Weapons：扫描能找到 `.weapon` 文件并展示关键字段（key/name/classTag/magazineSize/killProbability/retriggerTime）（`weapons.component.html:306-424`）
- [X] Weapons：模板继承合并生效（例如 stance 在模板里时也能出现在结果里）（`weapons.rs:445-542`）
- [X] Errors：坏 XML 不会中断全局扫描，会出现在 errors 列表（`weapons.rs:268-283`）
- [X] Duplicate：重复 key 会出现在 `duplicateKeys`（`weapons.rs:233-248`）
- [X] 800×600：无横向滚动/裁剪（表格区可滚动，次要列可隐藏）（`weapons.component.html:306-424` 使用 `overflow-x-auto`）
- [X] i18n：所有 UI 文案可切换中英文（完整 EN/ZH keys in `en.json:281-352` 和 `zh.json:281-352`）

### US2 - Filter and Search Weapons

- [X] Unified search（key/name/classTag 模糊匹配）（`weapon.service.ts:130-139`）
- [X] ClassTag filter（下拉选择）（`weapons.component.html:11-23`）
- [X] Advanced search panel（可折叠）（`weapons.component.html:34-275`）
- [X] Range filters（damage/fire rate/magazine size/encumbrance/price）（`weapons.component.html:46-231`）
- [X] Exact filters（suppressed/canRespawnWith）（`weapons.component.html:234-268`）
- [X] Filter/search 不触发二次解析（computed signals 缓存）（`weapon.service.ts:97-107`）

### US3 - View Weapon Details

- [X] 点击行打开详情面板/弹窗（`weapons.component.html:329-332`）
- [X] Modal 内部滚动（max-h-[80vh] overflow-y-auto）（`weapons.component.html:429`）
- [X] 显示完整字段（key/name/classTag/magazineSize/killProbability/retriggerTime/projectileSpeed/encumbrance/price）（`weapons.component.html:454-621`）
- [X] 显示 stanceAccuracies 表格（`weapons.component.html:624-660`）
- [X] 显示 chain variants（`weapons.component.html:663-675`）
- [X] 表格行 hover 高亮（hover:bg-base-200）（`weapons.component.html:330`）

### US4 - Refresh and Re-scan

- [X] Refresh 按钮（loading 状态/禁用）（`weapons.component.html:26-31`）
- [X] 防止重复扫描（`weapon.service.ts:54-59`）
- [X] 读取 settings 的 gamePath 并触发 scan（`weapons.component.ts:172-183`）

### Issues Found

1. **Minor**: Hover feedback on table rows was missing → **Fixed** (added `hover:bg-base-200` class)
2. **Minor**: Modal scrolling needed for long content → **Verified** (already implemented with `max-h-[80vh] overflow-y-auto`)

### Resolution Testing

- ✅ 800×600 minimum resolution maintained (table with `overflow-x-auto`)
- ✅ All i18n keys present in EN and ZH files
- ✅ Rust clippy warnings are acceptable (dead_code for unused XML fields)
- ✅ Prettier formatting passes for all weapons files

---

## 下一步

如需生成可执行任务拆分，运行 `/speckit.tasks`（会产出更细的实现步骤与验收点）。 
