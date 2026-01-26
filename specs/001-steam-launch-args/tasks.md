# Tasks: Steam Game Launch With Parameters

**Input**: Design documents from `specs/001-steam-launch-args/`
**Prerequisites**: `specs/001-steam-launch-args/plan.md`, `specs/001-steam-launch-args/spec.md`, `specs/001-steam-launch-args/research.md`, `specs/001-steam-launch-args/data-model.md`, `specs/001-steam-launch-args/contracts/`, `specs/001-steam-launch-args/quickstart.md`

**Tests**: 未在 spec 中要求 TDD；本任务清单不包含自动化测试任务（仅保留手工验收与本地运行）。

**Organization**: 按 User Story 分阶段组织，US1 可作为 MVP 单独交付。

## Format

每条任务严格使用：
`- [ ] T### [P?] [US?] <动作> in <file path>`

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Update outdated design docs to match new spec direction in `specs/001-steam-launch-args/plan.md`
- [x] T002 Update outdated research decisions (remove localconfig.vdf write approach) in `specs/001-steam-launch-args/research.md`
- [x] T003 Update outdated data model (remove Steam LaunchOptions read/detected state) in `specs/001-steam-launch-args/data-model.md`
- [x] T004 Update outdated contract to match “launch + copy args only” in `specs/001-steam-launch-args/contracts/steam-launch-options.openapi.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T005 Add new settings field for skip_nat_server_usage in `src/app/shared/models/common.models.ts`
- [x] T006 Add default value + migration safety for new setting in `src/app/core/services/settings.service.ts`
- [x] T007 [P] Add Steam launch constants (AppID 270150, token list) in `src/app/features/settings/services/steam-launch.constants.ts`
- [x] T008 [P] Create Steam launch service skeleton (signals + public API) in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T009 [P] Add i18n keys scaffold for Steam launch section in `src/assets/i18n/en.json`
- [x] T010 [P] Add i18n keys scaffold for Steam launch section in `src/assets/i18n/zh.json`
- [x] T011 [P] Create Tauri command module for Steam launching in `src-tauri/src/steam_launch.rs`
- [x] T012 Register new Tauri command(s) in `src-tauri/src/lib.rs`
- [x] T013 Verify required capabilities for opener/process/clipboard in `src-tauri/capabilities/default.json`

**Checkpoint**: Settings persistence + i18n + backend command entrypoint ready.

---

## Phase 3: User Story 1 - Launch Game With Optional Parameter (Priority: P1) 🎯 MVP

**Goal**: 勾选参数后点击“启动游戏”，通过 Steam 启动 Running with Rifles（AppID 270150），并尽力携带参数。

**Independent Test**: 在 Settings 页切换勾选状态后点击启动；至少能触发 Steam 启动；若游戏不可用则提示失败（不诊断参数是否实际生效）。

- [x] T014 [US1] Add Steam launch section UI (toggle + launch button) in `src/app/features/settings/settings.component.html`
- [x] T015 [US1] Wire UI handlers and inject SteamLaunchService in `src/app/features/settings/settings.component.ts`
- [x] T016 [US1] Persist toggle state via SettingsService updates in `src/app/core/services/settings.service.ts`
- [x] T017 [US1] Implement args building for current toggle state in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T018 [US1] Implement frontend launch flow (call Tauri command, manage loading) in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T019 [US1] Implement Rust command to launch RWR with args in `src-tauri/src/steam_launch.rs`
- [x] T020 [P] [US1] Implement Rust “game available” check returning a dedicated error when unavailable in `src-tauri/src/steam_launch.rs`
- [x] T021 [P] [US1] Add i18n labels for toggle + launch button in `src/assets/i18n/en.json`
- [x] T022 [P] [US1] Add i18n labels for toggle + launch button in `src/assets/i18n/zh.json`

**Checkpoint**: US1 完成后，Settings 页可一键启动游戏（或给出“游戏不可用/Steam 不可用”的失败提示）。

---

## Phase 4: User Story 2 - Copy Parameter String (Priority: P2)

**Goal**: 一键复制“参数字符串”（只包含 token，不包含启动命令/链接）。

**Independent Test**: 勾选时复制内容包含 `skip_nat_server_usage`；未勾选时复制为空字符串。

- [x] T023 [US2] Add copy button to Steam launch section in `src/app/features/settings/settings.component.html`
- [x] T024 [US2] Implement copy-to-clipboard behavior in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T025 [P] [US2] Add i18n label for copy button in `src/assets/i18n/en.json`
- [x] T026 [P] [US2] Add i18n label for copy button in `src/assets/i18n/zh.json`

**Checkpoint**: US2 完成后，“复制参数字符串”可作为稳定兜底方案。

---

## Phase 5: User Story 3 - Basic Failure Handling (Priority: P3)

**Goal**: Steam 不可用/游戏不可用/无法触发启动时，显示明确失败提示；不诊断“参数是否生效”。

**Independent Test**: 构造 Steam 不可用或游戏不可用场景，点击启动能看到对应错误提示；复制仍可用。

- [x] T027 [US3] Define error codes returned from backend and map to i18n keys in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T028 [US3] Add error display area (non-blocking) in `src/app/features/settings/settings.component.html`
- [x] T029 [P] [US3] Add i18n error messages in `src/assets/i18n/en.json`
- [x] T030 [P] [US3] Add i18n error messages in `src/assets/i18n/zh.json`
- [x] T031 [US3] Ensure launch button disables during launch and clears error on success in `src/app/features/settings/settings.component.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T032 Align quickstart manual QA steps with new behavior (launch + copy, no Steam config edits) in `specs/001-steam-launch-args/quickstart.md`
- [x] T033 [P] Run formatting check and fix issues as needed (`pnpm format:check`, see `package.json`)
- [x] T034 [P] Extend steam launch settings schema (bool params, key=value, custom tokens) in `src/app/shared/models/common.models.ts`
- [x] T035 Update default settings + migrations for new steam launch settings in `src/app/core/services/settings.service.ts`
- [x] T036 Update args builder to support official + custom params in `src/app/features/settings/services/steam-launch.constants.ts`
- [x] T037 Update SteamLaunchService API for new settings shape in `src/app/features/settings/services/steam-launch.service.ts`
- [x] T038 Update Settings Steam Launch UI (bool list + key=value + custom tokens) in `src/app/features/settings/settings.component.html`
- [x] T039 Update Settings component handlers for new Steam Launch UI in `src/app/features/settings/settings.component.ts`
- [x] T040 [P] Update i18n keys for expanded params in `src/assets/i18n/en.json`
- [x] T041 [P] Update i18n keys for expanded params in `src/assets/i18n/zh.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3)
- US2 (Phase 4) depends on Foundational (Phase 2) and can start after US1 UI skeleton exists
- US3 (Phase 5) depends on US1 backend call path and can be implemented alongside US2

### User Story Dependencies

- US1 (P1) is MVP and can ship alone.
- US2 (P2) uses the same “参数字符串生成”逻辑，建议在 US1 之后接入。
- US3 (P3) 与 US1/US2 共享错误与状态展示，适合最后收口。

### Parallel Opportunities

- Phase 2: T007–T013 多数可并行（不同文件），但 T012 依赖 T011。
- US1: i18n（T021/T022）可与后端实现（T019/T020）并行。
- US2/US3: i18n（T025/T026/T029/T030）可并行。

---

## Parallel Example: US1

同时推进（互不阻塞的文件）：

- Task: `T019 [US1]` Implement Rust launch command in `src-tauri/src/steam_launch.rs`
- Task: `T021 [US1]` Add en i18n labels in `src/assets/i18n/en.json`
- Task: `T022 [US1]` Add zh i18n labels in `src/assets/i18n/zh.json`
- Task: `T014 [US1]` Add Settings UI section in `src/app/features/settings/settings.component.html`

---

## Implementation Strategy

### MVP First (US1 Only)

1. 完成 Phase 1–2（持久化 + i18n + 后端入口）
2. 完成 US1（能启动/能失败提示）
3. 立即按 `specs/001-steam-launch-args/spec.md` 的 US1 验收场景手工验证

### Incremental Delivery

- 加上 US2（复制参数字符串）作为稳定兜底
- 最后完善 US3（失败提示与状态展示的一致性）
