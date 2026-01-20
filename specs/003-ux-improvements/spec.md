# Feature Specification: UX Improvements

**Feature Branch**: `003-ux-improvements`  
**Created**: 2026-01-16  
**Status**: Draft  
**Input**: User description: "1. 家页面中, 搜索的 label 与 input 被挤压成"搜索"与"搜索用户名输入框"一行,下一行是"搜索按钮"了, 与同行的其他搜索项不一致. 需要保持一致. 2. 数据页面中, 增加武器和物品的图片显示, 显示键名左侧(也就是第一列). 3. 设置页面的路径列表需要持久化存储. 4. 设置需要增加亮色暗色主题切换, 默认自动切换(根据系统). 移除游戏路径设置, 因为多目录功能使其变得不必要"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Search Bar Layout Consistency (Priority: P1)

**User Journey**: 
User navigates to Players page to search for players by username. They expect search input field and search button to follow same layout pattern as other pages in application.

**Why this priority**: 
Inconsistent UI layout creates confusion and makes application feel unpolished. Users need to learn different interaction patterns for different pages, increasing cognitive load.

**Independent Test**: 
Open Players page and verify that:
- Search label and input field are on same line
- Search button is on next line below input
- Layout matches pattern used on other pages (Servers, Weapons, Items)

**Acceptance Scenarios**:

**Scenario 1.1**: User searches for a player
- **Given**: User is on Players page with empty search input
- **When**: User types username in search input field and clicks search button
- **Then**: Search results display filtered players by username

**Scenario 1.2**: User clears search
- **Given**: User has searched and results are displayed
- **When**: User clicks clear search button or clears input field
- **Then**: All players are displayed again

**Scenario 1.3**: Layout consistency check
- **Given**: User has visited other pages with search functionality
- **When**: User navigates to Players page
- **Then**: Search bar layout matches pattern from other pages (label and input on same line, button on next line)

---

### User Story 2 - Add Item Images to Data Page (Priority: P2)

**User Journey**:
User navigates to Data page to browse weapons and items. They want to see visual representations of items alongside their names to improve recognition and user experience.

**Why this priority**: 
Visual representations (images) help users quickly identify items without needing to read names. This improves user experience by providing both text and visual elements, making data browsing more engaging and efficient.

**Independent Test**: 
Open Data page and navigate between Weapons and Items tabs. Verify that:
- Items are displayed with images in first column
- Images are properly aligned and sized
- Layout remains consistent with Weapons page (other columns maintain their position)

**Acceptance Scenarios**:

**Scenario 2.1**: User browses items with images
- **Given**: User is on Data page with Items tab active
- **When**: User views items table
- **Then**: Each item displays with its image in left-most column

**Scenario 2.2**: User searches for an item
- **Given**: User has many items displayed
- **When**: User types search term in search field
- **Then**: Items list filters to show matching items, with images visible

**Scenario 2.3**: Tab navigation preserves state
- **Given**: User is on Weapons tab and has applied filters or scroll position
- **When**: User switches to Items tab
- **Then**: Items tab loads with its own data but maintains consistent layout (same columns)

---

### User Story 3 - Remove Game Path Setting & Use Scan Directories (Priority: P1)

**User Journey**: 
User opens Settings page and sees that game path setting is no longer displayed. They use multi-directory scan feature instead. Any existing gamePath data is migrated to first scan directory.

**Why this priority**: 
Game path setting is redundant with multi-directory scan feature. Removing it reduces UI clutter and prevents confusion about which setting to use. Migration ensures existing user data is preserved.

**Independent Test**: 
1. Open Settings page with existing gamePath configured
2. Verify game path input field is removed from UI
3. Verify scan directories list is displayed
4. Verify existing gamePath has been migrated to first scan directory
5. Add/remove directories and verify persistence

**Acceptance Scenarios**:

**Scenario 3.1**: Existing gamePath migrates to scan directories
- **Given**: User has gamePath configured (single directory setup)
- **When**: User opens Settings page after feature update
- **Then**: GamePath is migrated to first scan directory
- **Then**: Scan directories list shows one directory (the migrated path)
- **Then**: Migration is one-time operation; gamePath is fully removed from storage

**Scenario 3.2**: GamePath UI element removed
- **Given**: User has migrated to multi-directory system
- **When**: User views Settings page
- **Then**: Game path input field and validation button are not visible
- **Then**: Scan directories section is prominent and clearly labeled

**Scenario 3.3**: Components use first valid directory
- **Given**: User has multiple scan directories configured (some valid, some invalid)
- **When**: User navigates to Data page (Weapons/Items)
- **Then**: System uses first valid directory for scanning
- **Then**: Scanning works correctly and data is displayed

**Scenario 3.4**: Directory validation shows status
- **Given**: User has multiple directories in Settings
- **When**: User views directory list
- **Then**: Each directory shows validation status (valid/invalid/pending)
- **Then**: Visual indicators clearly communicate directory health

**Scenario 3.5**: GamePath backward compatibility maintained during transition
- **Given**: User has components depending on gamePath (Weapons/Items pages)
- **When**: Feature updates remove gamePath
- **Then**: Components continue to function without errors
- **Then**: Data loads correctly from scan directories

---

### User Story 4 - Add Light/Dark Theme Switching (Priority: P2)

**User Journey**:
User opens application and wants to switch between light and dark themes. They expect theme preference to be remembered and applied automatically across all pages.

**Why this priority**:
Modern applications offer theme switching as a standard accessibility and user preference feature. Users may work in different lighting conditions or simply prefer a particular visual style. Automatic theme detection based on system settings provides best default experience.

**Independent Test**:
1. Open Settings page
2. Check current theme (light or dark)
3. Toggle to other theme
4. Navigate to other pages (Players, Servers, Data, Settings)
5. Verify that selected theme is applied consistently
6. Close and reopen application
7. Verify that theme preference is restored and applied automatically

**Acceptance Scenarios**:

**Scenario 4.1**: User toggles theme
- **Given**: User is on Settings page with current theme set to light
- **When**: User selects dark theme from theme dropdown
- **Then**: Theme switches to dark mode across application
- **Then**: Visual feedback (e.g., icon, text indicator) shows selected theme

**Scenario 4.2**: Theme persists across restarts
- **Given**: User has selected dark theme
- **When**: User closes and reopens application
- **Then**: Dark theme is automatically applied on startup

**Scenario 4.3**: System default theme
- **Given**: User hasn't set any theme preference
- **When**: User opens application for first time
- **Then**: System detects OS theme setting (light/dark) and applies it as default automatically
- **Then**: Theme matches user's system preference

**Scenario 4.4**: Theme applies to all pages
- **Given**: User has selected a theme
- **When**: User navigates to any page (Players, Servers, Data, Settings, etc.)
- **Then**: Theme is consistently applied across all components and pages

---

### User Story 5 - Restore Hotkeys Menu Entry (Priority: P1)

**User Journey**:
User opens the application and wants to access the Hotkeys configuration page. They expect to see a menu entry in the sidebar that allows them to navigate to the hotkeys management interface.

**Why this priority**:
The hotkeys feature and route (`/hotkeys`) already exist and are fully functional, but the menu entry was removed during Feature 001 simplification. Restoring the menu entry makes this feature discoverable and accessible to users without requiring direct URL navigation.

**Independent Test**:
1. Open the application
2. View the sidebar menu
3. Verify that "Hotkeys" menu entry is visible between "Data" and "Settings"
4. Click on the Hotkeys menu entry
5. Verify navigation to `/hotkeys` route
6. Verify keyboard shortcut `Ctrl+5` navigates to Hotkeys page
7. Verify Settings is now `Ctrl+6` and About is now `Ctrl+7`

**Acceptance Scenarios**:

**Scenario 5.1**: Hotkeys menu entry visible in sidebar
- **Given**: User has opened the application
- **When**: User views the sidebar navigation menu
- **Then**: Hotkeys menu entry is displayed between Data and Settings
- **Then**: Menu entry shows keyboard icon and "Ctrl+5" shortcut

**Scenario 5.2**: Navigation via menu click
- **Given**: User is on any page in the application
- **When**: User clicks on the Hotkeys menu entry
- **Then**: Application navigates to `/hotkeys` route
- **Then**: Hotkeys component loads and displays hotkey configuration interface

**Scenario 5.3**: Navigation via keyboard shortcut
- **Given**: User is on any page in the application
- **When**: User presses `Ctrl+5`
- **Then**: Application navigates to `/hotkeys` route
- **Then**: Hotkeys page becomes active

**Scenario 5.4**: Updated shortcuts for subsequent menu items
- **Given**: User has memorized keyboard shortcuts from previous version
- **When**: User presses `Ctrl+6`
- **Then**: Application navigates to Settings page (previously Ctrl+5)
- **When**: User presses `Ctrl+7`
- **Then**: Application navigates to About page (previously Ctrl+6)

---

## Edge Cases

### Edge Case 1: Empty Scan Directory List
**What happens**: User has no scan directories configured
**How system handles**: Show empty state with message and "Add Directory" button
**User expectation**: See clear call-to-action and guidance

### Edge Case 2: Search with Empty Results
**What happens**: User searches for non-existent data
**How system handles**: Display "no results found" message with clear visual indicator
**User expectation**: Understand that search returned nothing and can try again

### Edge Case 3: Theme Detection Failure
**What happens**: System cannot detect OS theme setting
**How system handles**: Default to light theme
**User expectation**: Application works with light theme, no error or crash

### Edge Case 4: Image Loading Failure
**What happens**: Item image fails to load or doesn't exist
**How system handles**: Display fallback placeholder or icon instead
**User expectation**: Still see item name and other data

### Edge Case 5: Persistence Write Failure
**What happens**: Application cannot save directories to storage
**How system handles**: Show error message and keep current state in memory
**User expectation**: Understand that persistence failed but app remains functional

### Edge Case 6: Rapid Theme Switching
**What happens**: User quickly toggles theme multiple times
**How system handles**: Apply latest preference immediately, ignore intermediate states
**User expectation**: Application responds immediately to last selection

### Edge Case 7: All Scan Directories Invalid
**What happens**: User has configured directories but all are invalid
**How system handles**: Show "no valid directories" message in Data page
**User expectation**: Clear error message with guidance to add valid directory

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide consistent search bar layout across all pages with search functionality
- **FR-002**: System MUST display visual representations (images) for items in Data page alongside their names
- **FR-003**: System MUST save and restore user-configured scan directories across application sessions
- **FR-004**: System MUST migrate existing gamePath to first scan directory and remove gamePath from code and storage
- **FR-005**: System MUST allow users to manually switch between light and dark themes and remember their preference
- **FR-006**: System MUST automatically detect and apply system theme preference as default
- **FR-007**: System MUST display directory validation status (valid/invalid/pending) in Settings page
- **FR-008**: Data pages (Weapons/Items) MUST use first valid directory from scan directories list for scanning
- **FR-009**: System MUST display Hotkeys menu entry in sidebar navigation between Data and Settings
- **FR-010**: Hotkeys menu entry MUST use keyboard icon and `Ctrl+5` keyboard shortcut
- **FR-011**: Settings menu shortcut MUST be updated to `Ctrl+6` and About menu shortcut MUST be updated to `Ctrl+7`

### Non-Functional Requirements

- **NFR-001**: Maintain backward compatibility with existing features during gamePath removal
- **NFR-002**: Performance should not degrade with theme switching
- **NFR-003**: Theme switching should be smooth without layout shifts
- **NFR-004**: Image loading should not block table rendering (progressive enhancement)

---

## Key Entities *(include if feature involves data)*

### Entity: Search Component
- **Purpose**: Represents a user interface element for searching and filtering data
- **Attributes**: label text, input field, search button, clear button
- **Relationships**: N/A (UI component only)

### Entity: Scan Directory
- **Purpose**: Represents a user-configured directory path for scanning game data
- **Attributes**: path, status, display name, last scanned at, item count, weapon count
- **Relationships**: User settings (N:1 user can have multiple directories)
- **Lifecycle**: Created → Validated (valid/invalid) → Scanned → Removed
- **Notes**: Replaces single gamePath setting with multiple directory support

### Entity: Theme Preference
- **Purpose**: Represents user's visual theme preference
- **Attributes**: theme type (light/dark), last updated timestamp, automatic default flag
- **Relationships**: User settings (N:1 user has one preferred theme)
- **Notes**: Auto-detected system theme is initial value if user hasn't set preference

### Entity: System Theme Detection
- **Purpose**: Represents operating system's theme preference
- **Attributes**: theme type (light/dark), OS platform, detection timestamp
- **Relationships**: Theme Preference (N:1 system default initializes preference on first use)
- **Notes**: Only queried once on first application launch

### Entity: Item Image
- **Purpose**: Visual representation of an item (weapon or inventory item)
- **Attributes**: image path, alt text, loading state, error fallback
- **Relationships**: Item data (N:1 item has 0 or 1 image)
- **Notes**: Displayed in first column of Items and Weapons tables

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search on Players page using a consistent layout pattern
- **SC-002**: Search label and input field are on same line
- **SC-003**: Search button is on line below input
- **SC-004**: Layout matches pattern used on other pages
- **SC-005**: Items table displays images in first column
- **SC-006**: Images are properly aligned and consistently sized
- **SC-007**: Layout matches Weapons table structure
- **SC-008**: Users can add scan directories in Settings
- **SC-009**: Directories persist across application restarts
- **SC-010**: Directories can be removed
- **SC-011**: Changes are saved immediately
- **SC-012**: Existing gamePath data is migrated to first scan directory
- **SC-013**: GamePath UI element is removed from Settings page
- **SC-014**: Components using gamePath continue to work without errors
- **SC-015**: Users can manually switch between light and dark themes
- **SC-016**: Theme preference is persisted across sessions
- **SC-017**: System automatically detects OS theme preference on first launch
- **SC-018**: Selected theme is consistently applied across all pages
- **SC-019**: Theme switching is immediate (no application restart required)
- **SC-020**: Directory status indicators show validation results clearly
- **SC-021**: Hotkeys menu entry is visible in sidebar navigation
- **SC-022**: Hotkeys menu entry is positioned between Data and Settings menu items
- **SC-023**: Hotkeys menu entry displays keyboard icon
- **SC-024**: Hotkeys menu entry shows `Ctrl+5` keyboard shortcut
- **SC-025**: Clicking Hotkeys menu entry navigates to `/hotkeys` route
- **SC-026**: Pressing `Ctrl+5` navigates to Hotkeys page
- **SC-027**: Settings menu shortcut is `Ctrl+6`
- **SC-028**: About menu shortcut is `Ctrl+7`

---

## Clarifications

### Session 2026-01-16

- **Q1**: Should gamePath be completely removed or preserved for backward compatibility? → **A**: Completely remove gamePath from code and storage, with migration to first scan directory
- **Q2**: How should components depending on gamePath get game directory? → **B**: Select first valid directory from scan directories list
- **Q3**: How should game path validation button work with multi-directory feature? → **C**: Use directory status indicators consistent with existing DirectoryService validation logic
- **Q4**: Where should the Hotkeys menu entry be positioned in the sidebar navigation? → **A**: Between Data and Settings menu items with `Ctrl+5` shortcut (shifting Settings to `Ctrl+6` and About to `Ctrl+7`)

---

## Dependencies & Constraints

### D-001: Search Bar Layout Consistency
- **Depends on**: Existing search components on Players, Servers, Weapons, Items pages
- **Constraints**: Maintain backward compatibility with search functionality
- **Blockers**: None

### D-002: Item Image Display
- **Depends on**: Existing Weapons/Items table structure and item data model
- **Constraints**: Maintain performance with image loading
- **Blockers**: None

### D-003: Scan Directory Persistence
- **Depends on**: Existing DirectoryService and SettingsService
- **Constraints**: Must handle storage errors gracefully
- **Blockers**: None

### D-004: Game Path Removal
- **Depends on**: Existing gamePath in SettingsService and components using it (Weapons/Items)
- **Constraints**: Must perform one-time migration to avoid data loss
- **Blockers**: None

### D-005: Theme Switching
- **Depends on**: Existing DaisyUI theme system
- **Constraints**: Theme switching must be smooth
- **Blockers**: Platform-specific code may be required for OS theme detection

### D-006: Hotkeys Menu Entry Restoration
- **Depends on**: Existing Hotkeys component and route (`/hotkeys`), existing i18n translations (menu.hotkeys, menu.hotkeys_desc)
- **Constraints**: Must update keyboard shortcuts for Settings (Ctrl+6) and About (Ctrl+7)
- **Blockers**: None

---

## Assumptions

### A-001: Existing Theme System
- Assume DaisyUI theme system is already implemented in project
- Assume theme switching functionality exists but may not have persistence or system detection
- Assume themes are light and dark variants

### A-002: Image Storage
- Assume item images are stored as assets or embedded data
- Images may be game assets from scan directories
- Images should be reasonable size (e.g., 32x32 or 48x48 pixels)

### A-003: Storage Technology
- Assume Tauri plugin-store is available for persistence (used in 001-ui-optimizations)
- SettingsService already exists for managing settings
- Store keys: `scan_directories`, `theme_preference`, `theme_preference_auto_default`

### A-004: System Theme Detection
- OS-level theme detection may require platform-specific code (macOS, Windows, Linux)
- Fallback to light theme if detection unavailable
- Detection happens once on application startup

### A-005: Item Images Availability
- Not all items may have images available
- System should handle missing images gracefully with fallbacks
- Image display should be optional based on data availability

### A-006: GamePath Migration
- Existing gamePath exists in Tauri store (from previous single-directory setup)
- Migration should run once when feature is first deployed
- Migration should handle case where gamePath is empty or invalid

---

## Notes

- Search bar layout consistency is a visual UX improvement with no backend changes required
- Item image display requires frontend changes only (no backend storage needed unless storing image paths)
- Scan directory persistence leverages existing DirectoryService which already communicates with Tauri plugin-store
- Theme switching requires both frontend (UI component + service) and backend (Tauri commands for persistence)
- System theme detection may require additional Tauri commands for platform information
- GamePath removal is breaking change for existing code that depends on it, so migration path is critical
