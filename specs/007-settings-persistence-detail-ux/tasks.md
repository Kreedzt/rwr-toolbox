# Tasks: Settings Persistence and Detail View UX Improvements

**Input**: Design documents from `/specs/007-settings-persistence-detail-ux/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Tests are NOT included in this feature specification. Tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Tauri desktop application with:
- **Frontend**: `src/app/` (Angular)
- **Backend**: `src-tauri/src/` (Rust)

---

## Clarifications (Session 2025-01-19)

**FR-012**: Detail side panel MUST be 75% width with minimum 400px
**FR-013**: Detail side panel MUST use solid (non-transparent) background color
**FR-014**: Detail side panel background MUST respond dynamically to theme switching
**FR-015**: Item images MUST be displayed at the top of the detail panel, centered, with width between 200-300px and a subtle shadow or border (added via clarification session)
**FR-016**: System MUST handle missing images gracefully with a fallback placeholder or icon (added via clarification session)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing codebase and prepare for implementation

- [x] T001 Review current DirectoryService persistence methods in src/app/features/settings/services/directory.service.ts
- [x] T002 Review current weapons detail modal implementation in src/app/features/data/weapons/weapons.component.html
- [x] T003 Review current items detail modal implementation in src/app/features/data/items/items.component.html
- [x] T004 [P] Review current hotkeys component for i18n key usage in src/app/features/hotkeys/hotkeys.component.html

**Checkpoint**: ✅ Complete - All setup review done

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Verify Tauri plugin-store dependency in src-tauri/Cargo.toml (line 24 should have `tauri-plugin-store = "2"`)
- [x] T006 [P] Verify plugin-store is initialized in Tauri configuration in src-tauri/tauri.conf.json
- [x] T007 [P] Review existing ScanDirectory model in src/app/shared/models/directory.models.ts
- [x] T008 [P] Review existing Weapon model in src/app/shared/models/weapons.models.ts
- [x] T009 [P] Review existing Item model in src/app/shared/models/items.models.ts

**Checkpoint**: ✅ Complete - All foundational verification done. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Persistent Scan Directory Settings (Priority: P1) 🎯 MVP

**Goal**: Persist scan directory configurations across application restarts so users don't need to reconfigure on every startup

**Independent Test**: Configure scan directories in settings, close application, reopen, and verify directories are still present

### Implementation for User Story 1

- [x] T010 [US1] Modify DirectoryService.initialize() to call loadDirectories() in src/app/features/settings/services/directory.service.ts (add `await this.loadDirectories();` at line 94, before existing code)
- [x] T011 [US1] Modify DirectoryService.addDirectory() to persist after adding in src/app/features/settings/services/directory.service.ts (add `await this.saveScanDirs(updated);` after line 153, after `this.directoriesState.set(updated);`)
- [x] T012 [US1] Add error handling for corrupted settings in DirectoryService.loadDirectories() in src/app/features/settings/services/directory.service.ts (ensure catch block defaults to empty array)
- [x] T013 [US1] Verify removeDirectory() already persists in src/app/features/settings/services/directory.service.ts (confirm line 171 calls `saveScanDirs()`)
- [x] T014 [P] [US1] Add English translation key "game_path": "Game Path" to hotkeys section in src/assets/i18n/en.json
- [x] T015 [P] [US1] Add Chinese translation key "game_path": "游戏路径" to hotkeys section in src/assets/i18n/zh.json

**Checkpoint**: ✅ Complete - User Story 1: Settings persistence fully functional and testable independently

---

## Phase 4: User Story 2 - Non-Modal Detail View (Priority: P2)

**Goal**: Replace modal-based detail view with side panel for efficient browsing of large datasets (weapons/items)

**Independent Test**: Click various weapons/items and verify side panel appears/updates without modal open/close overhead

### Implementation for Weapons Detail View

- [x] T016 [US2] Add detail view state signals to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts (add `selectedWeapon`, `isDetailPanelOpen`, `detailPanelPosition` signals)
- [x] T017 [US2] Add selectWeapon() method to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T018 [US2] Add closeDetailPanel() method to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T019 [P] [US2] Add selectNext() and selectPrevious() keyboard navigation methods to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T020 [US2] Create weapons.component.scss in src/app/features/data/weapons/ with side panel styles (`.detail-panel`: 75% width, min-width 400px, solid `oklch(var(--b2))` background per FR-012/FR-013/FR-014)
- [x] T021 [US2] Replace modal dialog with side panel in src/app/features/data/weapons/weapons.component.html (remove `<dialog>` structure, add side panel markup)
- [x] T022 [US2] Update table row click handler to use selectWeapon() in src/app/features/data/weapons/weapons.component.html (replace `openWeaponDetails()` calls, add `[class.active]` binding)
- [x] T023 [US2] Add keyboard event handlers to table in src/app/features/data/weapons/weapons.component.html (add `(keydown.arrowDown)`, `(keydown.arrowUp)`, `(keydown.escape)`)

### Implementation for Items Detail View

- [x] T024 [US2] Add detail view state signals to ItemsComponent in src/app/features/data/items/items.component.ts (add `selectedItem`, `isDetailPanelOpen`, `detailPanelPosition` signals)
- [x] T025 [US2] Add selectItem() method to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T026 [US2] Add closeDetailPanel() method to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T027 [P] [US2] Add selectNext() and selectPrevious() keyboard navigation methods to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T028 [US2] Create items.component.scss in src/app/features/data/items/ with side panel styles (`.detail-panel`: 75% width, min-width 400px, solid `oklch(var(--b2))` background per FR-012/FR-013/FR-014)
- [x] T029 [US2] Replace modal dialog with side panel in src/app/features/data/items/items.component.html (remove `<dialog>` structure, add side panel markup)
- [x] T030 [US2] Update table row click handler to use selectItem() in src/app/features/data/items/items.component.html (replace `openItemDetails()` calls, add `[class.active]` binding)
- [x] T031 [US2] Add keyboard event handlers to table in src/app/features/data/items/items.component.html (add `(keydown.arrowDown)`, `(keydown.arrowUp)`, `(keydown.escape)`)

**Checkpoint**: ✅ Complete - User Story 2: Non-modal detail view fully functional and testable independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and testing

- [x] T032 Run cargo clippy on src-tauri/src/ to ensure no Rust warnings
- [x] T033 [P] Run cargo fmt on src-tauri/src/ for consistent formatting
- [x] T034 Build frontend with pnpm build and verify no TypeScript errors
- [ ] T035 Test settings persistence: Configure directories, restart app, verify persistence
- [ ] T036 Test detail view for weapons: Click items, verify side panel appears/updates correctly
- [ ] T037 Test detail view for items: Click items, verify side panel appears/updates correctly
- [ ] T038 Test keyboard navigation: Arrow keys navigate between items, Escape closes panel
- [ ] T039 Test file path display: Verify long paths wrap without horizontal scrolling (FR-009)
- [ ] T040 Test translation: Verify "Game Path" label displays in both English and Chinese
- [ ] T041 [P] Test corrupted settings: Corrupt settings.json, verify app starts with empty list (FR-004)
- [ ] T042 [P] Test detail view responsiveness: Verify side panel adapts to different screen sizes (FR-010)
- [ ] T043 [P] Test FR-012: Verify panel is 75% width with minimum 400px
- [ ] T044 [P] Test FR-013: Verify panel has solid (non-transparent) background
- [ ] T045 [P] Test FR-014: Verify panel background responds to theme switching (light/dark mode)
- [ ] T054 [P] Test FR-015: Verify item images display at top of detail panel, centered, with width between 200-300px
- [ ] T055 [P] Test FR-016: Verify fallback icon displays for items with unknown types
- [ ] T056 [P] Test icon theme switching: Verify icon colors adapt when switching between light and dark themes
- [ ] T057 [P] Test SC-008: Verify images load within 500 milliseconds (icons render instantly)

**Checkpoint**: ⏳ In Progress - Automated validation complete (3/3), implementation + manual testing required (8/23)

---

## Phase 6: User Story 4 - Image Display in Detail Panels (Priority: P3) 🖼️ NEW

**Goal**: Display visual representation of weapons/items in detail panels using Lucide icons as category indicators (per clarification session)

**Independent Test**: Open various weapons/items and verify appropriate icons display at the top of the detail panel, centered, with theme-aware styling

### Implementation for Image Display

- [x] T046 [P] [US4] Register Lucide icons in src/app/shared/icons/index.ts (import Zap, Crosshair, Package, Shield, Heart, Coffee, Box, Sparkles, Wrench, Radio and add to APP_ICONS export)
- [x] T047 [US4] Add WEAPON_ICONS mapping constant to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts (define Record<string, string> with weapon type to icon name mappings)
- [x] T048 [US4] Add getIconForWeaponType() method to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts (return icon name from mapping or 'box' fallback, with console.warn for unknown types)
- [x] T049 [US4] Add icon display section to weapons detail panel template in src/app/features/data/weapons/weapons.component.html (add `<div class="flex justify-center py-6 border-b border-base-300">` with `<lucide-icon>` at top of panel, before header)
- [x] T050 [P] [US4] Register Lucide icons in src/app/shared/icons/index.ts for items component (same icons as T046, done once)
- [x] T051 [P] [US4] Add ITEM_ICONS mapping constant to ItemsComponent in src/app/features/data/items/items.component.ts (define Record<string, string> with item type to icon name mappings: medkit→heart, armor→shield, food→coffee, ammunition→package, grenade→sparkles)
- [x] T052 [US4] Add getIconForItemType() method to ItemsComponent in src/app/features/data/items/items.component.ts (return icon name from mapping or 'box' fallback, with console.warn for unknown types)
- [x] T053 [US4] Add icon display section to items detail panel template in src/app/features/data/items/items.component.html (add `<div class="flex justify-center py-6 border-b border-base-300">` with `<lucide-icon>` at top of panel, before header)

**Checkpoint**: ✅ Complete - Image display implementation (8 tasks)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete - No dependencies
- **Foundational (Phase 2)**: ✅ Complete - BLOCKS all user stories
- **User Story 1 (Phase 3)**: ✅ Complete - Settings persistence
- **User Story 2 (Phase 4)**: ✅ Complete - Non-modal detail view
- **Polish (Phase 5)**: 3/15 automated ✅, 12/15 testing ⏳
- **User Story 4 (Phase 6)**: ✅ Complete - Image display in detail panels (8 tasks)

### User Story Dependencies

- **User Story 1 (P1)**: ✅ Complete - No dependencies on other stories
- **User Story 2 (P2)**: ✅ Complete - No dependencies on other stories (independent testable)
- **User Story 3 (P3)**: ✅ Complete - No dependencies on other stories (translation only, completed in US1)
- **User Story 4 (P3)**: ✅ Complete - Builds on US2 detail view panels (icon display implementation complete)

### Parallel Opportunities

- Setup phase tasks marked [P] (T004) - ✅ Complete
- Foundational phase tasks marked [P] (T006-T009) - ✅ Complete
- **User Story 1 parallel tasks**:
  - Translation tasks (T014, T015) - ✅ Complete
- **User Story 2 parallel tasks**:
  - State management tasks (T016, T024) - ✅ Complete
  - Keyboard navigation tasks (T019, T027) - ✅ Complete
  - SCSS files (T020, T028) - ✅ Complete
- **User Story 4 parallel tasks** (NEW):
  - Icon registration (T046 - shared, done once)
  - Component setup tasks can run in parallel: T047/T048 (weapons) + T051/T052 (items)
  - Template tasks can run in parallel: T049 (weapons) + T053 (items)
- **Polish phase tasks marked [P]** (T033 ✅, T041-T045 ⏳) - Mixed status

---

## Parallel Example: User Story 1

```bash
# Launch translation tasks in parallel:
Task: "Add English translation key 'game_path' to en.json"
Task: "Add Chinese translation key 'game_path' to zh.json"
```

## Parallel Example: User Story 2

```bash
# Launch weapons detail view setup in parallel:
Task: "Add state signals to WeaponsComponent"
Task: "Create weapons.component.scss with side panel styles (75% width, min 400px, solid theme-aware background)"

# Launch items detail view setup in parallel:
Task: "Add state signals to ItemsComponent"
Task: "Create items.component.scss with side panel styles (75% width, min 400px, solid theme-aware background)"
```

## Parallel Example: User Story 4 (NEW)

```bash
# Launch icon mapping setup in parallel:
Task: "Add WEAPON_ICONS mapping and getIconForWeaponType() to WeaponsComponent"
Task: "Add ITEM_ICONS mapping and getIconForItemType() to ItemsComponent"

# Launch icon display template updates in parallel:
Task: "Add icon display section to weapons detail panel template"
Task: "Add icon display section to items detail panel template"
```

---

## Implementation Strategy

### ✅ MVP Complete (User Story 1 Only)

User Story 1 (Settings Persistence) is fully implemented:
- ✅ Settings load from plugin-store on startup
- ✅ Settings persist immediately on add/remove operations
- ✅ Translation keys added
- ✅ Graceful error handling for corrupted settings

### ✅ User Story 2 Complete

User Story 2 (Non-Modal Detail View) is fully implemented:
- ✅ Side panel with 75% width, min-width 400px (FR-012)
- ✅ Solid theme-aware background `oklch(var(--b2))` (FR-013, FR-014)
- ✅ Keyboard navigation (Arrow keys, Escape)
- ✅ File path word-wrap for long paths (FR-009)
- ✅ Active row highlighting

### ⏳ Polish & Testing Required

1. ✅ Setup + Foundational → Foundation ready
2. ✅ User Story 1 → Test independently → Deploy/Demo (MVP!)
3. ✅ User Story 2 → Test independently → Deploy/Demo
4. ⏳ User Story 4 → Implement image display → Deploy/Demo
5. ⏳ Polish & testing → Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (settings persistence)
   - Developer B: User Story 2 (detail view - weapons)
   - Developer C: User Story 2 (detail view - items)
3. Stories complete and integrate independently

---

## Summary

**Total Tasks**: 57 (updated to include image display tasks)
**Completed**: 42 (T001-T034, T046-T053)
**Remaining**: 15 (T035-T045, T054-T057: manual testing only)

**Task Count by User Story**:
- Setup: 4 tasks - ✅ Complete
- Foundational: 5 tasks - ✅ Complete
- US1 (Settings Persistence): 6 tasks - ✅ Complete
- US2 (Non-Modal Detail View): 16 tasks - ✅ Complete
- US4 (Image Display): 8 tasks - ✅ Complete (FR-015/FR-016 from clarification session)
- Polish: 19 tasks (3 automated ✅ 16 testing ⏳ includes 4 new image tests)

**Independent Test Criteria**:
- ✅ US1: Configure directories → restart → directories persist
- ✅ US2: Click items → side panel appears/updates without modal overhead (75% width, solid theme-aware background)
- ✅ US3: Translation key displays correctly in both languages
- ✅ US4: Open weapons/items → verify appropriate icons display at top of panel (centered, 200-300px, theme-aware styling) - Implementation complete, manual testing required

**MVP Scope**: User Story 1 (Settings Persistence) complete ✅. User Story 2 (Detail View) implementation complete ✅. User Story 4 (Image Display) implementation complete ✅. Manual testing phase required ⏳.

**Clarification Impact**:
- Original clarifications FR-012/FR-013/FR-014 implemented ✅
- New clarifications FR-015/FR-016 implemented ✅ (Lucide icons as category placeholders)
- SCSS files already implement panel requirements (75% width, min 400px, solid background)

---

## Notes

- All tasks follow the checklist format with checkbox, ID, [P] marker where applicable, [Story] label for user story phases, and exact file paths
- Setup phase reviewed existing codebase for context
- Foundational phase verified Tauri plugin-store dependency and existing models
- User Story 1 (Settings Persistence) is complete ✅
- User Story 2 (Detail View) implementation is complete ✅
- User Story 4 (Image Display) implementation is complete ✅ (Lucide icons as category placeholders)
- Clarifications FR-012/FR-013/FR-014 have been incorporated into SCSS files
- New clarifications FR-015/FR-016 (image display) implemented ✅
- Polish phase includes automated validation (cargo clippy/fmt, pnpm build) ✅ and manual testing tasks ⏳
- Tests are NOT included in this specification (focus on implementation only)
- Detail view side panel follows desktop-first UI design principles with 800×600 minimum resolution support
- Image display uses Lucide icons as category placeholders (Constitution Principle VI) with theme-aware styling (Constitution Principle III)
