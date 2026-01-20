# Feature Specification: Weapons Directory Scanner

**Feature Branch**: `001-weapons-directory-scanner`
**Created**: 2025-01-14
**Status**: Draft
**Input**: User description: "见 @docs-ai/rwr/ 下的目录文件, 我们现在的任务是要做一个 weapons 下的武器目录提取, 对应  @docs-ai/STATUS.md 中的 `本地游戏数据目录扫描` 与 `资源文件预览` 核心功能, 也是 `Workshop 内容解析` 的功能之一. 这个功能可能一次性难以做全, 我们后续会反复更新此功能. 这个功能最重要的就是扫描游戏目录, 提取游戏目录下的所有文件归纳并整理为表格在前端界面中渲染出来"

## Clarifications

### Session 2025-01-14

- Q: Which weapon attributes should be available as toggleable columns in the weapons table? → A: Minimal set (5-7 columns): key, name, class, magazine_size, kill_probability, retrigger_time; hide everything else in detail view (optimized for 800x600 resolution)
- Q: What should "advanced search" include beyond the unified fuzzy search box? → A: Range filters + exact match filters for all fields: class tag, suppressed (yes/no), can_respawn_with (yes/no), stance accuracy ranges
- Q: How should the advanced search filters be presented in the UI? → A: Collapsible/expandable "Advanced Search" panel (toggle button shows/hides filters)

### Session 2026-01-15

- Q: How to handle duplicate weapon keys during scan? → A: Keep all duplicates and report them (duplicateKeys list), do not drop or abort.
- Q: What visual feedback should table rows provide on hover? → A: Subtle background color change (hover:bg-base-200)
- Q: Should the weapon details modal be scrollable when content exceeds viewport? → A: Yes, modal content should scroll internally when too long
- Q: What should happen when no .weapon files are found? → A: Return empty list and show empty-state UI (no error).
- Q: What happens when a weapon references a missing template file? → A: Record an error and skip that weapon; continue scanning others.
- Q: How should the UI behave while scanning? → A: Show loading state but keep the page usable (no full lock).
- Q: What happens when template inheritance is circular? → A: Record an error and skip that weapon; continue scanning others.
- Q: What happens when a weapon file has malformed XML? → A: Record an error and skip that file; continue scanning others.
- Q: For duplicate weapon keys with different file paths, how should they be displayed? → A: Show all duplicate entries in the table (do not filter out), add a file path column displaying relative paths, with "Open in default editor" and "Copy path" icon buttons in the path column.
- Q: What should the file path column display relative to? → A: Relative to packages directory (e.g., `vanilla/weapons/ak47.weapon`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan and Display Weapons (Priority: P1)

User wants to view all weapons from their RWR game installation in a structured table format for reference and comparison purposes.

**Why this priority**: This is the core functionality - without the ability to scan and display weapons, no other features can work. This delivers immediate value by providing visibility into game weapon data.

**Independent Test**: Can be fully tested by selecting a game directory, triggering a scan, and verifying that all weapon files are extracted and displayed in a table with key attributes (name, class, damage, accuracy, etc.).

**Acceptance Scenarios**:

1. **Given** user has selected a valid RWR game directory, **When** user initiates a weapons scan, **Then** system displays a table containing all discovered weapons with their key attributes (key, name, class, magazine size, damage, accuracy)
2. **Given** user has an invalid or non-existent game directory selected, **When** user initiates a weapons scan, **Then** system displays a clear error message indicating the directory issue
3. **Given** a weapons scan is in progress, **When** scanning completes, **Then** system shows the total number of weapons found and displays the results table

---

### User Story 2 - Filter and Search Weapons (Priority: P2)

User wants to find specific weapons by filtering by class (assault, sniper, etc.) or searching by name to quickly locate weapons of interest.

**Why this priority**: While the raw data display (P1) provides value, filtering and search significantly improve usability for large weapon collections. This can be added after the base scanning works.

**Independent Test**: Can be tested by loading weapons data and applying filters/search, verifying that only matching weapons are displayed.

**Acceptance Scenarios**:

1. **Given** weapons table is displaying data, **When** user selects a weapon class filter (e.g., "sniper"), **Then** table updates to show only weapons in that class
2. **Given** weapons table is displaying data, **When** user types in the search box, **Then** table filters to show only weapons matching the search term (name, key, or other attributes)
3. **Given** user has active filters/search, **When** user clears the filter/search, **Then** table displays all weapons again
4. **Given** weapons table is displaying data, **When** user clicks the "Advanced Search" toggle button, **Then** a panel expands showing range filters and exact match filters
5. **Given** advanced search panel is open, **When** user applies range/exact filters, **Then** table updates to show only weapons matching all active filter criteria

---

### User Story 3 - View Weapon Details (Priority: P3)

User wants to click on a weapon row to see detailed information including all specification attributes, stance modifiers, and linked resources (models, sounds, textures).

**Why this priority**: Detailed view enhances understanding but is not required for basic weapon browsing. Can be implemented after filtering works well.

**Independent Test**: Can be tested by clicking a weapon row and verifying a detail panel/modal shows comprehensive weapon information.

**Acceptance Scenarios**:

1. **Given** weapons table is displaying data, **When** user clicks on a weapon row, **Then** a detail panel shows all weapon specifications, stance accuracies, modifier values, and linked resource files
2. **Given** weapon detail panel is open, **When** user views a weapon with chain variants, **Then** panel displays links to all variant weapons (next_in_chain)
3. **Given** weapon detail panel content exceeds viewport height, **When** user scrolls within the modal, **Then** content scrolls while modal header/footer remain accessible (max-h-80vh with overflow-y-auto)

---

### User Story 4 - Refresh and Re-scan (Priority: P4)

User wants to refresh the weapons data after game updates or mod changes without restarting the application.

**Why this priority**: Convenience feature that improves workflow but doesn't block initial delivery.

**Independent Test**: Can be tested by modifying weapon files externally and triggering refresh to verify new data appears.

**Acceptance Scenarios**:

1. **Given** weapons table is displaying data, **When** user clicks the refresh button, **Then** system re-scans the directory and updates the table with current data
2. **Given** a scan is already in progress, **When** user clicks refresh, **Then** system prevents duplicate scans and shows appropriate status

---

### Edge Cases

- What happens when the weapons directory contains no weapon files?
- What happens when weapon files have malformed XML or missing required attributes?
- What happens when weapon files reference non-existent template files (file attribute)?
- What happens when chain references (next_in_chain) create circular dependencies?
- What happens when the same weapon key appears multiple times (duplicate keys)?
- What happens when game directory path contains unicode or special characters?
- What happens when user has limited permissions to read the game directory?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST scan the game's `packages/*/weapons/` directory and discover all `.weapon` files
- **FR-001a**: When no `.weapon` files are found, system MUST return an empty list and show a clear empty-state message (no error)
- **FR-002**: System MUST parse each weapon XML file and extract key attributes including: weapon key, name, class (tag), magazine size, damage (kill_probability), accuracy values, and retrigger_time
- **FR-003**: System MUST resolve weapon template inheritance by following `file` references recursively and merging attributes from parent templates
  - **FR-003a**: If a referenced template file is missing, system MUST log an error, skip that weapon, and continue scanning others
  - **FR-003b**: If template inheritance is circular, system MUST log an error, skip that weapon, and continue scanning others
- **FR-004**: System MUST display scanned weapons in a responsive table format supporting 800x600 minimum resolution, with default columns: key, name, class, magazine_size, kill_probability, retrigger_time
- **FR-004a**: System MUST provide visual hover feedback on table rows using subtle background color change (hover:bg-base-200)
- **FR-004b**: System MUST support column visibility toggle allowing users to show/hide any of the default columns, with settings persisted across sessions
- **FR-004c**: System MUST include a file path column displaying paths relative to the packages directory (e.g., `vanilla/weapons/ak47.weapon`)
- **FR-004d**: System MUST provide "Open in default editor" icon button in the file path column that opens the weapon file in the system's default text editor
- **FR-004e**: System MUST provide "Copy path" icon button in the file path column that copies the full absolute file path to clipboard
- **FR-005**: System MUST handle XML parsing errors gracefully by skipping malformed files and logging errors for user review
- **FR-006**: System MUST detect and report duplicate weapon keys (same key appearing multiple times)
  - **FR-006a**: System MUST keep all duplicate entries in results and only mark/report duplicates (no dropping, no abort)
- **FR-007**: System MUST support filtering weapons by class tag (assault, sniper, smg, etc.)
- **FR-008**: System MUST support unified fuzzy text search across weapon name, key, and class attributes
- **FR-008a**: System MUST support advanced search filters presented in a collapsible/expandable panel, including: range filters (damage, fire rate, magazine size, encumbrance, price, stance accuracies), exact match filters (class tag, suppressed yes/no, can_respawn_with yes/no)
- **FR-009**: System MUST cache scan results in memory to avoid re-parsing on filter/search operations
- **FR-010**: System MUST display the total count of scanned weapons
- **FR-011**: System MUST provide a manual refresh button to trigger re-scanning
- **FR-012**: System MUST persist the last used game directory path for convenience

### Key Entities

- **Weapon**: Represents a single weapon definition with attributes such as key (unique identifier), name (display name), class (category tag: assault/sniper/smg/etc.), magazine_size (ammo capacity), kill_probability (damage potential), accuracy values per stance, retrigger_time (fire rate), chain variants (other modes of same weapon), and file_path (relative path from packages directory, e.g., `vanilla/weapons/ak47.weapon`)
- **Weapon Template**: A base weapon definition that other weapons inherit from via the `file` attribute, allowing shared attributes and reducing duplication
- **Weapon Variant**: A weapon mode linked via `next_in_chain` that represents the same weapon in a different configuration (e.g., assault mode vs sniper mode)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full weapons scan and see results within 3 seconds for a typical game installation (100-200 weapons)
- **SC-002**: System successfully parses 100% of valid weapon files without crashing
- **SC-003**: Table remains responsive (filter/search updates within 500ms) with 500+ weapons loaded
- **SC-004**: 95% of users can locate a specific weapon by name or filter within 10 seconds of first use
- **SC-005**: System correctly identifies and reports all duplicate weapon keys in the scanned data

## Assumptions

1. Game directory is selected and configured through existing Settings feature (partially complete per STATUS.md)
2. Default scan path is `packages/*/weapons/` relative to game resources directory
3. All weapon files use UTF-8 encoding (as per XML declaration in reference files)
4. Template inheritance depth is limited to reasonable levels (assume max 10 levels to prevent infinite recursion)
5. Users primarily use the English language interface; Chinese translations will be added post-MVP
6. Workshop content follows the same directory structure as vanilla game content

## Out of Scope

The following features are explicitly excluded from this initial implementation:

- Editing or modifying weapon files (read-only access)
- Scanning non-weapon game resources (vehicles, items, factions, etc.)
- Visual preview of weapon models or textures
- Comparison view for multiple weapons side-by-side
- Exporting weapon data to external formats (CSV, JSON, etc.)
- Automatic detection of game directory installation
- Workshop subscription management and content downloading
- Weapon damage calculations or simulators
