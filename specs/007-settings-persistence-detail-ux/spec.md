## Clarifications

### Session 2025-01-19

- Q: What should be the width and background of the detail side panel? → A: 75% width with minimum 400px, solid background color (not transparent)
- Q: Should the detail panel background adapt to theme changes? → A: Yes, must use theme-aware background colors that respond to light/dark mode switching
- Q: How should file paths be displayed in the detail panel? → A: File paths must occupy their own dedicated line with word-wrap to prevent horizontal scrolling
- Q: Where should images be positioned in the detail side panel, and what size should they be? → A: Top-centered placement, 200-300px wide, with subtle shadow/border

---

# Feature Specification: Settings Persistence and Detail View UX Improvements

**Feature Branch**: `007-settings-persistence-detail-ux`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "1. 现在设置中的扫描目录存在问题, 这个设置应该用户配置后下次启动直接读取, 而不是每次应用打开都要重配. 2. 缺少翻译key: hotkeys.game_path. 3. 对于 weapons 和 items 的详情, 我们数据量很大, 思考非弹窗的交互, 并且 File Path 在详情中需要独占一行, 否则路径过长会导致出现水平滚动条."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persistent Scan Directory Settings (Priority: P1)

As a user, I want my configured scan directories to persist between application sessions so that I don't need to reconfigure them every time I open the application.

**Why this priority**: This is a critical usability issue. Users expect their settings to be saved automatically, and having to reconfigure directories on every startup creates significant friction and reduces the usefulness of the scanning feature.

**Independent Test**: Can be fully tested by configuring scan directories in settings, closing the application, reopening it, and verifying that the configured directories are still present without requiring reconfiguration.

**Acceptance Scenarios**:

1. **Given** a fresh application installation, **When** a user adds one or more scan directories in settings, **Then** those directories should be saved to persistent storage
2. **Given** previously saved scan directories, **When** the user launches the application, **Then** the saved directories should be automatically loaded and displayed in the settings page
3. **Given** saved scan directories, **When** a user adds, removes, or modifies directories, **Then** the changes should be immediately persisted
4. **Given** saved scan directories, **When** a user validates a directory that fails validation, **Then** the directory configuration should remain saved but display an error state
5. **Given** corrupted or missing persisted settings, **When** the application launches, **Then** it should gracefully default to an empty directory list without crashing

---

### User Story 2 - Non-Modal Detail View for Weapons and Items (Priority: P2)

As a user, I want to view detailed information about weapons and items in a non-modal interface so that I can efficiently browse through large datasets without the overhead of opening/closing modal dialogs.

**Why this priority**: With large datasets (potentially hundreds or thousands of items), modal dialogs create inefficient navigation patterns. Users need to quickly scan through multiple items without repeated modal open/close cycles. This improves productivity for power users and researchers.

**Independent Test**: Can be fully tested by clicking on various weapons/items in the table and verifying that details appear in a non-modal interface (e.g., side panel, split view, or expandable rows), and that navigation between items works smoothly without modal overhead.

**Acceptance Scenarios**:

1. **Given** a table of weapons or items, **When** a user clicks on a row, **Then** detailed information should appear in a non-modal interface adjacent to or inline with the table
2. **Given** an open detail view, **When** a user clicks on a different row, **Then** the detail view should update to show the new item's information without closing and reopening
3. **Given** an open detail view, **When** a user navigates using keyboard (arrow keys), **Then** the detail view should update to reflect the currently selected row
4. **Given** a detail view displaying file paths, **When** the file path is long, **Then** it should wrap to multiple lines or be truncated with ellipsis, not cause horizontal scrolling
5. **Given** a detail view, **When** a user clicks outside the detail area or on the same row again, **Then** the detail view should close (if closable) or the row should deselect
6. **Given** mobile or narrow screen width, **When** a detail view is opened, **Then** it should adapt to the available space (e.g., full-width overlay, accordion expansion)

---

### User Story 3 - Complete Translation Coverage (Priority: P3)

As a user, I want all UI text to be properly translated so that the application feels complete and professional in my chosen language.

**Why this priority**: This is a minor polish issue. While it doesn't affect functionality, missing translations create an impression of incompleteness and unprofessionalism. However, it has minimal impact on core user workflows.

**Independent Test**: Can be fully tested by navigating to the hotkeys page and verifying that the game path field label displays correctly in all supported languages (English, Chinese).

**Acceptance Scenarios**:

1. **Given** the hotkeys settings page, **When** a user views the page in English, **Then** the game path field should have the label "Game Path"
2. **Given** the hotkeys settings page, **When** a user views the page in Chinese, **Then** the game path field should have the appropriate Chinese translation

---

### Edge Cases

**Settings Persistence**:
- What happens when the persisted settings file becomes corrupted or unreadable?
  - System should default to empty directory list and log an error
- What happens when a previously configured directory no longer exists on the filesystem?
  - Directory should still appear in settings but show an error state (e.g., "Directory not found")
- What happens when users have duplicate directory entries?
  - System should prevent adding duplicates and show appropriate error message
- What happens when settings are migrated between different application versions?
  - System should handle backward compatibility or gracefully reset to defaults

**Detail View UX**:
- What happens when a user has a very small screen (e.g., mobile device)?
  - Detail view should use full-screen overlay or accordion-style expansion
- What happens when file paths are extremely long (over 200 characters)?
  - Paths should wrap or truncate with hover tooltip for full path
- What happens when an item has no data for certain fields?
  - Empty fields should display as "-" or "Not available" consistently
- What happens when a user quickly clicks multiple rows in succession?
  - Detail view should only display the last clicked item, debouncing rapid clicks
- What happens when an item image is missing or fails to load?
  - Display a fallback placeholder icon or image with consistent styling across items

## Requirements *(mandatory)*

### Functional Requirements

**Settings Persistence (FR-001 to FR-005)**:
- **FR-001**: System MUST persist user-configured scan directories to non-volatile storage immediately after any add, modify, or remove operation
- **FR-002**: System MUST automatically load persisted scan directory settings when the application launches
- **FR-003**: System MUST validate persisted directories on load and display appropriate status indicators (valid/invalid/error)
- **FR-004**: System MUST handle corrupted or missing persisted settings gracefully by defaulting to an empty directory list
- **FR-005**: System MUST prevent duplicate directory entries from being added to the configuration

**Detail View UX (FR-006 to FR-016)**:
- **FR-006**: System MUST display weapon and item details in a non-modal interface when a row is clicked
- **FR-007**: System MUST update the detail view content when a different row is selected without closing and reopening
- **FR-008**: System MUST display file paths in a way that prevents horizontal scrolling (wrap to multiple lines or truncate with tooltip)
- **FR-009**: System MUST support keyboard navigation (arrow keys) to update detail view for adjacent rows
- **FR-010**: System MUST adapt detail view layout for different screen sizes (desktop, tablet, mobile)
- **FR-011**: System MUST ensure the detail view does not obscure the table content when open (e.g., side panel, split view, or inline expansion)
- **FR-012**: Detail side panel MUST be 75% width with a minimum width of 400px to ensure adequate content space
- **FR-013**: Detail side panel MUST use a solid (non-transparent) background color matching the current theme to prevent text overlap issues
- **FR-014**: Detail side panel background color MUST respond dynamically to light/dark theme switching (using CSS variables like `--b1` or `--b2`)
- **FR-015**: System MUST display item images at the top of the detail panel, centered, with width between 200-300px and a subtle shadow or border for visual separation
- **FR-016**: System MUST handle missing images gracefully with a fallback placeholder or icon

**Translation (FR-017)**:
- **FR-017**: System MUST provide translation key `hotkeys.game_path` in all supported languages (en, zh)

### Key Entities

- **Scan Directory Configuration**:
  - Directory path (string)
  - Validation status (valid, invalid, error)
  - Last validated timestamp
  - Item count (number of items found during last scan)

- **Detail View State**:
  - Currently selected item identifier
  - Detail view visibility state (open/closed)
  - Detail view position/layout (side panel, inline, overlay based on screen size)
  - Panel width: 75% of viewport width with minimum 400px
  - Panel background: Solid theme-aware color (using CSS variables like `oklch(var(--b2))` for proper theme switching support)
  - Item image: Displayed at top of panel, centered, 200-300px width, with subtle shadow/border
  - Image fallback: Placeholder or icon when image is unavailable

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure scan directories once and have those settings persist across at least 100 application restart cycles without data loss
- **SC-002**: Application launches with persisted settings loaded within 2 seconds on startup
- **SC-003**: 100% of configured scan directories are accurately restored after application restart (no data loss or corruption)
- **SC-004**: Users can browse through 50+ items in detail view without closing and reopening dialogs, reducing click count by at least 50% compared to modal approach
- **SC-005**: File paths of any length (up to 255 characters) display without causing horizontal scrollbars in the detail view
- **SC-006**: All UI text in the hotkeys page displays correctly in both English and Chinese without missing translation keys
- **SC-007**: Detail view updates to show new item content within 100 milliseconds after row selection change
- **SC-008**: Item images load within 500 milliseconds and display correctly with fallback placeholder when unavailable

---

## Notes

### Assumptions

1. **Settings Storage**: The application will use an existing persistent storage mechanism (Tauri plugin-store or localStorage) that is already available in the codebase
2. **Detail View Implementation**: The non-modal interface will be implemented as a side panel or split view, which is a common pattern for master-detail interfaces in desktop applications
3. **File Path Handling**: File paths will be displayed using text wrapping or CSS truncation with tooltip for full path on hover
4. **Screen Size Adaptation**: Responsive design will handle desktop (>1024px), tablet (768-1024px), and mobile (<768px) layouts
5. **Migration Strategy**: No migration path is needed from existing settings as this is a new feature

### Technical Context (for planning phase only)

This feature extends the existing RWR Toolbox application with:
- Settings persistence using Tauri's plugin-store for cross-platform key-value storage
- Angular component updates for non-modal detail view (likely using a split pane or side drawer component)
- i18n translation updates in Transloco configuration files

The current modal-based detail view is implemented in:
- `src/app/features/data/weapons/weapons.component.html`
- `src/app/features/data/items/items.component.html`

Scan directory settings are managed in:
- `src/app/features/settings/settings.component.ts`
- `src/app/features/settings/services/directory.service.ts`
