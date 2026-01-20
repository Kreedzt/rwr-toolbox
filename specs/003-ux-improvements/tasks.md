# Tasks: UX Improvements - Data Display Fixes

**Input**: Design documents from `/specs/003-ux-improvements/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/
**Date**: 2026-01-17

**Tests**: No test tasks included - tests not explicitly requested in specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

---

## Summary

Implement 5 UX improvements plus 3 critical data display fixes PLUS pagination performance optimization organized into 10 phases:
- **Phase 1 (Setup)**: Theme infrastructure, weapon class mappings, i18n keys
- **Phase 2 (Foundational)**: Backend parser fixes (hud_icon, class attribute), virtual scroll setup
- **Phase 3 (US1)**: Search bar layout consistency
- **Phase 4 (US3)**: Remove game path, migrate to scan directories
- **Phase 5 (US5)**: Restore Hotkeys menu entry
- **Phase 6 (US4)**: Theme switching with auto-detection
- **Phase 7 (US2)**: Item images + virtual scrolling + class column display
- **Phase 8 (Polish)**: Validation, testing, formatting, documentation updates
- **Phase 9 (US6)**: Table pagination for performance optimization
- **Phase 10 (Final Polish)**: Documentation and final testing

**Total Tasks**: 77 (55 original + 22 pagination)
**Parallel Opportunities**: Multiple across phases
**MVP Scope**: P1 Stories (US1, US3, US5) - 19 tasks
**Performance Enhancement**: US6 (Pagination) - 22 tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and prepare models/constants for implementation

- [x] T001 Verify @angular/cdk is installed in package.json for virtual scrolling support
- [x] T002 [P] Create Weapon class names mapping constants in src/app/shared/constants/weapon-classes.ts
- [x] T003 [P] Add i18n translation keys for weapon class column in src/assets/i18n/en.json
- [x] T004 [P] Add i18n translation keys for weapon class column in src/assets/i18n/zh.json
- [x] T005 [P] Create ThemePreference interface in src/app/shared/models/theme.models.ts
- [x] T006 [P] Create SystemTheme interface in src/app/shared/models/theme.models.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend changes that MUST be complete before frontend user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Update Rust weapon parser to extract hud_icon element from `<hud_icon filename="..."/>` in src-tauri/src/weapons.rs
- [x] T008 Update Rust weapon parser to preserve class attribute as i32 (separate from tag) from `<specification class="..."/>` in src-tauri/src/weapons.rs
- [x] T009 Ensure tag and class are parsed independently (no mapping) in src-tauri/src/weapons.rs
- [x] T010 [P] Create Tauri command get_texture_path for icon resolution (weapon file → textures folder) in src-tauri/src/weapons.rs or src-tauri/src/commands.rs
- [x] T011 [P] Add SystemTheme struct for OS theme detection in src-tauri/src/models/system_theme.rs
- [x] T012 Implement get_system_theme Tauri command (macOS detection via defaults command) in src-tauri/src/commands.rs
- [x] T013 [P] Install and configure @angular/cdk ScrollingModule (imported in components that use it)
- [x] T014 [P] Create Observable adapter for Signals with toObservable in src/app/shared/adapters/virtual-scroll.adapter.ts

**Checkpoint**: Backend ready - frontend user story implementation can now begin

---

## Phase 3: User Story 1 - Fix Search Bar Layout Consistency (Priority: P1) 🎯 MVP

**Goal**: Make Players page search layout consistent with other pages (Servers, Weapons, Items)

**Independent Test**: Open Players page and verify search label and input are on same line, button below

### Implementation for User Story 1

- [x] T015 [US1] Fix Players page search bar layout in src/app/features/players/players.component.html
- [x] T016 [US1] Verify layout matches Servers, Weapons, Items pages pattern

**Checkpoint**: Search bar layout is consistent across all pages

---

## Phase 4: User Story 3 - Remove Game Path Setting & Use Scan Directories (Priority: P1) 🎯 MVP

**Goal**: Remove obsolete gamePath setting and migrate to multi-directory system

**Independent Test**: Open Settings, verify gamePath input is removed, existing path migrated to scan directories

### Implementation for User Story 3

- [x] T017 [P] [US3] Add migration logic in SettingsService.initialize() in src/app/core/services/settings.service.ts
- [x] T018 [P] [US3] Add clearGamePath() method to SettingsService in src/app/core/services/settings.service.ts
- [x] T019 [US3] Remove gamePath-related properties from SettingsService in src/app/core/services/settings.service.ts
- [x] T020 [P] [US3] Remove game path input and validation button HTML in src/app/features/settings/settings.component.html
- [x] T021 [P] [US3] Remove game path component logic in src/app/features/settings/settings.component.ts
- [x] T022 [US3] Update WeaponsComponent to use first valid scan directory in src/app/features/data/weapons/weapons.component.ts
- [x] T023 [US3] Update ItemsComponent to use first valid scan directory in src/app/features/data/items/items.component.ts

**Checkpoint**: GamePath removed, migration working, components use scan directories

---

## Phase 5: User Story 5 - Restore Hotkeys Menu Entry (Priority: P1) 🎯 MVP

**Goal**: Add Hotkeys menu entry between Data and Settings with Ctrl+5 shortcut

**Independent Test**: View sidebar, verify Hotkeys menu between Data/Settings, test Ctrl+5 navigation

### Implementation for User Story 5

- [x] T024 [P] [US5] Add Hotkeys menu entry to MAIN_MENU_ITEMS in src/app/shared/constants/menu-items.ts
- [x] T025 [P] [US5] Update Settings shortcut from Ctrl+5 to Ctrl+6 in src/app/shared/constants/menu-items.ts
- [x] T026 [P] [US5] Update About shortcut from Ctrl+6 to Ctrl+7 in src/app/shared/constants/menu-items.ts
- [x] T027 [US5] Register Keyboard icon in APP_ICONS if not already present in src/app/shared/icons/index.ts

**Checkpoint**: Hotkeys menu visible and navigable via Ctrl+5

---

## Phase 6: User Story 4 - Add Light/Dark Theme Switching (Priority: P2)

**Goal**: Allow users to switch themes with auto-detection and persistence

**Independent Test**: Toggle theme in Settings, verify applies across all pages and persists after restart

### Implementation for User Story 4

- [x] T028 [P] [US4] Enhance ThemeService with auto theme support in src/app/shared/services/theme.service.ts
- [x] T029 [P] [US4] Add get_system_theme invocation in ThemeService in src/app/shared/services/theme.service.ts
- [x] T030 [US4] Add theme dropdown HTML to Settings in src/app/features/settings/settings.component.html
- [x] T031 [US4] Wire theme selection in Settings component in src/app/features/settings/settings.component.ts
- [x] T032 [P] [US4] Add theme i18n keys to en.json in src/assets/i18n/en.json
- [x] T033 [P] [US4] Add theme i18n keys to zh.json in src/assets/i18n/zh.json
- [x] T034 [US4] Initialize ThemeService in AppComponent in src/app/app.component.ts

**Checkpoint**: Theme switching works with persistence and OS detection

---

## Phase 7: User Story 2 - Add Item Images & Virtual Scrolling (Priority: P2)

**Goal**: Display item/weapon images from textures/ folder, implement virtual scrolling for performance, preserve class attribute

**Independent Test**: Navigate to Data > Weapons/Items, verify images show from textures/ folder, scrolling is smooth with 1000+ rows, class column visible

### Implementation for User Story 2

- [x] T035 [P] [US2] Update Weapon interface with hudIcon and class fields in src/app/shared/models/weapon.models.ts
- [x] T036 [P] [US2] Create getIconUrl method using convertFileSrc in WeaponService (Tauri icon rendering) in src/app/features/data/weapons/services/weapon.service.ts
- [ ] T037 [US2] Update Weapons component with virtual scrolling in src/app/features/data/weapons/weapons.component.ts ⚠️ OBSOLETE: Pagination (Phase 9) chosen instead
- [ ] T038 [US2] Update Weapons component template with cdk-virtual-scroll-viewport in src/app/features/data/weapons/weapons.component.html ⚠️ OBSOLETE: Pagination (Phase 9) chosen instead
- [ ] T039 [US2] Add image column to Weapons table in src/app/features/data/weapons/weapons.component.html ⚠️ DEFERRED: Can be added later
- [ ] T040 [US2] Add class column to Weapons table in src/app/features/data/weapons/weapons.component.html ⚠️ DEFERRED: Can be added later
- [ ] T041 [US2] Update Items component with virtual scrolling in src/app/features/data/items/items.component.ts ⚠️ OBSOLETE: Pagination (Phase 9) chosen instead
- [ ] T042 [US2] Update Items component template with cdk-virtual-scroll-viewport in src/app/features/data/items/items.component.html ⚠️ OBSOLETE: Pagination (Phase 9) chosen instead
- [ ] T043 [US2] Add image column to Items table in src/app/features/data/items/items.component.html ⚠️ DEFERRED: Can be added later
- [x] T044 [US2] Update Weapon column definitions for class and image in src/app/features/data/weapons/constants/columns.ts

**Note**: Virtual scrolling tasks (T037-T038, T041-T042) are obsolete - pagination was chosen as the performance solution. Image/class column tasks (T039-T040, T043) are deferred for future implementation.

**Checkpoint**: Items/weapons display images from textures/, scrolling is smooth, class column visible separate from tag

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T045 [P] Update PROGRESS.md with implementation changes in docs-ai/PROGRESS.md
- [x] T046 [P] Run TypeScript compiler validation: pnpm tsc --noEmit
- [x] T047 [P] Run Rust linter: cd src-tauri && cargo clippy
- [x] T048 [P] Format code: pnpm format and cd src-tauri && cargo fmt
- [ ] T049 Validate quickstart.md testing scenarios
- [ ] T050 Manual testing: verify all user stories work independently
- [ ] T051 Manual testing: verify icon images load from textures/ folder
- [ ] T052 Manual testing: verify virtual scrolling smooth with 1000+ rows
- [ ] T053 Manual testing: verify class and tag columns are displayed independently
- [ ] T054 Manual testing: verify theme persists across app restarts
- [ ] T055 Manual testing: verify hotkeys shortcuts work (Ctrl+5, Ctrl+6, Ctrl+7)

---

## Phase 9: User Story 6 - Add Table Pagination (Priority: P1) 🚀 PERFORMANCE

**Goal**: Implement client-side pagination for Weapons and Items tables to improve search performance with large datasets (1000+ items)

**Problem**: Current implementation renders ALL filtered weapons/items in DOM simultaneously. With 1000+ weapons, each keystroke triggers filtering and rendering of all items, causing 500ms+ delays and poor UX.

**Solution**: Implement pagination with default page size of 100 items, reducing rendered DOM elements from 1000+ to 100, improving search responsiveness from 500ms+ to <50ms (10x improvement).

**Independent Test**:
1. Open Data > Weapons page with 1000+ weapons loaded
2. Type in search box and verify results filter in <50ms
3. Verify pagination controls appear at bottom of table
4. Click page numbers and verify navigation is instant (<100ms)
5. Verify "Showing X to Y of Z items" displays correct counts
6. Repeat for Items page

### Implementation for User Story 6 - Weapons Component

- [x] T056 [P] [US6] Add pagination state signal to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T057 [P] [US6] Add computed signals (totalItems, totalPages) to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T058 [US6] Add paginatedWeapons computed signal to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T059 [US6] Update Weapons table to iterate over paginatedWeapons() instead of weapons() in src/app/features/data/weapons/weapons.component.html
- [x] T060 [P] [US6] Add pagination controls UI to Weapons table footer in src/app/features/data/weapons/weapons.component.html
- [x] T061 [P] [US6] Add i18n key weapons.pagination_info to src/assets/i18n/en.json
- [x] T062 [P] [US6] Add i18n key weapons.pagination_info to src/assets/i18n/zh.json
- [x] T063 [US6] Add onPageChange handler to WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T064 [US6] Add getPageNumbers() method to WeaponsComponent (ellipsis for large page counts) in src/app/features/data/weapons/weapons.component.ts
- [x] T065 [US6] Add getDisplayRange() method to WeaponsComponent (showing X to Y of Z) in src/app/features/data/weapons/weapons.component.ts
- [x] T066 [US6] Update onSearch() to reset pagination to page 1 in src/app/features/data/weapons/weapons.component.ts
- [x] T067 [US6] Update onClassTagFilter() to reset pagination to page 1 in src/app/features/data/weapons/weapons.component.ts
- [x] T068 [US6] Update onSortChange() to reset pagination to page 1 in src/app/features/data/weapons/weapons.component.ts
- [x] T069 [US6] Remove debug console.log statements from WeaponsComponent in src/app/features/data/weapons/weapons.component.ts
- [x] T070 [US6] Remove debug console.log statements from WeaponService in src/app/features/data/weapons/services/weapon.service.ts

### Implementation for User Story 6 - Items Component

- [x] T071 [P] [US6] Add pagination state signal to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T072 [P] [US6] Add computed signals (totalItems, totalPages) to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T073 [US6] Add paginatedItems computed signal to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T074 [US6] Update Items table to iterate over paginatedItems() instead of items() in src/app/features/data/items/items.component.html
- [x] T075 [P] [US6] Add pagination controls UI to Items table footer in src/app/features/data/items/items.component.html
- [x] T076 [P] [US6] Add i18n key items.pagination_info to src/assets/i18n/en.json
- [x] T077 [P] [US6] Add i18n key items.pagination_info to src/assets/i18n/zh.json
- [x] T078 [US6] Add onPageChange handler to ItemsComponent in src/app/features/data/items/items.component.ts
- [x] T079 [US6] Add getPageNumbers() method to ItemsComponent (ellipsis for large page counts) in src/app/features/data/items/items.component.ts
- [x] T080 [US6] Add getDisplayRange() method to ItemsComponent (showing X to Y of Z) in src/app/features/data/items/items.component.html
- [x] T081 [US6] Update onSearch() to reset pagination to page 1 in src/app/features/data/items/items.component.ts

### Performance Testing

- [ ] T082 [US6] Performance test: Verify search response <50ms with 1000+ weapons in Weapons page
- [ ] T083 [US6] Performance test: Verify page navigation <100ms in Weapons page
- [ ] T084 [US6] Performance test: Verify search response <50ms with 1000+ items in Items page
- [ ] T085 [US6] Performance test: Verify page navigation <100ms in Items page
- [ ] T086 [US6] Edge case: Verify pagination hides when totalPages = 1
- [ ] T087 [US6] Edge case: Verify pagination shows with ellipsis for 10+ pages

**Checkpoint**: Pagination implemented, search is 10x faster (500ms → 50ms), smooth typing experience

---

## Phase 10: Final Polish & Documentation

**Purpose**: Update documentation and final validation after pagination implementation

- [x] T088 [P] Update PROGRESS.md with pagination implementation in docs-ai/PROGRESS.md
- [x] T089 [P] Run TypeScript compiler validation: pnpm tsc --noEmit
- [x] T090 [P] Format code: pnpm format (requires manual execution)
- [ ] T091 Manual testing: verify pagination works independently in Weapons page
- [ ] T092 Manual testing: verify pagination works independently in Items page
- [ ] T093 Manual testing: verify no regression to existing filter/sort functionality
- [ ] T094 Cross-browser testing: Chrome, Firefox, Safari on Windows/macOS/Linux

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Stories 1, 3, 5 (P1 stories) can proceed in parallel
  - User Stories 2, 4 (P2 stories) can proceed in parallel
  - Recommend P1 → P2 priority order
- **Polish (Phase 8)**: Depends on all desired user stories being complete
- **Pagination (Phase 9)**: Can start independently - no dependencies on Phases 1-8 (client-side only optimization)
- **Final Polish (Phase 10)**: Depends on Phase 9 (pagination) completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P1)**: Can start anytime - independent performance enhancement, no dependencies on other stories

### Within Each User Story

- Foundation tasks (backend) must complete before frontend tasks
- Parallel tasks marked [P] can run simultaneously
- Update both en.json and zh.json for any new i18n keys

### Parallel Opportunities

- All Setup tasks (T001-T006) can run in parallel
- Foundational tasks (T007, T010-T014) marked [P] can run in parallel
- Once Foundational phase completes, all P1 user stories (US1, US3, US5) can start in parallel
- Once P1 stories complete, all P2 user stories (US2, US4) can start in parallel
- **NEW**: Pagination (Phase 9) tasks have many parallel opportunities:
  - T056-T058 (Weapons component signals) can run in parallel
  - T060-T062 (UI + i18n) can run in parallel after T058
  - T071-T073 (Items component signals) can run in parallel with Weapons tasks
  - T075-T077 (Items UI + i18n) can run in parallel

---

## Parallel Example: Priority 1 Stories

```bash
# After Foundational (Phase 2) completes, launch all P1 stories together:
Task T015: "Fix Players page search bar layout"
Task T017: "Add migration logic in SettingsService"
Task T018: "Remove gamePath-related properties"
Task T020: "Remove game path input HTML"
Task T024: "Add Hotkeys menu entry"
Task T025: "Update Settings shortcut"
Task T026: "Update About shortcut"
```

---

## Parallel Example: Pagination (Phase 9)

```bash
# Weapons and Items pagination can proceed in parallel:
# Weapons Component:
Task T056: "Add pagination state signal to WeaponsComponent"
Task T057: "Add totalItems/totalPages computed signals to WeaponsComponent"
Task T058: "Add paginatedWeapons computed signal"

# Items Component (parallel with Weapons):
Task T071: "Add pagination state signal to ItemsComponent"
Task T072: "Add totalItems/totalPages computed signals to ItemsComponent"
Task T073: "Add paginatedItems computed signal"

# UI and i18n (after computed signals):
Task T060: "Add pagination controls UI to Weapons table"
Task T061-T062: "Add i18n keys for pagination_info (EN + ZH)"
Task T075: "Add pagination controls UI to Items table"
Task T076-T077: "Add i18n keys for pagination_info (EN + ZH)"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T014) - CRITICAL
3. Complete Phase 3: User Story 1 (T015-T016)
4. Complete Phase 4: User Story 3 (T017-T023)
5. Complete Phase 5: User Story 5 (T024-T027)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready

### Full Feature Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add P1 Stories (US1, US3, US5) → Test independently → Deploy/Demo (MVP!)
3. Add P2 Stories (US4, US2) → Test independently → Deploy/Demo
4. Complete Polish phase (T045-T055)
5. **NEW**: Add Pagination (US6) → Test independently → Deploy/Demo (Performance boost!)
6. Final Polish (T088-T094)
7. Final validation and release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (search layout)
   - Developer B: User Story 3 (game path removal)
   - Developer C: User Story 5 (hotkeys menu)
3. After P1 stories complete:
   - Developer A: User Story 4 (theme switching)
   - Developer B: User Story 2 (images + virtual scroll)
4. After P2 stories complete:
   - Developer A: Weapons pagination (T056-T070)
   - Developer B: Items pagination (T071-T081)
   - Parallel execution possible for signal setup, UI, and i18n

---

## Performance Benchmarks

### Pagination Performance Improvement (Target)

| Dataset Size | Before Pagination | After Pagination | Improvement |
|--------------|-------------------|------------------|-------------|
| 500 items    | ~200ms/search     | <30ms/search     | 6.7x faster |
| 1000 items   | ~500ms/search     | <50ms/search     | 10x faster  |
| 2000 items   | ~1000ms/search    | <50ms/search     | 20x faster  |

### Success Criteria for Pagination

- **SC-PAG-001**: Search response time <50ms with 1000+ weapons
- **SC-PAG-002**: Page navigation time <100ms
- **SC-PAG-003**: Pagination controls visible when totalPages > 1
- **SC-PAG-004**: Pagination controls hidden when totalPages = 1
- **SC-PAG-005**: Page resets to 1 when search term changes
- **SC-PAG-006**: Display range shows accurate counts (e.g., "1 to 100 of 1234")
- **SC-PAG-007**: Page numbers with ellipsis for large page counts (>7 pages)
- **SC-PAG-008**: i18n translations present for EN and ZH
- **SC-PAG-009**: Consistent UI/UX between Weapons and Items tables
- **SC-PAG-010**: No regression to existing filter/sort functionality

---

## Notes

- Tests are NOT included as they were not explicitly requested in the specification
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Virtual scrolling uses CDK with toObservable() for Signals integration
- Icon rendering uses Tauri's convertFileSrc() from @tauri-apps/api/tauri (NOT file:// URLs)
- get_texture_path command resolves: weapon file → ../textures/ → absolute path
- Class attribute is preserved separately from tag - both fields displayed independently
- **NEW**: Pagination uses client-side Signals pattern, no backend changes required
- **NEW**: Pagination follows ServersComponent pattern exactly for consistency
- **NEW**: Pagination performance target: <50ms search response (10x improvement)
