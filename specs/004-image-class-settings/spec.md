# Feature Specification: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Feature Branch**: `004-image-class-settings`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "1. 现在 weapons 和 items 的图片的列有点问题, 有图片列, 但没有正确展示与渲染, 从 weapon 开始, 见 @docs-ai/rwr/ak47.weapon 与 @docs-ai/rwr/vest_exo.carry_item , 都是从 weapons, items 同级的 texture 中寻找图片路径 2. weapon 中的 `class="0"` 这个属性很重要, 不要与 `<tag name="assault" />` 混淆, 前端这个 class 与 tag 都要列渲染出来. 3. 现在 settings 页面中的 scan library 需要持久化存储, 不要每次打开重新设置"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Image Column Rendering (Priority: P1)

As a user viewing the Weapons or Items data tables, I want to see item thumbnails/icons displayed correctly in the image column so that I can visually identify items at a glance.

**Why this priority**: Image columns exist in both tables but are not rendering correctly. This breaks user expectations and reduces the usability of the data tables. The image data (`hudIcon` field) exists in the backend but the frontend is not displaying it properly.

**Independent Test**: Navigate to Data > Weapons or Data > Items page, verify that the image column displays weapon/item icons loaded from the texture files in the same directory as the weapon/item files.

**Acceptance Scenarios**:

1. **Given** I am on the Weapons page with data loaded, **When** I view the image column, **Then** I see weapon icons (e.g., hud_ak47.png) loaded from the textures directory
2. **Given** I am on the Items page with data loaded, **When** I view the image column, **Then** I see item icons (e.g., hud_exo_vest.png) loaded from the textures directory
3. **Given** an image file is missing or cannot be loaded, **When** the image column renders, **Then** a fallback placeholder or alt text is displayed
4. **Given** I navigate to different pages, **When** I return to the Weapons/Items pages, **Then** the images continue to load correctly

---

### User Story 2 - Display Weapon Class Attribute (Priority: P1)

As a user analyzing weapon data, I want to see both the weapon class tag (e.g., "assault") and the weapon specification class (e.g., "0") as separate columns so that I can understand the complete weapon classification.

**Why this priority**: The current implementation has a critical bug where the "Class" column displays `classTag` instead of the actual `class` attribute from `<specification class="..."/>`. This causes data inconsistency and confusion since the XML has two distinct attributes that serve different purposes:
- `<tag name="assault"/>` - Weapon category/class tag
- `<specification class="0"/>` - Weapon class value (0, 1, 2, etc.)

**Independent Test**: Navigate to Data > Weapons page, verify there are two separate columns: one for "Class Tag" (e.g., "assault", "sniper") and one for "Class" (e.g., 0, 1, 2).

**Acceptance Scenarios**:

1. **Given** I am on the Weapons page, **When** I view the columns, **Then** I see both "Class Tag" and "Class" columns as separate entities
2. **Given** the weapon AK47 has `<tag name="assault"/>` and `<specification class="0"/>`, **When** I view its row, **Then** Class Tag shows "assault" and Class shows "0"
3. **Given** I filter or sort by Class Tag, **When** the results render, **Then** only the class tag is used for filtering/sorting
4. **Given** I filter or sort by Class, **When** the results render, **Then** only the numeric class value is used for filtering/sorting

---

### User Story 3 - Persist Scan Library Selection (Priority: P1)

As a user configuring scan libraries in the settings page, I want my selected scan library to persist across application restarts so that I don't need to reconfigure it every time I open the application.

**Why this priority**: Users currently need to reselect their scan library each time they open the app. This is poor UX and breaks the expected behavior of settings pages. The DirectoryService already has persistence mechanisms, but the selected/active scan library may not be properly stored or restored.

**Independent Test**: Open Settings > Scan Library, select a library, close and restart the application, verify the selected library is still active.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I select a scan library from the dropdown, **Then** the selection is immediately saved to persistent storage
2. **Given** I have selected a scan library, **When** I close and reopen the application, **Then** the same scan library is still selected
3. **Given** I navigate to Weapons or Items pages, **When** the data loads, **Then** it uses the persistently stored scan library selection
4. **Given** no scan library has been previously selected, **When** I open the application for the first time, **Then** a sensible default is used (e.g., first valid library or prompt user to select)

---

### Edge Cases

- What happens when a weapon/item has no `hudIcon` value? (Show placeholder icon)
- What happens when the image file referenced in `hudIcon` doesn't exist? (Show broken image icon or alt text)
- What happens when `class` attribute is missing from weapon XML? (Show "N/A" or empty)
- What happens when all scan libraries are removed? (Prompt user to add a new library)
- What happens when the previously selected scan library becomes invalid? (Show error and prompt user to select another)
- What happens when texture directory structure differs from expected? (Search in known locations or show fallback)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display weapon/item images in the image column using the `hudIcon` field
- **FR-002**: System MUST load images from texture files in the same directory as the weapon/item XML files
- **FR-003**: System MUST provide a fallback display when image file is missing or cannot be loaded
- **FR-004**: System MUST display "Class Tag" column showing `<tag name="..."/>` value (e.g., "assault", "sniper")
- **FR-005**: System MUST display "Class" column showing `<specification class="..."/>` value (e.g., 0, 1, 2)
- **FR-006**: System MUST ensure Class Tag and Class columns are independently sortable and filterable
- **FR-007**: System MUST persist the selected scan library to durable storage (Tauri settings store)
- **FR-008**: System MUST restore the selected scan library when the application starts
- **FR-009**: System MUST validate that the restored scan library still exists and is valid
- **FR-010**: System MUST update weapon/item scanning to use the persisted scan library selection

### Key Entities

- **Weapon/Item Image**: References texture file path for thumbnail display
  - Attributes: hudIcon filename (e.g., "hud_ak47.png"), source directory path
- **Weapon Class Tag**: Weapon category from `<tag name="..."/>` element
  - Attributes: tag name string (e.g., "assault", "sniper", "smg")
- **Weapon Class**: Numeric class value from `<specification class="..."/>` attribute
  - Attributes: class number (e.g., 0, 1, 2)
- **Scan Library Selection**: User's preferred scan library for data loading
  - Attributes: library ID, library path, validation status, last selected timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Images render correctly in Weapons and Items tables (100% of items with hudIcon)
- **SC-002**: Image loading uses correct relative path from weapon/item directory to textures directory
- **SC-003**: Class Tag and Class columns display correct data (verified against XML source)
- **SC-004**: Scan library selection persists across application restarts (tested with close/reopen)
- **SC-005**: Weapons and Items pages load data using the persisted scan library
- **SC-006**: No data loss or corruption when scan library becomes unavailable
- **SC-007**: User can change scan library and the new selection is immediately persisted

## Assumptions

1. Weapon/Item XML files contain `<hud_icon filename="..."/>` with the icon filename
2. Texture files are located in a predictable location relative to weapon/item files (e.g., same directory or subdirectory)
3. Weapon XML has both `<tag name="..."/>` and `<specification class="..."/>` attributes
4. DirectoryService has methods to add/remove/validate directories but may need a "selected directory" feature
5. Tauri settings store is available for persistent storage
6. Existing weapon/item models already have the necessary fields (class, hudIcon, sourceDirectory)

## Dependencies

- Existing Weapons and Items component infrastructure
- Weapon and Item data models with class and hudIcon fields
- DirectoryService for scan library management
- Tauri settings store for persistence
- Image loading mechanism in Angular (may need custom asset URL handling)

## Out of Scope

- Image optimization or caching
- Advanced image manipulation (zoom, crop, etc.)
- Changing the texture directory structure
- Scan library synchronization across multiple devices
- Multiple simultaneous scan library selections
