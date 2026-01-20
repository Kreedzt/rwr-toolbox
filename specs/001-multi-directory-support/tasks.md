# Implementation Tasks: Multi-Directory Scan Support

**Feature**: 001-multi-directory-support
**Branch**: `001-multi-directory-support`
**Status**: Draft
**Last Updated**: 2026-01-15

---

## Summary

Total Tasks: 31
- Phase 1 (Setup): 2 tasks ✅ Complete
- Phase 2 (Foundational): 5 tasks ✅ Complete
- Phase 3 (US1 - 多目录管理 P1): 17 tasks ✅ Complete
- Phase 4 (US2 - 目录验证 P2): 2 tasks ✅ Complete
- Phase 5 (US3 - 导航菜单优化 P3): 2 tasks ✅ Complete
- Phase 6 (Polish): 3 tasks ✅ Complete

---

## Phase 1: Setup

**Goal**: Initialize feature branch and prepare development environment

### Setup Tasks

- [x] T001 Create and checkout feature branch `001-multi-directory-support`
- [x] T002 Run `pnpm install` and `cd src-tauri && cargo check` to verify build environment

---

## Phase 2: Foundational

**Goal**: Implement shared entities and backend validation that all user stories depend on

**Independent Test Criteria**: N/A (Foundational phase provides base for user stories)

### Backend - Rust

- [x] T003 [P] Create `src-tauri/src/directories.rs` with `ValidationResult`, `DirectoryErrorCode`, and `ValidationDetails` structs
- [x] T004 Implement `validate_directory` Tauri command in `src-tauri/src/directories.rs` with filesystem checks (exists, is_dir, readable, media subfolder)
- [x] T005 Add `mod directories;` and register `validate_directory` command in `src-tauri/src/lib.rs` invoke_handler

### Frontend - Models

- [x] T006 [P] Create `src/app/shared/models/directory.models.ts` with `ScanDirectory`, `DirectoryStatus`, `ValidationResult`, and `ScanProgress` interfaces
- [x] T007 [P] Add `scanDirectories: ScanDirectory[]` field to `AppSettings` interface in `src/app/shared/models/common.models.ts`

---

## Phase 3: User Story 1 - 多目录管理 (P1)

**Goal**: Users can add, view, and remove multiple game/workshop directories from settings page and see merged results

**Independent Test Criteria**:
1. Add directory with valid `media` subdirectory -> appears in list
2. Remove directory -> disappears from list
3. Data page shows merged items from all valid directories
4. Data page shows empty state when no directories are configured

### Backend - Modify Scan Commands

- [x] T008 [US1] Modify `scan_weapons` in `src-tauri/src/weapons.rs` to accept `directory: Option<String>` and use it if provided
- [x] T009 [US1] Modify `scan_items` in `src-tauri/src/items.rs` to accept `directory: Option<String>` and use it if provided

### Frontend - Extended Models

- [x] T010 [P] [US1] Add `sourceDirectory: string` field to `Weapon` interface in `src/app/shared/models/weapons.models.ts` (Internal use only)
- [x] T011 [P] [US1] Add `sourceDirectory: string` field to `Item` interface in `src/app/shared/models/items.models.ts` (Internal use only)

### Frontend - Services

- [x] T012 [US1] Implement `DirectoryService` state signals (directories, validating, scanProgress) in `src/app/features/settings/services/directory.service.ts`
- [x] T013 [US1] Implement `addDirectory`, `removeDirectory`, and `validateDirectory` methods in `DirectoryService`
- [x] T014 [US1] Implement `scanAllDirectories` orchestration loop in `DirectoryService` using `WeaponService` and `ItemService`
- [x] T015 [US1] Extend `SettingsService` in `src/app/core/services/settings.service.ts` to persist `scanDirectories` to Tauri Store
- [x] T016 [US1] Update `WeaponService` in `src/app/features/data/weapons/services/weapon.service.ts` to call modified `scan_weapons` command
- [x] T017 [US1] Update `ItemService` in `src/app/features/data/items/services/item.service.ts` to call modified `scan_items` command

### Frontend - UI

- [x] T018 [US1] Add directory list management section to `src/app/features/settings/settings.component.html`
- [x] T019 [US1] Implement `onAddDirectory` and `onRemoveDirectory` logic in `src/app/features/settings/settings.component.ts`
- [x] T020 [US1] Add empty state display logic to `src/app/features/data/local/local.component.html` when no directories are set
- [x] T021 [US1] Ensure Weapons table in `src/app/features/data/weapons/weapons.component.html` renders merged results from all sources correctly
- [x] T022 [US1] Ensure Items table in `src/app/features/data/items/items.component.html` renders merged results from all sources correctly

### Frontend - Internationalization

- [x] T023 [P] [US1] Add directory management translations to `src/assets/i18n/en.json`
- [x] T024 [P] [US1] Add directory management translations to `src/assets/i18n/zh.json`

---

## Phase 4: User Story 2 - 目录验证 (P2)

**Goal**: Directory validation with clear error messages and convenient access

**Independent Test Criteria**:
1. Add non-existent path -> show "路径不存在"
2. Add directory without media -> show "缺少 media 子目录"
3. Press Ctrl+D -> opens directory selection dialog

### Frontend - Enhanced Validation & UX

- [x] T025 [US2] Enhance `SettingsComponent` UI to display specific validation error messages from `ValidationResult`
- [x] T026 [US2] Add global keyboard shortcut `Ctrl+D` to `src/app/app.component.ts` to trigger directory addition dialog

---

## Phase 5: User Story 3 - 导航菜单优化 (P3)

**Goal**: Restore original menu items while maintaining the consolidated "Data" entry point

**Independent Test Criteria**:
1. Sidebar shows: Dashboard, Servers, Players, Data, Mods, Hotkeys, Settings, About
2. All restored menu items navigate to their respective functional pages

### Frontend - Navigation Restoration

- [x] T027 [US3] Restore `Dashboard`, `Servers`, and `Players` menu items in `src/app/shared/constants/menu-items.ts`
- [x] T028 [US3] Update route definitions in `src/app/app.routes.ts` to ensure consistency between sidebar and routing

---

## Phase 6: Polish & Verification

**Goal**: Migration handling and final quality checks

### Performance & Migration

- [x] T029 Implement migration logic in `DirectoryService.initialize()` to move existing `gamePath` to `scanDirectories` on first load
- [x] T030 [P] Add CSS truncation for long directory paths in `src/app/features/settings/settings.component.css`
- [x] T031 Final verification: run `pnpm build`, `cargo clippy`, and manual tests across all user stories

---

## Dependencies

### Story Completion Order

```
Phase 2 (Foundational)
    ↓
Phase 3 (US1 - 多目录管理)
    ↓
Phase 4 (US2 - 目录验证) & Phase 5 (US3 - 导航菜单优化)
    ↓
Phase 6 (Polish)
```

**Notes**:
- US2 and US3 are independent and can be implemented in any order once US1 is functional.
- Phase 6 depends on all previous phases.

### Parallel Execution Opportunities

**Phase 2 - Foundational Tasks**:
- T003, T006, T007 can run in parallel (different files/layers).

**Phase 3 - US1 Tasks**:
- T010, T011 (Models extension).
- T023, T024 (Translations).

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
- **Phase 1, 2, and 3**: Core multi-directory management and scanning.
- Result: User can add workshop/game directories and browse combined weapon/item data.

### Incremental Delivery Plan
1. **Sprint 1**: Backend validation and multi-directory models.
2. **Sprint 2**: Directory management service and Settings UI.
3. **Sprint 3**: Data page integration (merged view).
4. **Sprint 4**: UX enhancements (shortcuts, navigation restoration, migration).
5. **Sprint 5**: Polish and final verification.

---

## Format Validation
- [x] Checkbox: `- [ ]`
- [x] Task ID: `T001-T031`
- [x] [P] marker: Applied where applicable
- [x] [Story] label: Applied to User Story phases
- [x] Description: Contains file paths
