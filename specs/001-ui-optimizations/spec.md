# Feature Specification: UI Optimizations

**Feature Branch**: `001-ui-optimizations`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "进行一些 UI 样式优化: 1. 玩家的页面中搜索栏的 "搜索" 与输入框 会产生左右布局, 与同行的上下布局不一致. 2. 设置中的扫描目录是要做持久化存储, 现在每次启动都是空的不太科学. 3. 我期望所有数据(包括weapons, items, players, servers)默认都是在表格内垂直滚动, 尽可能不要全屏垂直滚动, 然后提供布局切换按钮(每个页面中)切换垂直滚动的范围"
**Additional Input**: "注意左侧的导航菜单也要拉长, 现在左侧为固定的 200px, 但是菜单列表看起来没有占满这个宽度"

## Clarifications

### Session 2026-01-16

- Q: The navigation menu is currently fixed at 200px but menu items don't fill this width. Should we increase the overall menu width, or fix the layout so items properly utilize the current 200px? → A: Keep 200px width and fix item layout to fill it properly (no width change)
- Q: User Story 1 mentions fixing the search bar layout on the players page specifically. Should this layout fix be applied only to the players page, or to all pages that have search bars for consistency? → A: Fix search bar layout on all pages with search functionality

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Search Bar Layout Consistency (Priority: P1)

As a user viewing pages with search functionality, I want the search bar elements to be arranged vertically so that the layout is consistent with other elements on the page and the interface appears professional and organized across all pages.

**Why this priority**: Visual consistency is fundamental to user experience and application professionalism. Inconsistent layouts can confuse users and reduce trust in the application, especially when similar controls appear differently across different pages.

**Independent Test**: Can be fully tested by opening pages with search bars (players, servers, etc.) and visually confirming that the search input and search button are stacked vertically, matching the layout of other controls on the same row. The fix is visual and does not affect functionality.

**Acceptance Scenarios**:

1. **Given** I am on any page with search functionality, **When** I view the search bar, **Then** the search input field and search button must be arranged vertically (one below the other)
2. **Given** I am on any page with search functionality, **When** I view the search bar, **Then** the vertical layout must be consistent with other control elements in the same row
3. **Given** I am on any page with search functionality, **When** I click the search button, **Then** the search functionality must work correctly regardless of layout
4. **Given** I navigate between different pages with search bars, **When** I compare their layouts, **Then** all search bars must have the same vertical arrangement

---

### User Story 2 - Persist Scan Directories (Priority: P1)

As a user configuring application settings, I want my configured scan directories to be saved and restored between application sessions so I don't have to manually re-enter them every time I start the application.

**Why this priority**: This is a critical usability improvement. Users expect settings to persist, and having to re-enter directories every time they start the application is inefficient and frustrating.

**Independent Test**: Can be fully tested by adding scan directories in settings, closing and restarting the application, and verifying that the directories are still present in the settings. The persistence mechanism does not depend on other stories.

**Acceptance Scenarios**:

1. **Given** I have added scan directories in the settings, **When** I close and restart the application, **Then** the previously configured scan directories must be automatically loaded and displayed
2. **Given** I modify or remove scan directories in settings, **When** I close and restart the application, **Then** the updated directory list must be preserved
3. **Given** I have no scan directories configured, **When** I start the application, **Then** the scan directory list must be empty
4. **Given** the application is restarted, **When** the scan directories are loaded, **Then** they must be immediately usable for scanning operations

---

### User Story 3 - Table-Only Vertical Scrolling (Priority: P2)

As a user viewing data tables (weapons, items, players, servers), I want the vertical scrolling to be limited to the table content area by default, with an option to expand scrolling to the full page, so I can view more data rows at once while keeping headers and navigation visible.

**Why this priority**: This improves data visibility and user productivity. Table-only scrolling allows users to see more data without losing context, while the toggle provides flexibility for different use cases and preferences.

**Independent Test**: Can be fully tested by opening any data table page (weapons, items, players, or servers) and confirming that the table scrolls within its container, and that the toggle button switches between table-only and full-page scrolling modes.

**Acceptance Scenarios**:

1. **Given** I am viewing a data table page (weapons, items, players, or servers), **When** the page loads, **Then** the table must be in table-only scrolling mode by default
2. **Given** I am in table-only scrolling mode, **When** I scroll vertically, **Then** only the table content must scroll while headers and navigation remain fixed
3. **Given** I am in table-only scrolling mode, **When** I click the layout toggle button, **Then** the scrolling mode must switch to full-page scrolling
4. **Given** I am in full-page scrolling mode, **When** I scroll vertically, **Then** the entire page must scroll including headers and navigation
5. **Given** I am in full-page scrolling mode, **When** I click the layout toggle button, **Then** the scrolling mode must switch back to table-only scrolling
6. **Given** I switch between scrolling modes, **When** I navigate away and return to the page, **Then** the last selected scrolling mode must be remembered and persisted across application sessions
7. **Given** I am viewing any data table page, **When** the page loads, **Then** there must be a visible toggle button to switch between scrolling modes

---

### User Story 4 - Adjust Left Navigation Menu Width (Priority: P2)

As a user navigating the application, I want the left navigation menu to properly utilize its fixed width of 200px so that the menu items fill the space completely and the interface appears balanced and professional.

**Why this priority**: Navigation menus are a primary interaction element, and improper width utilization can make the interface appear poorly designed and waste valuable screen real estate.

**Independent Test**: Can be fully tested by viewing any page and confirming that the menu items within the navigation container properly span the full 200px width, with appropriate padding/margins and no excessive unused space.

**Acceptance Scenarios**:

1. **Given** I am viewing any page in the application, **When** I look at the left navigation menu, **Then** the menu items must fill the full 200px width of the navigation container
2. **Given** I am viewing the left navigation menu, **When** I inspect the layout, **Then** there must be no excessive empty space within the menu item container
3. **Given** the navigation menu has multiple menu items, **When** I view the menu, **Then** the items must be aligned to utilize the available width effectively

---

### Edge Cases

- **What happens when** the scan directory path becomes invalid or is deleted from the file system? [The system should still display the configured path but indicate it is invalid or unavailable]
- **How does system handle** a very large number of scan directories that overflow the settings display? [The settings view should support scrolling within the directory list area to accommodate many directories]
- **What happens when** the table has no data rows in table-only scrolling mode? [The empty state should still be contained within the scrollable table area]
- **How does system handle** switching scrolling modes when the table is scrolled to the middle of content? [The scroll position should be preserved or adjusted appropriately when switching modes]
- **What happens when** the persistent storage for scan directories becomes corrupted or inaccessible? [The application should handle this gracefully, possibly by showing an empty list or displaying an appropriate error message]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST arrange the search input field and search button vertically on all pages with search functionality
- **FR-002**: System MUST maintain consistent vertical layout alignment between search bar elements and other controls on the same row across all pages with search bars
- **FR-003**: System MUST persist configured scan directories to local storage when modified by the user
- **FR-004**: System MUST restore previously configured scan directories from local storage when the application starts
- **FR-005**: System MUST display persisted scan directories in the settings interface after application restart
- **FR-006**: System MUST enable vertical scrolling within the table content area for all data tables (weapons, items, players, servers) by default
- **FR-007**: System MUST keep table headers and page navigation fixed while only table content scrolls in table-only mode
- **FR-008**: System MUST provide a visible toggle button on each data table page to switch between table-only and full-page scrolling modes
- **FR-009**: System MUST switch the scrolling behavior to full-page when the user toggles to full-page mode
- **FR-010**: System MUST preserve scroll position appropriately when switching between scrolling modes
- **FR-011**: System MUST persist the scrolling mode preference across application sessions
- **FR-012**: System MUST restore the last selected scrolling mode when a data table page is loaded after application restart
- **FR-013**: System MUST handle scan directories that become invalid or inaccessible without causing application errors
- **FR-014**: System MUST support scrolling within the scan directory list in settings when directories overflow the display area
- **FR-015**: System MUST adjust the layout of navigation menu items to utilize the full 200px width of the navigation container without changing the overall container width
- **FR-016**: System MUST ensure navigation menu items are properly aligned and spaced to fill the 200px width without excessive empty space

### Key Entities

- **Scan Directory**: A user-configured path to a directory that the application scans for game data. Contains path string, validity status, and display metadata.
- **Scrolling Mode**: A user preference indicating whether vertical scrolling is limited to the table content area (table-only mode) or applies to the entire page (full-page mode). Contains mode state and is persisted across application sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the correct vertical layout of search elements within 2 seconds of viewing any page with search functionality
- **SC-002**: Users can view their previously configured scan directories immediately upon application startup without any additional configuration steps
- **SC-003**: Users can view 50% more data rows at once in table-only scrolling mode compared to full-page scrolling mode on standard screen sizes
- **SC-004**: Users can switch between scrolling modes with a single click within 1 second
- **SC-005**: 100% of configured scan directories persist correctly across application restarts (measured by comparing configured directories before and after restart)
- **SC-006**: Table headers and navigation remain visible 100% of the time in table-only scrolling mode regardless of scroll position
- **SC-007**: 100% of scrolling mode preferences persist correctly across application restarts (measured by comparing scrolling mode before and after restart)
- **SC-008**: Navigation menu items utilize at least 90% of the navigation container width (200px) across all pages (measured by visual inspection)

## Assumptions

- The application has access to local storage mechanisms for persisting settings (file system or application-specific storage)
- Users will primarily view data tables on standard desktop or laptop screens where table-only scrolling provides meaningful benefits
- The current settings page already has a UI component for managing scan directories, and only persistence logic needs to be added
- All data table pages (weapons, items, players, servers) share a common table structure that can be uniformly updated with scrolling mode behavior
- The layout inconsistency on the players page is due to CSS or layout configuration rather than a deeper architectural issue

## Dependencies

- **FR-003 and FR-004** depend on the availability of a persistent storage mechanism in the application (this appears to be already available based on the existing settings storage mentioned in the problem)
- **FR-006 through FR-010** apply to four separate pages (weapons, items, players, servers) that may share common components or require individual implementation
- **FR-001 and FR-002** are independent and can be implemented separately from other stories
