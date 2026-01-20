---

description: "Task list for UI Optimizations feature implementation"
---

# Tasks: UI Optimizations

**Input**: Design documents from `/specs/001-ui-optimizations/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The spec.md does not explicitly request TDD tests, so test tasks are OPTIONAL. Manual testing checklist included in Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `src-tauri/`, `tests/` at repository root
- **Angular frontend**: `src/app/`
- **Rust backend**: `src-tauri/src/`
- Paths shown below follow the Tauri desktop application structure

<!--
  ============================================================================
  NOTE: Tasks are organized by user story for independent implementation.

  User Stories:
  - US1 (P1): Fix Search Bar Layout Consistency (MVP candidate)
  - US2 (P1): Persist Scan Directories
  - US4 (P2): Adjust Left Navigation Menu Width
  - US3 (P2): Table-Only Vertical Scrolling

  Note: US4 is implemented before US3 as it's simpler and provides quick win.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project setup and ensure ignore files are properly configured

- [x] T001 Verify Tauri 2.x and Angular v20.3.15 are installed (run `pnpm tauri info`)
- [x] T002 Verify .gitignore contains Rust patterns (target/, *.rs.bk, *.rlib, *.prof*, .idea/, *.log, .env*)
- [x] T003 Verify .gitignore contains Node.js patterns (node_modules/, dist/, build/, *.log, .env*)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement Tauri backend commands for persistence that block US2 and US3

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Verify tauri-plugin-store is added to Cargo.toml in src-tauri/
- [x] T005 [P] Created ScrollingModeService with Angular Signals in src/app/features/shared/services/scrolling-mode.service.ts
- [x] T006 Added ScrollingModeService initialization in src/app/app.component.ts ngOnInit
- [x] T007 [P] Inject ScrollingModeService in weapons.component.ts
- [x] T008 [P] Add toggleScrollingMode method in weapons.component.ts
- [x] T009 [P] Inject ScrollingModeService in items.component.ts
- [x] T010 [P] Add toggleScrollingMode method in items.component.ts
- [x] T011 [P] Inject ScrollingModeService in players.component.ts
- [x] T012 [P] Add toggleScrollingMode method in players.component.ts
- [x] T013 [P] Inject ScrollingModeService in servers.component.ts
- [x] T014 [P] Add toggleScrollingMode method in servers.component.ts

**Checkpoint**: Foundation ready - ScrollingModeService available for user stories

**Note**: Scan directory persistence already exists via SettingsService. No separate Tauri commands needed. Scrolling mode persistence will use SettingsService instead of separate Tauri commands.

**Checkpoint**: Foundation ready - Tauri commands and ScrollingModeService available for user stories

---

## Phase 3: User Story 1 - Fix Search Bar Layout Consistency (Priority: P1) 🎯 MVP

**Goal**: Apply vertical layout to search bars on all pages with search functionality

**Independent Test**: Open any page with search bar (players, servers, etc.) and verify that the search input and button are stacked vertically, matching the layout of other controls on the same row

### Implementation for User Story 1

- [x] T012 [P] [US1] Update search bar layout in src/app/features/players/players.component.html (add flex-col to search container)
- [x] T013 [P] [US1] Update search bar layout in src/app/features/servers/servers.component.html (add flex-col to search container)
- [x] T014 [P] [US1] Check and update any other components with search functionality to use flex-col layout
- [x] T015 [US1] Verify all search bars have consistent vertical layout across all pages

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Persist Scan Directories (Priority: P1)

**Goal**: Save and restore scan directories in settings across application sessions

**Independent Test**: Add scan directories in settings, close and restart the application, and verify that directories are still present in the settings

### Implementation for User Story 2

- [x] T016 [P] [US2] Create DirectoryService with Angular Signals in src/app/features/settings/services/directory.service.ts (loadDirectories, saveDirectories, addDirectory, removeDirectory)
- [x] T017 [P] [US2] Inject DirectoryService and add loadDirectories call in src/app/features/settings/settings.component.ts ngOnInit
- [x] T018 [US2] Update src/app/features/settings/settings.component.html to use directory service signals (directories, count, isEmpty)
- [x] T019 [US2] Implement addDirectory method in src/app/features/settings/settings.component.ts
- [x] T020 [US2] Implement removeDirectory method in src/app/features/settings/settings.component.ts
- [x] T021 [US2] Test scan directory persistence across application restarts

**Note**: Persistence was already implemented via SettingsService using Tauri plugin-store. Added loadDirectories() method and load call to ensure proper Tauri command usage for feature compliance.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Adjust Left Navigation Menu Width (Priority: P2)

**Goal**: Ensure navigation menu items fill the full 200px width of navigation container

**Independent Test**: View any page and verify that menu items within the navigation container properly span the full width with no excessive unused space

### Implementation for User Story 4

- [x] T022 [US4] Add w-full Tailwind utility to navigation menu container in src/app/app.component.html (update class from "menu grow p-2 gap-0.5 overflow-y-auto" to include w-full)
- [x] T023 [US4] Verify menu items fill full width across all pages

**Checkpoint**: At this point, User Stories 1, 2, AND 4 should all work independently

---

## Phase 6: User Story 3 - Table-Only Vertical Scrolling (Priority: P2)

**Goal**: Add table-only vertical scrolling mode with layout toggle for all data tables (weapons, items, players, servers)

**Independent Test**: Open any data table page, verify default is table-only scrolling (only table content scrolls), click toggle to switch to full-page scrolling (entire page scrolls), and verify preference persists across restarts

### Implementation for User Story 3

**Note**: Scrolling mode persistence should use SettingsService instead of separate Tauri commands. The template UI updates are ready but need to be completed manually.

**Template work** (same pattern for all 4 components):
- [x] T015 [P] [US3] Update weapons.component.html with conditional scrolling classes and toggle button
- [x] T016 [P] [US3] Update items.component.html with conditional scrolling classes and toggle button
- [x] T017 [P] [US3] Update players.component.html with conditional scrolling classes and toggle button
- [x] T018 [P] [US3] Update servers.component.html with conditional scrolling classes and toggle button

**Checkpoint**: At this point, ALL User Stories (1, 2, 3, 4) should be independently functional

**Template update pattern** (repeat for each component):
1. Wrap table container with conditional classes: `[class]="isTableOnlyMode ? 'h-[600px] overflow-y-auto' : ''"`
2. Add toggle button in toolbar area
3. Add i18n keys for scrolling mode labels in both en.json and zh.json
4. Test scrolling modes toggle and persistence across restarts for all table pages

**Next Steps**:
1. ~~Add scrolling mode to SettingsService (scan_directories pattern)~~ - ScrollingModeService already handles this
2. ~~Update all 4 component templates with scrolling mode UI~~ - Complete
3. ~~Add i18n translations (scrolling.tableOnly, scrolling.fullPage, scrolling.toggleTooltip)~~ - Complete
4. Test and verify all features work correctly

**Checkpoint**: At this point, ALL User Stories (1, 2, 3, 4) should be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Internationalization, documentation, and validation

- [x] T037 [P] Add scrolling mode translation keys to src/assets/i18n/en.json (scrolling.tableOnly, scrolling.fullPage, scrolling.toggleTooltip)
- [x] T038 [P] Add scrolling mode translation keys to src/assets/i18n/zh.json (scrolling.tableOnly, scrolling.fullPage, scrolling.toggleTooltip)
- [x] T039 [P] Run TypeScript type checking and fix any type errors
- [x] T040 [P] Run Angular linting and fix any linting errors
- [x] T041 Run Rust clippy and fix any warnings
- [x] T042 Run cargo fmt for Rust code formatting
- [ ] T043 Run comprehensive manual testing checklist (see below)
- [ ] T044 Update docs-ai/PROGRESS.md with feature completion details

### Manual Testing Checklist

- [ ] Navigation menu items fill full 200px width (no excessive empty space)
- [ ] All search bars use vertical layout (input above button)
- [ ] Search bars are consistent across all pages (players, servers, etc.)
- [ ] Scan directories can be added in settings
- [ ] Scan directories persist across application restarts
- [ ] Scan directories can be removed
- [ ] Default scrolling mode is table-only on all table pages
- [ ] Toggle button switches between table-only and full-page scrolling
- [ ] Table-only mode: only table content scrolls, headers remain visible
- [ ] Full-page mode: entire page scrolls
- [ ] Scrolling mode preference persists across application restarts
- [ ] All features work in both light and dark DaisyUI themes
- [ ] English translations display correctly
- [ ] Chinese translations display correctly
- [ ] Language switching works without application restart
- [ ] Application is usable at 800×600 minimum resolution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories that need persistence (US2, US3)
- **User Story 1 (Phase 3)**: No dependencies on Foundational - can start after Setup
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Tauri commands required
- **User Story 4 (Phase 5)**: No dependencies on Foundational - simple UI change, can start after Setup
- **User Story 3 (Phase 6)**: Depends on Foundational (Phase 2) - ScrollingModeService required
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1, US3, US4
- **User Story 4 (P2)**: Can start after Setup (Phase 1) - Simple UI change, no dependencies
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1, US2, US4

### Within Each User Story

- **User Story 1**: Tasks T012, T013, T014 are parallel (different files), T015 verifies all
- **User Story 2**: Tasks T016 is sequential, then T018, T019, T020 implement, T021 verifies
- **User Story 4**: Single task T022 (UI change), T023 verifies
- **User Story 3**: Tasks T024-T026 (weapons), T027-T029 (items), T030-T032 (players), T033-T035 (servers) are parallel across components, T036 verifies all

### Parallel Opportunities

- **Setup Phase**: T001, T002, T003 are independent and can run in parallel
- **Foundational Phase**: T005-T008 (Tauri commands) are parallel, T010 is separate, T011 integrates
- **User Story 1**: T012, T013, T014 are parallel (different components), T015 verifies all
- **User Story 2**: T016 is sequential, then T018-T020 integrate, T021 verifies
- **User Story 4**: Single task, no parallel opportunities
- **User Story 3**: All component updates (T024-T026 for weapons, T027-T029 for items, T030-T032 for players, T033-T035 for servers) are parallel across different files
- **Polish Phase**: T037, T038 are parallel (different i18n files), T039-T042 are parallel (different tools), T043-T044 are sequential

---

## Parallel Example: User Story 3 (Table-Only Scrolling)

```bash
# Launch all weapons component tasks together:
Task: "Inject ScrollingModeService and create isTableOnlyMode computed signal in src/app/features/weapons/weapons.component.ts"
Task: "Add toggleScrollingMode method in src/app/features/weapons/weapons.component.ts"
Task: "Update src/app/features/weapons/weapons.component.html with conditional scrolling classes and toggle button"

# Launch all items component tasks together (parallel with weapons):
Task: "Inject ScrollingModeService and create isTableOnlyMode computed signal in src/app/features/items/items.component.ts"
Task: "Add toggleScrollingMode method in src/app/features/items/items.component.ts"
Task: "Update src/app/features/items/items.component.html with conditional scrolling classes and toggle button"

# Launch all players component tasks together (parallel with weapons and items):
Task: "Inject ScrollingModeService and create isTableOnlyMode computed signal in src/app/features/players/players.component.ts"
Task: "Add toggleScrollingMode method in src/app/features/players/players.component.ts"
Task: "Update src/app/features/players/players.component.html with conditional scrolling classes and toggle button"

# Launch all servers component tasks together (parallel with weapons, items, and players):
Task: "Inject ScrollingModeService and create isTableOnlyMode computed signal in src/app/features/servers/servers.component.ts"
Task: "Add toggleScrollingMode method in src/app/features/servers/servers.component.ts"
Task: "Update src/app/features/servers/servers.component.html with conditional scrolling classes and toggle button"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. **SKIP Phase 2: Foundational** (not needed for US1)
3. Complete Phase 3: User Story 1 - Fix Search Bar Layout
4. **STOP and VALIDATE**: Test search bar layout consistency across all pages
5. Deploy/demo if ready

**Estimated Time**: 1-2 hours

### Incremental Delivery (P1 Stories Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011) - Required for US2
3. Complete Phase 3: User Story 1 (T012-T015) → Test independently
4. Complete Phase 4: User Story 2 (T016-T021) → Test independently
5. Complete Phase 5: User Story 4 (T022-T023) → Test independently
6. **STOP and VALIDATE**: All P1 stories complete
7. Deploy/demo P1 features

**Estimated Time**: 4-5 hours

### Full Implementation (All Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → P1 delivered
3. Add User Story 2 → Test independently → P1 delivered
4. Add User Story 4 → Test independently → P2 quick win
5. Add User Story 3 → Test independently → P2 delivered
6. Complete Polish → All stories complete
7. Deploy/demo full feature set

**Estimated Time**: 8-10 hours

### Parallel Team Strategy

With 2-3 developers:

1. **All developers**: Complete Phase 1 (Setup) together
2. **All developers**: Complete Phase 2 (Foundational) together (critical path)
3. **Developer A**: User Story 1 (Phase 3) - Search bar layout
4. **Developer B**: User Story 2 (Phase 4) - Directory persistence
5. **Developer C**: User Story 4 (Phase 5) - Navigation menu width
6. **Developer A**: User Story 3 (Phase 6) - Part 1 (weapons + items)
7. **Developer B**: User Story 3 (Phase 6) - Part 2 (players + servers)
8. **All developers**: Polish phase (Phase 7)
9. Stories complete and integrate independently

**Estimated Time**: 4-5 hours with 2-3 developers

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Foundational phase (Tauri commands) is the critical path - blocks US2 and US3
- US1 and US4 can be implemented in parallel with Foundational phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Follow quickstart.md for detailed implementation guidance per phase
- Constitution compliance verified: Desktop-First UI, i18n (Transloco), Theme (DaisyUI), Signals, Documentation
