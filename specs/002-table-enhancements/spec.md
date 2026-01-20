# Feature Specification: Data Table Enhancements (Sorting, Column Toggle, Items Tab)

**Feature Branch**: `002-table-enhancements`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "变更需求, 调整内容如下: 1. 根据准则文档, 修改之前非data目录下的 toSignal 写法 2. 现在已有武器数据的列表呈现, 需要支持可见列切换以展示所有列数据, 列需要可排序: 升序/降序切换 3. 现在已有武器数据的列表呈现, 我们需要支持在此页面增加 Tab 切换, 新增一个物品数据 Tab (Items, 不止护甲)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Column Visibility Toggle (Priority: P1)

User wants to customize which columns are visible in the weapons table to focus on relevant attributes and reduce visual clutter.

**Why this priority**: This is the most immediately valuable enhancement - users can customize their view without changing the underlying data. It improves usability for different use cases (e.g., comparing damage vs comparing mobility stats).

**Independent Test**: Can be fully tested by toggling column visibility on/off and verifying the table updates immediately without needing to re-scan or reload data.

**Acceptance Scenarios**:

1. **Given** user is viewing the weapons table with all columns visible, **When** user opens the column visibility menu and deselects "Magazine" column, **Then** the Magazine column disappears from the table and other columns expand to fill the space
2. **Given** user has hidden some columns, **When** user refreshes the page or navigates away and back, **Then** the column visibility settings are restored to the user's previous selection
3. **Given** user is viewing the weapons table, **When** user opens the column visibility menu, **Then** all available columns are listed with checkboxes showing their current visibility state
4. **Given** user has hidden all columns except one, **When** user attempts to hide the last visible column, **Then** system prevents hiding the last column and shows a message indicating at least one column must remain visible

---

### User Story 2 - Column Sorting (Priority: P2)

User wants to sort the weapons table by any column in ascending or descending order to quickly find highest/lowest values and compare weapons.

**Why this priority**: Sorting adds significant analytical capability but builds on the existing table structure. Users can discover patterns (e.g., which weapons have highest damage, lowest encumbrance) without manual scanning.

**Independent Test**: Can be tested by clicking column headers and verifying the weapons list reorders correctly, with visual indicators showing sort direction.

**Acceptance Scenarios**:

1. **Given** user is viewing the weapons table, **When** user clicks on any column header, **Then** the table sorts by that column in ascending order and displays an ascending sort indicator
2. **Given** user has sorted a column in ascending order, **When** user clicks the same column header again, **Then** the table sorts by that column in descending order and displays a descending sort indicator
3. **Given** user has sorted by one column, **When** user clicks a different column header, **Then** the table sorts by the new column and the previous sort is cleared
4. **Given** user is viewing sorted data, **When** user applies filters or search, **Then** the filtered results maintain the current sort order
5. **Given** table contains weapons with identical sort values, **When** user sorts by that column, **Then** items with equal values maintain their original relative order (stable sort)

---

### User Story 3 - Items Data Tab (Priority: P3)

User wants to view items data (including armor, equipment, and other game items) alongside weapon data in a tabbed interface to have comprehensive game equipment information in one place.

**Why this priority**: This adds a new data type but follows the same pattern as weapons. It's valuable for users who want to browse all equipment but requires additional backend scanning and data modeling work.

**Independent Test**: Can be tested by switching between Weapons and Items tabs and verifying each tab shows the correct data type with appropriate columns and functionality.

**Acceptance Scenarios**:

1. **Given** user is on the Data page, **When** user sees the tab navigation, **Then** two tabs are visible: "Weapons" and "Items"
2. **Given** user is viewing the Weapons tab, **When** user clicks on the "Items" tab, **Then** the view switches to show items data in a similar table format
3. **Given** user is viewing the Items tab, **When** user has configured a game directory, **Then** the table displays all items found in the game directory with their key attributes
4. **Given** user switches from Weapons tab to Items tab and back, **Then** each tab maintains its own filter, search, sort, and column visibility state
5. **Given** no item files are found during scan, **When** user views the Items tab, **Then** a clear empty-state message is displayed indicating no items data was found

---

### User Story 4 - Code Quality Improvements (Priority: P4)

Developers want to ensure all RxJS observable-to-signal conversions follow the project's established patterns and guidelines for consistency and maintainability.

**Why this priority**: This is a technical improvement that doesn't affect end users directly but ensures code quality and consistency across the codebase. It can be done in parallel with user-facing features.

**Independent Test**: Can be verified by code review to ensure all non-data directory signal conversions use the approved pattern (toSignal() with explicit teardown logic).

**Acceptance Scenarios**:

1. **Given** there are components outside the data directory using observables, **When** converting to signals, **Then** the conversion uses toSignal() with proper cleanup/teardown logic
2. **Given** the codebase has been updated, **When** running the application, **Then** there are no memory leaks from unsubscribed observables
3. **Given** the refactoring is complete, **When** reviewing the code, **Then** all signal conversions follow the same pattern established in the data directory components

---

### Edge Cases

- What happens when the user tries to sort by a column containing null/undefined values?
- What happens when sorting by string columns with mixed case or special characters?
- What happens when column visibility settings become corrupted in storage?
- What happens when the game directory contains no item files but has weapon files?
- What happens when switching tabs while a scan is in progress?
- What happens when the user resizes the browser window to very small widths with many columns visible?
- What happens when sorting a large dataset (500+ rows) - does the UI remain responsive?
- What happens when the same column exists in both Weapons and Items tabs with different data types?

## Requirements *(mandatory)*

### Functional Requirements

#### Column Visibility Toggle

- **FR-001**: System MUST provide a column visibility control (dropdown menu or toggle panel) accessible from the weapons table
- **FR-002**: System MUST allow users to show or hide any available column independently
- **FR-003**: System MUST prevent hiding all columns - at least one column must remain visible at all times
- **FR-004**: System MUST persist column visibility settings across page refreshes and sessions
- **FR-005**: System MUST restore column visibility settings when the user returns to the page

#### Column Sorting

- **FR-006**: System MUST allow users to sort by any visible column by clicking the column header
- **FR-007**: System MUST support three sort states per column: unsorted → ascending → descending → unsorted (cycle)
- **FR-008**: System MUST display a visual indicator (arrow icon) showing which column is currently sorted and in which direction
- **FR-009**: System MUST maintain sort order when applying filters or search
- **FR-010**: System MUST use stable sort algorithm to preserve relative order of equal items
- **FR-011**: System MUST handle columns with null/undefined values by treating them as "less than" any defined value (they appear at the end for ascending, beginning for descending)
- **FR-012**: System MUST sort string columns case-insensitively

#### Items Data Tab

- **FR-013**: System MUST provide tab navigation to switch between Weapons and Items data views
- **FR-014**: System MUST scan the game directory for item files (including .armor, .item, and other equipment files) in addition to weapon files
- **FR-015**: System MUST display items data in a table format consistent with the weapons table
- **FR-016**: System MUST support independent filter, search, sort, and column visibility state for each tab
- **FR-017**: System MUST display appropriate columns for items data (key, name, type/protection/mobility depending on item class, etc.)
- **FR-018**: System MUST show empty-state message when no item files are found during scan
- **FR-019**: System MUST prevent duplicate scans when switching between tabs

#### Code Quality

- **FR-020**: System MUST use consistent observable-to-signal conversion pattern (toSignal with teardown) across all components outside the data directory
- **FR-021**: System MUST ensure proper cleanup of observables to prevent memory leaks
- **FR-022**: System MUST follow established signal patterns from the data directory components

### Key Entities

- **Weapon**: Existing entity representing game weapons (from Feature 001)
- **Item**: Represents a piece of equipment/item in the game (including armor, consumables, and other items) with attributes such as key (unique identifier), name (display name), class/type (category: armor, item, etc.), and various class-specific attributes (e.g., protection, mobility for armor; other properties for different item types), encumbrance (weight), price (cost), and file_path (location in game directory)
- **Column Definition**: Represents a table column with attributes: key (unique identifier), label (display name), field (data field name), alignment (left/right/center), sortable (boolean), visible (boolean), alwaysVisible (boolean - cannot be hidden)
- **Sort State**: Represents current sorting state with attributes: columnKey (which column is sorted), direction ('asc' | 'desc' | null)
- **Tab State**: Represents active tab and per-tab state for filters, search, sort, and column visibility

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle column visibility in under 2 clicks (open menu + toggle checkbox)
- **SC-002**: Column sort operations complete within 500ms for datasets up to 500 items
- **SC-003**: Tab switches complete instantly (under 100ms) without re-scanning data
- **SC-004**: 95% of users can successfully customize column visibility on first attempt without referring to documentation
- **SC-005**: 95% of users can successfully sort by any column on first attempt (intuitive column header click interaction)
- **SC-006**: Column visibility and sort settings are correctly restored 100% of the time across page refreshes
- **SC-007**: Memory leaks are eliminated - observable cleanup is verified through code review and testing
- **SC-008**: Items tab displays all items from a typical game installation within 3 seconds of initial scan

## Assumptions

1. Game directory structure follows a similar pattern for item files as weapon files (packages/*/{items,armor}/*.{item,armor})
2. Item files use a similar XML structure to weapon files
3. The existing scan_weapons command can be extended or a new scan_items command can be created
4. Column visibility and sort state are stored per-tab (independent between Weapons and Items)
5. The project has established guidelines for toSignal usage in the data directory that should be followed
6. Item attributes include at minimum: key, name, class/type, and various class-specific attributes (e.g., protection and mobility for armor items), encumbrance, and price
7. User's display resolution supports viewing at least 5-6 columns simultaneously without horizontal scrolling

## Clarifications

### Session 2026-01-15

- Q: How should page scrolling work with the table layout? → A: Search/filter controls and table layout use stable layout (fixed positioning). Only the table content area scrolls; search bar and filters remain visible at the top without scrolling away. The page itself does not scroll - only the table viewport scrolls internally.
- Q: Should the new tab be specific to armor data or more general? → A: The tab should be "Items/物品" (not just Armor/护甲) to support all types of game items including armor, equipment, and other consumables, not just armor files.

## Out of Scope

The following features are explicitly excluded from this initial implementation:

- Custom column ordering (drag and drop to rearrange columns)
- Multi-column sorting (sort by multiple columns simultaneously)
- Exporting table data to external formats (CSV, JSON, etc.)
- Column width customization by user
- Advanced filtering (e.g., "greater than X", "between X and Y") - basic search only
- Editing items or weapon data (read-only access)
- Visual preview of items or weapon 3D models
- Comparison view between multiple items side-by-side
- Batch operations on multiple selected rows
- Additional equipment tabs (vehicles, etc.) - only Weapons and Items included
