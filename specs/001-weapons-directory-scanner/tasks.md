# Tasks: Weapons Directory Scanner（武器目录扫描）

**Input**: `specs/001-weapons-directory-scanner/` 下的 plan/spec/research/data-model/contracts/quickstart  
**Tests**: spec 未要求 TDD/自动化测试；本清单以实现任务 + 手工验收为主（必要时可后续补测）。

## Checklist Format（强制）

每条任务必须严格遵循：

`- [ ] T### [P?] [US#?] 描述（必须包含文件路径）`

- `[P]`：可并行（不同文件/无前置依赖）
- `[US#]`：仅用于用户故事相关 phase（US1~US4）

## Path Conventions（本仓库真实路径）

- Rust：`src-tauri/src/`
- Angular：`src/app/`
- i18n：`src/assets/i18n/en.json`、`src/assets/i18n/zh.json`
- Feature docs：`specs/001-weapons-directory-scanner/*`

---

## Phase 1: Setup（共享基础）

**Purpose**：确认依赖与命令注册点完备（不引入新技术栈）。

- [X] T001 核对 Rust 依赖已存在并版本合理：`src-tauri/Cargo.toml`（quick-xml/walkdir/anyhow/serde/serde_json）
- [X] T002 核对 Tauri command 已注册：`src-tauri/src/lib.rs`（`weapons::validate_game_path`、`weapons::scan_weapons`）

---

## Phase 2: Foundational（全故事共享的阻塞项）

**Purpose**：统一模型与 i18n/setting 口径，避免后续故事反复返工。

- [X] T003 对齐武器数据模型字段与命名（camelCase）：`src/app/shared/models/weapons.models.ts`
- [X] T004 [P] 补齐/核对 i18n keys（weapons/settings）：`src/assets/i18n/en.json`
- [X] T005 [P] 补齐/核对 i18n keys（weapons/settings）：`src/assets/i18n/zh.json`
- [X] T006 核对游戏路径持久化读写口径（Tauri Store 优先）：`src/app/core/services/settings.service.ts`

**Checkpoint**：Foundation ready（US1~US4 可开始）

---

## Phase 3: User Story 1 - Scan and Display Weapons（P1）🎯 MVP

**Goal**：用户配置游戏路径后能扫描并在表格看到关键字段。
**Independent Test**：按 `specs/001-weapons-directory-scanner/spec.md` 的 US1 验收场景验证。

### Backend（Rust / XML 解析与修复"解析无值"）

- [X] T007 [US1] 修复 `.weapon` 的 attribute 反序列化映射（`@key/@file/...`）：`src-tauri/src/weapons.rs`
- [X] T008 [US1] 将 stance 解析改为 `<stance @state_key @accuracy>`（替换当前 `RawStanceAccuracy` 结构）：`src-tauri/src/weapons.rs`
- [X] T009 [US1] 调整模板合并逻辑以合并 `stances`（child 覆盖同 `state_key` 的 parent）：`src-tauri/src/weapons.rs`
- [X] T010 [US1] 修正 `classTag` 推导优先级：tag name（第一个非空）→ 其它 fallback：`src-tauri/src/weapons.rs`
- [X] T011 [US1] 修正 `name` 推导优先级：`specification.@name` → root fallback：`src-tauri/src/weapons.rs`
- [X] T012 [US1] 修正 `killProbability` 的来源：`projectile/result.@kill_probability`：`src-tauri/src/weapons.rs`
- [ ] T013 [US1] 用 `docs-ai/rwr/*.weapon` 做最小人工验证（解析后字段不再全为 0/空）：`docs-ai/rwr/ak47.weapon`

### Frontend（扫描入口 + 表格展示）

- [X] T014 [US1] 确保 settings 页面能配置并验证游戏路径：`src/app/features/settings/settings.component.ts`
- [X] T015 [US1] 确保 settings 页面 UI 与 i18n 正确：`src/app/features/settings/settings.component.html`
- [X] T016 [US1] 确保 Local/Data 页面能触发扫描并展示结果表格：`src/app/features/data/local/local.component.ts`
- [X] T017 [US1] 确保 Local/Data 页面模板有"扫描武器/结果摘要/错误展示"并 i18n：`src/app/features/data/local/local.component.html`
- [X] T018 [US1] 确保 `WeaponService` 调用 `scan_weapons` 并写入 signals（weapons/loading/error）：`src/app/features/data/weapons/services/weapon.service.ts`
- [X] T019 [US1] 确保武器表格列定义为最小集（6 列）并兼容 800×600：`src/app/features/data/weapons/weapon-columns.ts`
- [X] T020 [US1] 确保武器表格渲染使用 `@if/@for` 且无硬编码文本：`src/app/features/data/weapons/weapons.component.html`
- [X] T021 [US1] 确保表格渲染读取 service 的 readonly signals（无 subscribe）：`src/app/features/data/weapons/weapons.component.ts`

**Checkpoint**：US1 完成（路径配置 → 扫描 → 表格展示关键字段 + 总数 + 错误汇总）

---

## Phase 4: User Story 2 - Filter and Search Weapons（P2）

**Goal**：统一搜索 + class 过滤 + 高级筛选面板。
**Independent Test**：按 `specs/001-weapons-directory-scanner/spec.md` 的 US2 验收场景验证。

- [X] T022 [US2] 实现 unified search（key/name/classTag 模糊匹配）并走 computed：`src/app/features/data/weapons/services/weapon.service.ts`
- [X] T023 [US2] 增加 classTag filter（下拉/按钮）并接入 service：`src/app/features/data/weapons/weapons.component.ts`
- [X] T024 [US2] 在模板增加搜索框 + class filter UI（i18n + 800×600）：`src/app/features/data/weapons/weapons.component.html`
- [X] T025 [US2] 实现 AdvancedFilters 类型与 signal：`src/app/features/data/weapons/services/weapon.service.ts`
- [X] T026 [US2] 实现 range/exact filters 匹配逻辑（AND 组合）：`src/app/features/data/weapons/services/weapon.service.ts`
- [X] T027 [P] [US2] 增加高级筛选面板组件（input()/output()）：`src/app/features/data/weapons/weapons.component.ts`
- [X] T028 [P] [US2] 高级筛选面板模板（collapse + max-h + overflow-y-auto）：`src/app/features/data/weapons/weapons.component.html`
- [X] T029 [US2] 在 weapons 页面接入可折叠 Advanced Search（show/hide）：`src/app/features/data/weapons/weapons.component.html`
- [X] T030 [P] [US2] 补齐 filters 相关 i18n keys：`src/assets/i18n/en.json`
- [X] T031 [P] [US2] 补齐 filters 相关 i18n keys：`src/assets/i18n/zh.json`

**Checkpoint**：US2 完成（搜索/过滤/高级筛选均可用，且 filter/search 不触发二次解析）

---

## Phase 5: User Story 3 - View Weapon Details（P3）

**Goal**：点击行打开详情面板/弹窗，展示完整字段与姿态命中率，并能看到 chain variants。
**Independent Test**：按 `specs/001-weapons-directory-scanner/spec.md` 的 US3 验收场景验证。

- [X] T032 [US3] 在前端实现"选中 weapon"与详情 UI 状态：`src/app/features/data/weapons/weapons.component.ts`
- [X] T033 [US3] 实现详情面板/弹窗（800×600 内容区滚动）：`src/app/features/data/weapons/weapons.component.html`
- [X] T034 [US3] 在详情中渲染 stanceAccuracies 表格与其它字段：`src/app/features/data/weapons/weapons.component.html`
- [X] T035 [P] [US3] 补齐 details 相关 i18n keys：`src/assets/i18n/en.json`
- [X] T036 [P] [US3] 补齐 details 相关 i18n keys：`src/assets/i18n/zh.json`

> 备注：若现有 `scan_weapons` 已返回足够字段，则不新增 `get_weapon_details`；只有当 payload 过大或字段缺失时再扩展后端命令。

**Checkpoint**：US3 完成（点击一行能看到完整详情 + chain variants）

---

## Phase 6: User Story 4 - Refresh and Re-scan（P4）

**Goal**：扫描后可手动刷新，避免重复扫描并给出状态反馈。
**Independent Test**：按 `specs/001-weapons-directory-scanner/spec.md` 的 US4 验收场景验证。

- [X] T037 [US4] 增加 refresh 按钮（loading 状态/禁用）：`src/app/features/data/weapons/weapons.component.html`
- [X] T038 [US4] 在 service 增加"扫描中"保护，防止重复 invoke：`src/app/features/data/weapons/services/weapon.service.ts`
- [X] T039 [US4] 在 component 实现 onRefresh（读取 settings 的 gamePath 并触发 scan）：`src/app/features/data/weapons/weapons.component.ts`
- [X] T040 [P] [US4] 补齐 refresh/scan 状态相关 i18n keys：`src/assets/i18n/en.json`
- [X] T041 [P] [US4] 补齐 refresh/scan 状态相关 i18n keys：`src/assets/i18n/zh.json`

**Checkpoint**：US4 完成（刷新可用、不会重复扫描、状态清晰）

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**：跨故事的收尾、质量与文档闭环。

- [X] T042 [P] 运行并修复 Rust clippy/格式问题：`src-tauri/src/weapons.rs`
- [X] T043 [P] 运行并修复前端 lint/格式问题：`src/app/features/data/weapons/`
- [X] T044 800×600 下走完整验收流程并记录问题：`specs/001-weapons-directory-scanner/quickstart.md`
- [X] T045 [P] 核对所有新增 i18n key 均有中英文：`src/assets/i18n/en.json`
- [X] T046 [P] 核对所有新增 i18n key 均有中英文：`src/assets/i18n/zh.json`
- [X] T047 更新 `docs-ai/PROGRESS.md`（按模板追加本次改动记录）：`docs-ai/PROGRESS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → Phase 2 → US1（MVP）
- US2/US3/US4 均依赖 US1 的扫描数据流（但可以在 US1 接近完成时并行推进 UI 部分）
- Polish 最后执行

### Parallel Opportunities（示例）

- `[P]` 标记任务可并行：i18n（en/zh）成对并行、filters/detail 的 en/zh 并行
- US1 中 Rust 修复（`src-tauri/src/weapons.rs`）与前端 UI 连接（`src/app/features/data/...`）可并行

---

## Parallel Example（US1）

```text
- [ ] T007 [US1] ... src-tauri/src/weapons.rs
- [ ] T016 [US1] ... src/app/features/data/local/local.component.ts
```

---

## Task Summary

| Phase | Tasks | Story |
|---|---:|---|
| Phase 1 | 2 | - |
| Phase 2 | 4 | - |
| US1 | 15 | US1 |
| US2 | 10 | US2 |
| US3 | 5 | US3 |
| US4 | 5 | US4 |
| Polish | 6 | - |
| **Total** | **47** | **4 stories** |

### MVP Scope（建议）

仅做 **Phase 1 + Phase 2 + US1**（共 21 个任务），先把“解析无值”修好并能完整走通扫描→展示闭环。 
