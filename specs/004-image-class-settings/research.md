# Research: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Feature**: 004-image-class-settings
**Date**: 2026-01-17
**Status**: Complete

## Overview

This research document captures all technical decisions and findings for implementing the three bug fixes/features in this sprint.

---

## Issue 1: Image Column Rendering

### Problem Statement

Weapons and Items tables have image columns defined, but images are not rendering correctly. The backend provides `hudIcon` field and a `get_texture_path` Tauri command, but the frontend may not be using them correctly.

### Current Implementation Analysis

**Backend (Rust)**:
- `weapons.rs` line 641-679: `get_texture_path` command exists and properly navigates from weapon file to textures folder
  - Input: `weapon_file_path`, `icon_filename`
  - Output: Absolute path to texture file or error
- `items.rs`: No equivalent `get_texture_path` command exists for items

**Frontend**:
- `weapon.service.ts` line 185-203: `getIconUrl()` method exists
  - Uses `invoke('get_texture_path')` command
  - Converts result with `convertFileSrc()` for Tauri asset URL
- `weapon-columns.ts` line 11-18: Image column exists
  - `field: 'key' as keyof Weapon` - **This is wrong, should use a computed property**
  - Column is defined but template may not be using the service method

### Root Cause

The image column has `field: 'key'` which doesn't map to any image data. The template needs to call `getIconUrl()` method asynchronously and cache the result.

### Decision

**Approach**: Add a signal-based image URL cache in the component

1. Add a `Map<string, string>` signal to cache weapon icons
2. Create a `loadWeaponIcon(weapon: Weapon)` method that populates the cache
3. Call this method in template with `@for` or use `async` pipe
4. Show loading state/fallback while image loads

**Alternatives Considered**:
- ❌ Load all images upfront: Would block table rendering with ~200 items
- ❌ Use `field: 'hudIcon'` directly: Template can't access Tauri commands
- ✅ Lazy load on demand with cache: Best performance and UX

**For Items**:
- Need to add `get_texture_path` command to items.rs (same pattern as weapons)
- Add `getIconUrl()` method to item.service.ts

---

## Issue 2: Weapon Class Column Display Bug

### Problem Statement

The "Class" column currently displays `classTag` (from `<tag name="assault"/>`) instead of the actual `class` attribute (from `<specification class="0"/>`). These must be separated into two distinct columns.

### Current Implementation Analysis

**Backend (Rust)**:
- `weapons.rs` line 22-26: Correctly separates `tag` (string) and `class` (i32)
```rust
#[serde(rename = "tag")]
pub tag: String,        // From <tag name="..."/>
#[serde(rename = "class")]
pub class: i32,         // From <specification class="..."/>
```

**Frontend Model** (`weapons.models.ts`):
- Line 24-25: Correctly defines both fields:
```typescript
classTag: string;   // Weapon category/class tag
class?: number;     // Weapon class value from <specification class="..."/>
```

**Frontend Columns** (`weapon-columns.ts`):
- Line 35-42: **THE BUG IS HERE**
```typescript
{
    key: 'class',
    field: 'classTag',  // ❌ WRONG! Should be 'class' for numeric class
    label: 'Class',
    i18nKey: 'weapons.columns.class',
    ...
}
```

### Root Cause

The column definition has `field: 'classTag'` but the key is `'class'`. This causes the column to display the tag name instead of the numeric class value.

### Decision

**Approach**: Rename existing column and add new column

1. Rename current "Class" column to "Class Tag" (change `key: 'class'` → `key: 'classTag'`)
2. Add new "Class" column with `key: 'class'` and `field: 'class'`
3. Update i18n keys to reflect both columns:
   - `weapons.columns.classTag` → "Class Tag" / "类别标签"
   - `weapons.columns.class` → "Class" / "类别"

**Alternatives Considered**:
- ❌ Just fix the field mapping: Would be confusing to users who expect "Class" to mean tag
- ✅ Separate columns with clear names: Users see both "Class Tag" (assault) and "Class" (0)

**Column Order**:
- Keep both columns adjacent for comparison
- Class Tag first (text, more recognizable), then Class (numeric)

---

## Issue 3: Scan Library Selection Persistence

### Problem Statement

Users must reselect scan libraries on every app launch. The DirectoryService persists directory lists but lacks a "selected directory" feature.

### Current Implementation Analysis

**DirectoryService** (`directory.service.ts`):
- Line 36-47: Has state signals for directories
- Line 382-415: `loadDirectories()` and `saveScanDirs()` methods
  - Persists directory list to Tauri store
  - No "selected directory" concept exists
- Line 80-86: `initialize()` loads directories but doesn't restore selection

**Settings Component**:
- Line 56-57: `ngOnInit()` calls `directoryService.loadDirectories()`
- No code to restore/track selected directory

### Root Cause

The system persists the list of available directories but doesn't track which one the user selected for scanning.

### Decision

**Approach**: Add `selectedDirectoryId` signal to DirectoryService

1. Add `selectedDirectoryId` signal to DirectoryService
2. Add `setSelectedDirectory(id)` and `getSelectedDirectory()` methods
3. Persist to Tauri store using `save_selected_directory` / `get_selected_directory` commands
4. Update DirectoryService.initialize() to restore selection
5. Update Weapons/Items components to use selected directory instead of "first valid"

**Data Model Changes**:
- Add `selectedDirectoryId: string` to service state
- Add to Tauri store schema

**Alternatives Considered**:
- ❌ Store selected directory path only: Can't detect if directory was removed/re-added
- ✅ Store directory ID: Survives path changes, more robust

**Edge Cases**:
- Selected directory no longer exists → Fall back to first valid directory
- No directories configured → Show empty state / prompt user
- All directories invalid → Show validation errors

---

## Implementation Phases Summary

### Phase 0: Research (This Document)
- ✅ Analyzed existing image loading implementation
- ✅ Identified column mapping bug
- ✅ Designed selected directory persistence approach

### Phase 1: Data Model & Contracts
- Define updated column configuration
- Define selected directory state model
- Define component interfaces for image loading

### Phase 2: Implementation (tasks.md)
- Add `get_texture_path` for items
- Update weapon-columns.ts with both columns
- Add image URL cache to components
- Add selected directory to DirectoryService
- Update templates for image rendering
- Add i18n keys

---

## Technical Constraints

1. **800×600 Resolution**: Image columns must use fixed width (e.g., 64px) to avoid layout shift
2. **Signal-based State**: All new state must use signals, not BehaviorSubject
3. **i18n Required**: All new UI text must have en.json + zh.json keys
4. **Tauri Protocol**: Use `convertFileSrc()` for local file access

---

## Open Questions Resolved

| Question | Answer | Impact |
|----------|--------|--------|
| How to load images without blocking rendering? | Lazy load with signal cache | Async loading, better UX |
| Should Class Tag be renamed? | Yes, to avoid confusion | Clear column labels |
| How to persist selected directory? | Store ID in Tauri settings store | Survives app restart |
| Should items have get_texture_path? | Yes, same pattern as weapons | Consistent image loading |
