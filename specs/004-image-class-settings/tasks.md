# Tasks: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Input**: Design documents from `/specs/004-image-class-settings/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated tests specified in feature requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Angular project: `src/` at repository root
- i18n files: `src/assets/i18n/`
- Feature components: `src/app/features/data/`
- Rust backend: `src-tauri/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Feature branch verification

- [X] T001 Verify feature branch `004-image-class-settings` exists
- [X] T002 Verify existing WeaponsComponent infrastructure in src/app/features/data/weapons/weapons.component.ts
- [X] T003 Verify existing ItemsComponent infrastructure in src/app/features/data/items/items.component.ts

---

## Phase 2: Foundational (i18n Infrastructure)

**Purpose**: Translation keys that MUST exist before any UI implementation

**⚠️ CRITICAL**: No component work can begin until this phase is complete

- [X] T004 [P] [US1, US2, US3] Add English i18n keys to src/assets/i18n/en.json
  - Under `weapons.columns` object: `classTag`, `class`
  - Under `items.columns` object: `image`
  - Under `settings.scanLibrary` object: `selected`, `noneSelected`, `selectFirst`
- [X] T005 [P] [US1, US2, US3] Add Chinese i18n keys to src/assets/i18n/zh.json
  - Under `weapons.columns` object: `classTag` ("类别标签"), `class` ("类别")
  - Under `items.columns` object: `image` ("图片")
  - Under `settings.scanLibrary` object: `selected` ("已选扫描库"), `noneSelected` ("未选择扫描库"), `selectFirst` ("请选择一个库以启用扫描")

**Checkpoint**: i18n ready - component implementation can now begin

---

## Phase 3: User Story 1 - Image Column Rendering (Priority: P1) 🎯 MVP

**Goal**: Display weapon/item thumbnails in image column by loading from texture files

**Independent Test**: Navigate to Data > Weapons or Data > Items page, verify that the image column displays weapon/item icons loaded from the texture files in the same directory as the weapon/item files.

### Implementation for User Story 1

#### Rust Backend

- [X] T006 [P] [US1] Add `get_item_texture_path` command to src-tauri/src/items.rs
  - Navigate from item file to textures folder (sibling directory)
  - Return absolute path or error message
  - Follow same pattern as weapons.rs `get_texture_path` command

- [X] T007 [US1] Register `get_item_texture_path` command in src-tauri/src/lib.rs
  - Add to invoke_handler with get_texture_path and other commands
  - Use tauri::generate_handler macro

#### Frontend - Items

- [X] T008 [P] [US1] Add `getIconUrl` method to src/app/features/data/items/services/item.service.ts
  - Invoke `get_item_texture_path` Tauri command with item.sourceFile and item.hudIcon
  - Convert absolute path to Tauri asset URL using convertFileSrc()
  - Return empty string for non-CarryItem types or missing hudIcon

- [X] T009 [P] [US1] Add image URL cache signal to src/app/features/data/items/items.component.ts
  - Add `readonly itemIconUrls = signal<Map<string, string>>(new Map())`

- [X] T010 [P] [US1] Add `loadItemIcon` method to src/app/features/data/items/items.component.ts
  - Check if item is CarryItem with hudIcon
  - Check if already cached to avoid duplicate calls
  - Call itemService.getIconUrl()
  - Update itemIconUrls signal with result

- [X] T011 [P] [US1] Add `getItemIconUrl` getter method to src/app/features/data/items/items.component.ts
  - Return cached URL or empty string from itemIconUrls signal

- [X] T012 [P] [US1] Add `onItemImageError` handler to src/app/features/data/items/items.component.ts
  - Log warning for failed image load
  - Optionally remove from cache for retry

- [X] T013 [P] [US1] Add image rendering to src/app/features/data/items/items.component.html
  - In image column `<td>`, use @if to check `getItemIconUrl(item)`
  - If URL exists: render `<img>` with [src], [alt], class="w-12 h-12 object-contain", (error) binding
  - If no URL: render placeholder div with lucide-icon "image-off"

#### Frontend - Weapons

- [X] T014 [P] [US1] Add image URL cache signal to src/app/features/data/weapons/weapons.component.ts
  - Add `readonly weaponIconUrls = signal<Map<string, string>>(new Map())`

- [X] T015 [P] [US1] Add `loadWeaponIcon` method to src/app/features/data/weapons/weapons.component.ts
  - Check if weapon has hudIcon and not already cached
  - Call weaponService.getIconUrl()
  - Update weaponIconUrls signal with result

- [X] T016 [P] [US1] Add `getWeaponIconUrl` getter method to src/app/features/data/weapons/weapons.component.ts
  - Return cached URL or empty string from weaponIconUrls signal

- [X] T017 [P] [US1] Add `onWeaponImageError` handler to src/app/features/data/weapons/weapons.component.ts
  - Log warning for failed image load
  - Optionally remove from cache for retry

- [X] T018 [P] [US1] Add image rendering to src/app/features/data/weapons/weapons.component.html
  - In image column `<td>`, use @if to check `getWeaponIconUrl(weapon)`
  - If URL exists: render `<img>` with [src], [alt], class="w-12 h-12 object-contain", (error) binding
  - If no URL: render placeholder div with lucide-icon "image-off"

**Checkpoint**: At this point, User Story 1 should be fully functional - images render in both Weapons and Items tables

---

## Phase 4: User Story 2 - Weapon Class Display (Priority: P1)

**Goal**: Separate Class Tag (text) and Class (numeric) into two distinct columns

**Independent Test**: Navigate to Data > Weapons page, verify there are two separate columns: one for "Class Tag" (e.g., "assault", "sniper") and one for "Class" (e.g., 0, 1, 2).

### Implementation for User Story 2

- [X] T019 [US2] Update WEAPON_COLUMNS in src/app/features/data/weapons/weapon-columns.ts
  - Rename existing column: change `key: 'class'` to `key: 'classTag'`
  - Keep `field: 'classTag'` (correctly maps to tag value)
  - Update i18nKey from `weapons.columns.class` to `weapons.columns.classTag`
  - Update label to "Class Tag"
  - Add new column after classTag: `key: 'class'`, `field: 'class'`, i18nKey: `weapons.columns.class`
  - Set alignment to 'right' for numeric class values

- [X] T020 [US2] Verify WeaponColumnKey type in src/app/shared/models/weapons.models.ts includes both 'classTag' and 'class'

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - images render AND class columns are separate

---

## Phase 5: User Story 3 - Persist Scan Library (Priority: P1)

**Goal**: Selected scan library persists across application restarts

**Independent Test**: Open Settings > Scan Library, select a library, close and restart the application, verify the selected library is still active.

### Implementation for User Story 3

#### Rust Backend

- [X] T021 [P] [US3] Add `save_selected_directory` command to src-tauri/src/lib.rs
  - Accept Option<String> for directoryId (null to clear)
  - Store in Tauri plugin-store settings.json
  - Return Result<(), String>

- [X] T022 [P] [US3] Add `get_selected_directory` command to src-tauri/src/lib.rs
  - Load from Tauri plugin-store settings.json
  - Return Result<Option<String>, String>

- [X] T023 [US3] Register both commands in src-tauri/src/lib.rs invoke_handler

#### Frontend - DirectoryService

- [X] T024 [P] [US3] Add selected directory ID signal to src/app/features/settings/services/directory.service.ts
  - Add `private selectedDirectoryIdState = signal<string | null>(null)`
  - Add `readonly selectedDirectoryIdSig = this.selectedDirectoryIdState.asReadonly()`

- [X] T025 [P] [US3] Add selected directory computed signal to src/app/features/settings/services/directory.service.ts
  - Add `readonly selectedDirectorySig = computed(() => {...})`
  - Resolve ID to ScanDirectory object or null

- [X] T026 [P] [US3] Add `setSelectedDirectory` method to src/app/features/settings/services/directory.service.ts
  - Update selectedDirectoryIdState signal
  - Call saveSelectedDirectory to persist

- [X] T027 [P] [US3] Add `getSelectedDirectory` method to src/app/features/settings/services/directory.service.ts
  - Return selectedDirectorySig() value

- [X] T028 [P] [US3] Add `getFirstValidDirectory` method to src/app/features/settings/services/directory.service.ts
  - Return first directory from getValidDirectories() or null

- [X] T029 [P] [US3] Add `saveSelectedDirectory` private method to src/app/features/settings/services/directory.service.ts
  - Invoke 'save_selected_directory' Tauri command
  - Handle errors with console.log

- [X] T030 [P] [US3] Add `loadSelectedDirectory` private method to src/app/features/settings/services/directory.service.ts
  - Invoke 'get_selected_directory' Tauri command
  - Validate directory still exists in directoriesState
  - Clear selection if directory not found

- [X] T031 [US3] Update `initialize` method in src/app/features/settings/services/directory.service.ts
  - Call loadSelectedDirectory() after loading directories
  - Validates selected directory on startup

#### Frontend - Settings

- [X] T032 [P] [US3] Add `onDirectorySelect` method to src/app/features/settings/settings.component.ts
  - Call directoryService.setSelectedDirectory(directoryId)

- [X] T033 [P] [US3] Add `isDirectorySelected` method to src/app/features/settings/settings.component.ts
  - Return directoryService.selectedDirectoryIdSig() === directoryId

- [X] T034 [US3] Add radio button UI to src/app/features/settings/settings.component.html
  - For each directory row, add radio input
  - Bind [checked] to isDirectorySelected(dir.id)
  - Bind (change) to onDirectorySelect(dir.id)
  - Use DaisyUI radio-primary class

#### Frontend - Weapons/Items Integration

- [X] T035 [P] [US3] Update `loadWeapons` in src/app/features/data/weapons/weapons.component.ts
  - Get selected directory or fall back to first valid directory
  - Use selected directory's path for scanWeapons call

- [X] T036 [P] [US3] Update `loadItems` in src/app/features/data/items/items.component.ts
  - Get selected directory or fall back to first valid directory
  - Use selected directory's path for scanItems call

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, formatting, and validation

- [X] T037 [P] Run code formatting: `pnpm format:all`
- [X] T038 [P] TypeScript validation: `pnpm tsc --noEmit`
- [X] T039 Build verification: `pnpm build`
- [X] T040 Rust build verification: `cd src-tauri && cargo build`
- [X] T041 Manual testing per contracts/components.md checklist
  - Test Weapons page image rendering with valid images
  - Test Weapons page image rendering with missing/broken images
  - Test Items page image rendering with valid images
  - Test Items page image rendering with missing/broken images
  - Test Class Tag column shows text values (assault, sniper, etc.)
  - Test Class column shows numeric values (0, 1, 2)
  - Test both columns sort independently
  - Test filter by class works correctly
  - Test selection persists across app restart
  - Test Settings page shows current selection
  - Test changing selection updates immediately
  - Test removed directory clears selection
- [X] T042 Update docs-ai/PROGRESS.md with implementation summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational (i18n) phase completion
  - User Story 1, User Story 2, and User Story 3 are INDEPENDENT - can proceed in parallel
- **Polish (Phase 6)**: Depends on all implementation tasks being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Single file change, no dependencies
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent signal/service changes

### Within Each User Story

- i18n keys (T004, T005) MUST be added before HTML templates or component changes
- Rust commands (T006, T007, T021-T023) MUST be added before frontend service methods
- Frontend service methods MUST be added before component template updates
- Verification tasks (T041) after all implementation complete

### Parallel Opportunities

```bash
# Phase 1: All setup tasks can run in parallel
T002: Verify Weapons infrastructure
T003: Verify Items infrastructure

# Phase 2: Both i18n file edits can run in parallel
T004: Add English keys to en.json
T005: Add Chinese keys to zh.json

# Phase 3 (US1): Backend and frontend work can run in parallel
T006, T007: Rust backend commands
T008-T013: Items frontend implementation
T014-T018: Weapons frontend implementation

# Phase 4 (US2): Single file change, no parallel opportunities
T019: Update WEAPON_COLUMNS

# Phase 5 (US3): Rust and frontend work can run in parallel
T021-T023: Rust backend commands
T024-T031: DirectoryService implementation
T032-T034: SettingsComponent implementation
T035-T036: Weapons/Items integration

# Phase 6: Code quality tasks can run in parallel
T037: Run formatting
T038: Run TypeScript check
T039: Run Angular build
T040: Run Rust build
```

---

## Implementation Strategy

### MVP First (All User Stories - All P1 Priority)

All three user stories are Priority P1 and should be delivered together:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (i18n) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (image rendering)
4. Complete Phase 4: User Story 2 (class column fix)
5. Complete Phase 5: User Story 3 (selected directory)
6. **STOP and VALIDATE**: Test all three stories independently
7. Polish and deliver

### Incremental Delivery

With all stories being P1 priority, implement all together:

1. Setup + Foundational → i18n ready
2. Add all three user stories → Test all independently → All features work (MVP!)
3. Polish → Code quality and documentation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational (i18n) is done:
   - Developer A: Rust backend (T006, T007, T021, T022, T023)
   - Developer B: Items frontend (T008-T013)
   - Developer C: Weapons frontend (T014-T018)
   - Developer D: Settings/DirectoryService (T024-T034)
3. Team converges for integration (T035, T036) and final polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All three user stories are P1 priority - implement together
- Image loading uses lazy on-demand pattern with signal cache
- Class column fix is a critical data correctness bug
- Selected directory persistence uses Tauri plugin-store
- No service layer changes needed for US1 and US2 - component-level only
- US3 requires DirectoryService signal additions
- All i18n keys must exist in BOTH en.json and zh.json
- Image columns use fixed 64px width to prevent layout shift
