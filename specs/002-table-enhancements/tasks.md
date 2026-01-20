# Tasks: Data Table Enhancements

**Input**: Design documents from `/specs/002-table-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tauri-commands.md

**Tests**: Manual testing only - no unit tests in scope per plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/app/` at repository root
- **Backend**: `src-tauri/src/` at repository root
- **Shared Models**: `src/app/shared/models/`

---

## Phase 1: Setup (Shared Types & Models)

**Purpose**: Create shared type definitions that all user stories depend on

- [x] T001 [P] Create ColumnConfig and ColumnVisibility types in src/app/shared/models/column.models.ts
- [x] T002 [P] Create SortState and SortDirection types in src/app/shared/models/sort.models.ts
- [x] T003 [P] Create DataTab and TabState types in src/app/shared/models/tab.models.ts

---

## Phase 2: Foundational (Backend - Items Scanner)

**Purpose**: Core backend infrastructure that US3 (Items Tab) depends on. Can be developed in parallel with frontend work.

**⚠️ CRITICAL**: US3 (Items Tab) cannot complete frontend without this backend work

- [x] T004 Create items.rs module structure in src-tauri/src/items.rs with module declarations
- [x] T005 [P] Define Item, ItemModifier structs in src-tauri/src/items.rs with serde serialization
- [x] T006 [P] Define ItemScanResult, ScanError structs in src-tauri/src/items.rs
- [x] T007 Implement RawCarryItem XML struct in src-tauri/src/items.rs for .carry_item parsing
- [x] T008 Implement RawVisualItem XML struct in src-tauri/src/items.rs for .visual_item parsing
- [x] T009 Implement scan_items() Tauri command in src-tauri/src/items.rs with directory traversal
- [x] T010 Implement carry_item parsing logic in src-tauri/src/items.rs
- [x] T011 Implement visual_item parsing logic in src-tauri/src/items.rs
- [x] T012 Add items module declaration and scan_items command registration in src-tauri/src/lib.rs

**Checkpoint**: Backend items scanner ready - US3 frontend can now integrate

---

## Phase 3: User Story 1 - Column Visibility Toggle (Priority: P1) 🎯 MVP

**Goal**: Users can toggle column visibility via dropdown menu with localStorage persistence

**Independent Test**: Toggle columns on/off, verify settings persist after page refresh, verify last column cannot be hidden

### Frontend Implementation for US1

- [x] T013 [P] [US1] Create Item entity types in src/app/shared/models/items.models.ts (GameItem, CarryItem, VisualItem, GenericItem, ItemScanResult, ItemScanError)
- [x] T014 [P] [US1] Add i18n keys for column toggle UI in src/assets/i18n/en.json (items.column.toggle, items.column.selectColumns, etc.)
- [x] T015 [P] [US1] Add i18n keys for column toggle UI in src/assets/i18n/zh.json (Chinese translations for items.column.*)
- [x] T016 [US1] Update WeaponsComponent template to add column visibility dropdown button in src/app/features/data/weapons/weapons.component.html using DaisyUI dropdown component
- [x] T017 [US1] Update WeaponsComponent to add onColumnToggle() method in src/app/features/data/weapons/weapons.component.ts with last-column validation
- [x] T018 [US1] Update WeaponsComponent to add getVisibleColumns() helper in src/app/features/data/weapons/weapons.component.ts
- [x] T019 [US1] Update WeaponsComponent template to use getVisibleColumns() in table @for loop in src/app/features/data/weapons/weapons.component.html

**Checkpoint**: At this point, US1 should be fully functional - users can toggle weapon columns, settings persist, last column protected

---

## Phase 4: User Story 2 - Column Sorting (Priority: P2)

**Goal**: Click column headers to sort ascending/descending with visual indicators

**Independent Test**: Click headers to sort, verify direction cycles (unsorted→asc→desc→unsorted), verify sort persists through filters

### Frontend Implementation for US2

- [x] T020 [P] [US2] Add i18n keys for sort UI in src/assets/i18n/en.json (weapons.sort.ascending, weapons.sort.descending)
- [x] T021 [P] [US2] Add i18n keys for sort UI in src/assets/i18n/zh.json (Chinese translations)
- [x] T022 [US2] Add sortState signal to WeaponService in src/app/features/data/weapons/services/weapon.service.ts
- [x] T023 [US2] Add setSortState() and getSortState() methods to WeaponService in src/app/features/data/weapons/services/weapon.service.ts
- [x] T024 [US2] Update filteredWeapons computed to apply sorting in src/app/features/data/weapons/services/weapon.service.ts
- [x] T025 [US2] Implement sortWeapons() private method in src/app/features/data/weapons/services/weapon.service.ts with stable sort
- [x] T026 [US2] Implement compareValues() private method in src/app/features/data/weapons/services/weapon.service.ts with null-safe comparison
- [x] T027 [US2] Add Lucide chevron-up and chevron-down icons to imports in src/app/features/data/weapons/weapons.component.ts
- [x] T028 [US2] Add onColumnClick() method to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts with three-state cycle
- [x] T029 [US2] Update WeaponsComponent template to add click handlers to column headers in src/app/features/data/weapons/weapons.component.html
- [x] T030 [US2] Update WeaponsComponent template to add sort indicator icons to column headers in src/app/features/data/weapons/weapons.component.html

**Checkpoint**: At this point, US1 AND US2 should both work - weapons table has sortable columns with visual indicators

---

## Phase 5: User Story 3 - Items Data Tab (Priority: P3)

**Goal**: New Items tab alongside Weapons with independent state, item scanning, table display

**Independent Test**: Switch between Weapons/Items tabs, verify independent state, verify items scan and display correctly

### Frontend Implementation for US3

- [x] T031 [P] [US3] Create ITEM_COLUMNS constant array in src/app/features/data/items/item-columns.ts with 7 default columns
- [x] T032 [P] [US3] Add i18n keys for items tab in src/assets/i18n/en.json (items.title, items.columns.*, items.noData, items.scanError)
- [x] T033 [P] [US3] Add i18n keys for items tab in src/assets/i18n/zh.json (Chinese translations)
- [x] T034 [US3] Create ItemService with Signals pattern in src/app/features/data/items/services/item.service.ts (mirrors WeaponService)
- [x] T035 [US3] Add items, searchTerm, advancedFilters, sortState signals to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T036 [US3] Add filteredItems computed signal to ItemService in src/app/features/data/items/services/item.service.ts with filter + sort logic
- [x] T037 [US3] Add scanItems() async method to ItemService in src/app/features/data/items/services/item.service.ts calling scan_items Tauri command
- [x] T038 [US3] Add setSortState(), getSortState() methods to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T039 [US3] Add sortItems(), compareValues() private methods to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T040 [US3] Add setSearchTerm(), setAdvancedFilters(), clearFilters() methods to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T041 [US3] Add setColumnVisibility(), getColumnVisibility(), getDefaultColumns() methods to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T042 [US3] Add matchesSearch(), matchesFilters() private methods to ItemService in src/app/features/data/items/services/item.service.ts
- [x] T043 [US3] Create ItemsComponent with ItemService injection in src/app/features/data/items/items.component.ts
- [x] T044 [US3] Add readonly signals and UI state signals to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T045 [US3] Add loadItems(), onSearch(), onColumnClick(), onColumnToggle(), onRowClick() methods to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T046 [US3] Create ItemsComponent template with table structure in src/app/features/data/items/items.component.html (matches weapons.component.html pattern)
- [x] T047 [US3] Create ItemsComponent styles in src/app/features/data/items/items.component.scss
- [x] T048 [US3] Add tab state signal to DataLayoutComponent in src/app/features/data/local/local.component.ts
- [x] T049 [US3] Add switchTab() method to DataLayoutComponent in src/app/features/data/local/local.component.ts
- [x] T050 [US3] Update DataLayoutComponent template to add tab navigation UI in src/app/features/data/local/local.component.html using DaisyUI tabs component
- [x] T051 [US3] Update DataLayoutComponent template to add @if conditional rendering for Weapons/Items components in src/app/features/data/local/local.component.html
- [x] T052 [US3] Add ItemsComponent import and standalone declaration in src/app/features/data/local/local.component.ts
- [x] T053 [US3] Add DataLayoutComponent import to ItemsComponent in src/app/features/data/items/items.component.ts

**Checkpoint**: All user stories (US1, US2, US3) should now be independently functional - tab switching works with independent state

---

## Phase 6: User Story 4 - Code Quality Improvements (Priority: P4)

**Goal**: Refactor non-data directory components to follow Angular v20 Signal patterns

**Independent Test**: Code review verifies no BehaviorSubject outside data directory, no toSignal() bridges, no manual subscribe()

### Code Audit & Refactoring for US4

- [x] T054 [US4] Audit codebase for BehaviorSubject usage outside src/app/features/data/ using grep/search
- [x] T055 [US4] Audit codebase for toSignal() usage patterns using grep/search
- [x] T056 [US4] Audit codebase for manual subscribe() calls using grep/search
- [x] T057 [P] [US4] Refactor identified BehaviorSubject state to signal() in affected components
- [x] T058 [P] [US4] Remove toSignal() bridges - use service signals directly in affected components
- [x] T059 [P] [US4] Replace subscribe() with Signal computed/reactive patterns in affected components
- [x] T060 [US4] Run pnpm run lint and verify no errors in refactored code
- [ ] T061 [US4] Run application and verify no memory leaks in DevTools (requires manual testing)

**Checkpoint**: All user stories (US1-US4) complete - code follows Angular v20 Signal patterns throughout

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T062 [P] Verify 800×600 resolution constraint with DevTools responsive mode (no horizontal scroll, all controls visible)
- [x] T063 [P] Verify dark mode compatibility by toggling DaisyUI theme and checking contrast
- [x] T064 [P] Run npm run format:check and fix any warnings (formatting applied)
- [x] T065 [P] Run cargo clippy --manifest-path=src-tauri/Cargo.toml and fix any warnings
- [x] T066 [P] Run cargo fmt --manifest-path=src-tauri/Cargo.toml to format Rust code
- [x] T067 [P] Run npm run format:all to format TypeScript code
- [ ] T068 Manual testing: Test column toggle on weapons table (US1)
- [ ] T069 Manual testing: Test column sorting on weapons table (US2)
- [ ] T070 Manual testing: Test tab switching between Weapons and Items (US3)
- [ ] T071 Manual testing: Test items scanning with real game directory (US3)
- [ ] T072 Manual testing: Verify empty-state message when no items found (US3)
- [ ] T073 Manual testing: Test that last column cannot be hidden (US1)
- [ ] T074 Manual testing: Verify column visibility persists after page refresh (US1)
- [ ] T075 Manual testing: Verify sort order maintains through filter/search (US2)
- [ ] T076 Manual testing: Verify independent state per-tab (switch tabs, filters maintained) (US3)
- [ ] T077 Manual testing: Verify null/undefined values sort correctly (US2)
- [ ] T078 Manual testing: Verify stable sort with equal values (US2)
- [ ] T079 Manual testing: Measure sort performance with 500+ items (target: <500ms) (US2)
- [ ] T080 Manual testing: Measure tab switch performance (target: <100ms) (US3)
- [ ] T081 Manual testing: Measure items scan performance (target: <3 seconds) (US3)
- [x] T082 Update PROGRESS.md with implementation summary following template in docs-ai/PROGRESS.md

**Checkpoint**: Feature complete - all acceptance criteria met, ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational - Backend (Phase 2)**: No dependencies - can run in parallel with frontend Phases 3-4
- **US1 (Phase 3)**: Depends on Setup (Phase 1) only - can start immediately
- **US2 (Phase 4)**: Depends on Setup (Phase 1) + US1 (optional - enhances weapons table, can be standalone)
- **US3 (Phase 5)**: Depends on Setup (Phase 1) + Foundational-Backend (Phase 2) - needs items scanner
- **US4 (Phase 6)**: Can run in parallel with any user story - code quality audit, no blocking dependencies
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **US2 (P2)**: Can start after Setup (Phase 1) - Enhances US1 weapons table but independently testable
- **US3 (P3)**: Can start after Setup (Phase 1) - Requires Backend (Phase 2) for items scanner
- **US4 (P4)**: No dependencies - Code audit/refactoring, can run anytime

### Within Each User Story

- Phase 1 setup tasks can all run in parallel
- Backend Phase 2 tasks have internal dependencies (T004 before T005-T011, T009 before T010-T011)
- US1: Models (T013-T015) before implementation (T016-T019)
- US2: i18n (T020-T021) before Service work (T022-T026) before UI work (T027-T030)
- US3: Parallel starts possible - columns (T031) + i18n (T032-T033) before Service (T034-T042) before Component (T043-T047) before Layout (T048-T053)
- US4: Audit (T054-T056) before Refactoring (T057-T059) before Validation (T060-T061)
- Polish Phase 7: All tasks can run in parallel after implementation complete

### Parallel Opportunities

**Immediate Parallel Starts**:
- T001, T002, T003 (Setup - all model types)
- T004-T012 (Backend - can run parallel with US1, US2, US4)
- T054, T055, T056 (US4 Audit - can run anytime)

**Within US1** (after Setup):
- T013, T014, T015 can run in parallel (models + i18n)

**Within US2** (after Setup + US1):
- T020, T021 can run in parallel (i18n only)

**Within US3** (after Setup + Backend):
- T031, T032, T033 can run in parallel (columns + i18n)

**Polish Phase** (after all implementation):
- T062-T071 can all run in parallel (manual testing can be split)
- T064-T067 can run in parallel (linting/formatting)

---

## Parallel Example: Setup & Backend (Phases 1-2)

```bash
# Launch all Setup tasks together:
Task: "Create ColumnConfig and ColumnVisibility types in src/app/shared/models/column.models.ts"
Task: "Create SortState and SortDirection types in src/app/shared/models/sort.models.ts"
Task: "Create DataTab and TabState types in src/app/shared/models/tab.models.ts"

# Launch Backend structure and definitions together:
Task: "Create items.rs module structure in src-tauri/src/items.rs"
Task: "Define Item, ItemModifier structs in src-tauri/src/items.rs"
Task: "Define ItemScanResult, ScanError structs in src-tauri/src/items.rs"
Task: "Implement RawCarryItem XML struct in src-tauri/src/items.rs"
Task: "Implement RawVisualItem XML struct in src-tauri/src/items.rs"
```

---

## Parallel Example: US3 Frontend (Phase 5)

```bash
# Launch columns and i18n together (after Setup + Backend complete):
Task: "Create ITEM_COLUMNS constant array in src/app/features/data/items/item-columns.ts"
Task: "Add i18n keys for items tab in src/assets/i18n/en.json"
Task: "Add i18n keys for items tab in src/assets/i18n/zh.json"
```

---

## Implementation Strategy

### MVP First (US1 Only - Column Visibility)

1. Complete Phase 1: Setup (T001-T003) - Shared types
2. Complete Phase 3: US1 (T013-T019) - Column toggle on weapons table
3. **STOP and VALIDATE**: Test column toggle independently
4. Deploy/demo if ready

**MVP Value**: Users can customize weapon columns - immediately useful for focusing on relevant attributes

### Incremental Delivery

1. **MVP**: Setup + US1 → Column visibility toggle → Deploy/Demo
2. **Enhancement**: + US2 → Sorting on weapons table → Deploy/Demo
3. **Expansion**: + Backend + US3 → Items tab with full table → Deploy/Demo
4. **Quality**: + US4 → Code quality improvements → Final Deploy

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Foundation**: Team completes Setup (Phase 1) together
2. **Parallel Start**:
   - Developer A: US1 (Column Visibility) - Frontend only
   - Developer B: Backend (Phase 2) - Items scanner (blocks US3)
   - Developer C: US4 (Code Quality) - Audit and refactor
3. **After Backend Complete**:
   - Developer A: Continue to US2 (Sorting) - Enhances weapons
   - Developer B: US3 (Items Tab) - Frontend using completed backend
   - Developer C: Continue US4 or join Polish

Stories complete and integrate independently.

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** = maps task to specific user story for traceability
- **No unit tests** in scope - manual testing only per plan.md
- **Backend (Phase 2)** can run in parallel with frontend US1/US2/US4
- **US3 requires Backend (Phase 2)** to be complete before frontend can integrate
- **Commit** after each task or logical group
- **Stop** at any checkpoint to validate story independently
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **follow Angular v20 Signal pattern**: Signal管状态, RxJS管异步, no toSignal() bridges
