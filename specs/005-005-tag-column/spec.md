# Feature Specification: Tag Column Rename and Data Reading Fix

**Feature Branch**: `005-tag-column-fix`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "把 class tag 就改为 tag, 不要显示 class tag, 有歧义, 并且现在的 tag 值没有正确读取"

Translation: "Change 'class tag' to just 'tag', don't display 'class tag' as it's ambiguous, and the current tag value is not being read correctly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Tag Column Data Reading Bug (Priority: P1)

As a user viewing the Weapons table, I need to see the correct weapon tag values (e.g., "assault", "smg", "sniper") instead of missing/incorrect data.

**Why this priority**: This is a data bug - the tag column shows incorrect/missing data, making the feature unusable. The root cause is a field name mismatch between Rust backend (sends `tag`) and TypeScript frontend (expects `classTag`).

**Independent Test**: Can be fully tested by scanning any weapon directory and verifying that the Tag column displays the correct weapon category values (assault, smg, sniper, etc.) from the XML `<tag name="..."/>` elements.

**Acceptance Scenarios**:

1. **Given** a valid game directory with weapon files, **When** the user scans weapons, **Then** the Tag column should display the correct weapon category (e.g., "assault", "smg", "sniper") parsed from `<tag name="..."/>` XML elements
2. **Given** a weapon like AK47 with `<tag name="assault"/>`, **When** the weapon is scanned, **Then** the Tag column should show "assault"
3. **Given** a weapon like M24 with `<tag name="sniper"/>`, **When** the weapon is scanned, **Then** the Tag column should show "sniper"

---

### User Story 2 - Rename "Class Tag" to "Tag" (Priority: P2)

As a user, I need the column labeled simply as "Tag" instead of "Class Tag" to avoid confusion with the separate "Class" numeric column.

**Why this priority**: Naming clarity - "Class Tag" is confusing because there's also a "Class" column. Users may not understand the difference between "Class Tag" (weapon category like assault/smg) and "Class" (numeric value like 0, 1, 2).

**Independent Test**: Can be fully tested by opening the Weapons table and verifying the column header shows "Tag" in English and "标签" in Chinese.

**Acceptance Scenarios**:

1. **Given** the Weapons table is displayed, **When** the user views the column headers, **Then** the column should be labeled "Tag" (English) or "标签" (Chinese), not "Class Tag"
2. **Given** the column visibility settings, **When** the user opens column toggle options, **Then** the column should be listed as "Tag" not "Class Tag"
3. **Given** the advanced search filters, **When** the user selects tag filter, **Then** the filter should reference "Tag" not "Class Tag"

---

### Edge Cases

- What happens when a weapon has no `<tag>` element in XML? (Current behavior: empty tag field)
- What happens when tag value is not in expected list (assault, smg, sniper, etc.)? (Current behavior: display raw value)
- What happens to existing user preferences for column visibility with old "classTag" key? (Need migration)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: TypeScript `Weapon` interface MUST use `tag` field name to match Rust serialization
- **FR-002**: `WeaponColumnKey` type MUST include `'tag'` instead of `'classTag'`
- **FR-003**: Column configuration MUST label the column as "Tag" (EN) / "标签" (ZH)
- **FR-004**: i18n translation keys MUST use `weapons.columns.tag` instead of `weapons.columns.classTag`
- **FR-005**: Existing localStorage column visibility preferences for "classTag" MUST be migrated to "tag" on load
- **FR-006**: Advanced filters MUST reference `tag` field for filtering

### Key Entities

- **Weapon**: Game weapon data with `tag: string` field (from `<tag name="..."/>` XML element) and `class?: number` field (from `<specification class="..."/>` attribute)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tag column displays correct weapon category values for all weapons (100% data accuracy)
- **SC-002**: Column header shows "Tag" (EN) / "标签" (ZH) in all UI locations
- **SC-003**: Existing user column visibility preferences are migrated without loss
- **SC-004**: Tag filter in advanced search works correctly with new field name

## Root Cause Analysis

**Bug**: Tag values not displaying correctly in Weapons table

**Root Cause**: Field name mismatch between backend and frontend:
- Rust serializes as `tag` (`#[serde(rename = "tag")] pub tag: String`)
- TypeScript expects `classTag` (`classTag: string`)

**Solution**: Rename TypeScript field from `classTag` to `tag` to match Rust serialization and simplify naming per user request.

---

## Implementation Notes

### Files to Modify

1. **TypeScript Models**:
   - `src/app/shared/models/weapons.models.ts`:
     - Rename `classTag: string` to `tag: string` in `Weapon` interface
     - Update `WeaponColumnKey` type from `'classTag'` to `'tag'`
     - Update `AdvancedFilters.classTag` to `tag`

2. **Column Configuration**:
   - `src/app/features/data/weapons/weapon-columns.ts`:
     - Update column key from `'classTag'` to `'tag'`
     - Update i18n key to `weapons.columns.tag`

3. **Component Logic**:
   - `src/app/features/data/weapons/weapons.component.ts`:
     - Update `selectedClassTag` signal/variable to `selectedTag`
     - Update `onClassTagFilter` to `onTagFilter`
     - Update `availableClassTags` to `availableTags`
     - Add migration logic for localStorage column visibility

4. **HTML Template**:
   - `src/app/features/data/weapons/weapons.component.html`:
     - Update filter dropdown binding from `selectedClassTag` to `selectedTag`
     - Update event handler from `onClassTagFilter` to `onTagFilter`

5. **i18n Translations**:
   - `src/assets/i18n/en.json`:
     - Change `weapons.columns.classTag` key to `weapons.columns.tag`
     - Update value to "Tag"
   - `src/assets/i18n/zh.json`:
     - Change `weapons.columns.classTag` key to `weapons.columns.tag`
     - Update value to "标签"
