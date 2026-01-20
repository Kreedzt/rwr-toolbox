# Component Contracts: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Feature**: 004-image-class-settings
**Date**: 2026-01-17

## Overview

This document defines the interface contracts for all components modified in this feature.

---

## 1. WeaponsComponent Updates

### New Signals

```typescript
readonly weaponIconUrls: Signal<Map<string, string>>
```

**Purpose**: Cache resolved image URLs for weapons to avoid repeated Tauri invocations.

**Lifecycle**:
- Initialized as empty Map on component creation
- Populated asynchronously as rows render
- Cleared on component destruction (automatic with Angular)

### New Methods

```typescript
/**
 * Load weapon icon URL and cache the result
 * @param weapon Weapon to load icon for
 */
loadWeaponIcon(weapon: Weapon): Promise<void>

/**
 * Get cached icon URL for a weapon
 * @param weapon Weapon to get icon for
 * @returns Icon URL or empty string if not loaded/failed
 */
getWeaponIconUrl(weapon: Weapon): string
```

**Contract**:
- `loadWeaponIcon` is idempotent - calling multiple times for same weapon is safe
- `getWeaponIconUrl` returns empty string if icon not loaded or failed
- Image load errors are logged but do not throw exceptions

### Template Usage

```html
<td class="w-16">
    @if (getWeaponIconUrl(weapon)) {
        <img
            [src]="getWeaponIconUrl(weapon)"
            [alt]="weapon.name"
            class="w-12 h-12 object-contain"
            (error)="onImageError($event, weapon)"
        />
    } @else {
        <div class="w-12 h-12 bg-base-300 flex items-center justify-center">
            <lucide-icon name="image-off" class="w-6 h-6 opacity-30" />
        </div>
    }
</td>
```

**Contract**:
- Image container is fixed width (64px) to prevent layout shift
- Loading state shows nothing (will fill in when URL is cached)
- Error state shows placeholder icon
- Images use `object-contain` to preserve aspect ratio

---

## 2. ItemsComponent Updates

### New Signals

```typescript
readonly itemIconUrls: Signal<Map<string, string>>
```

Same contract as WeaponsComponent.

### New Methods

```typescript
/**
 * Load item icon URL and cache the result
 * @param item Item to load icon for
 */
loadItemIcon(item: GenericItem): Promise<void>

/**
 * Get cached icon URL for an item
 * @param item Item to get icon for
 * @returns Icon URL or empty string if not loaded/failed
 */
getItemIconUrl(item: GenericItem): string
```

Same contract as WeaponsComponent, adapted for items.

---

## 3. WeaponService Updates

### New Method

```typescript
/**
 * Get icon URL for a weapon using Tauri's convertFileSrc
 * @param weapon Weapon with hudIcon property
 * @returns Icon URL for use in <img> src attribute, or empty string if no icon
 */
async getIconUrl(weapon: Weapon): Promise<string>
```

**Contract**:
- Returns empty string if `weapon.hudIcon` is null/undefined
- Invokes `get_texture_path` Tauri command with `weapon.sourceFile` and `weapon.hudIcon`
- Converts absolute path to Tauri asset URL using `convertFileSrc()`
- Logs errors but never throws - returns empty string on failure
- Can be called multiple times for same weapon (caller should cache)

---

## 4. ItemService Updates

### New Method

```typescript
/**
 * Get icon URL for an item using Tauri's convertFileSrc
 * @param item Item with hudIcon property
 * @returns Icon URL for use in <img> src attribute, or empty string if no icon
 */
async getIconUrl(item: GenericItem): Promise<string>
```

**Contract**:
- Same as WeaponService.getIconUrl but uses `get_item_texture_path` command
- Only CarryItem types have hudIcon (VisualItem returns empty string)

---

## 5. DirectoryService Updates

### New Signals

```typescript
readonly selectedDirectoryIdSig: Signal<string | null>
readonly selectedDirectorySig: Signal<ScanDirectory | null>
```

**Purpose**:
- `selectedDirectoryIdSig`: Tracks the ID of the selected directory
- `selectedDirectorySig`: Computed signal that resolves ID to full directory object

**Contract**:
- Both signals are readonly (external code uses `setSelectedDirectory`)
- `selectedDirectorySig` returns null if ID doesn't match any directory

### New Methods

```typescript
/**
 * Set the selected scan directory by ID
 * @param directoryId ID of directory to select, or null to clear selection
 */
setSelectedDirectory(directoryId: string | null): void

/**
 * Get the currently selected directory
 * @returns Selected directory or null if none selected
 */
getSelectedDirectory(): ScanDirectory | null

/**
 * Get the first valid directory (fallback for scan operations)
 * @returns First valid directory or null if no valid directories
 */
getFirstValidDirectory(): ScanDirectory | null
```

**Contract**:
- `setSelectedDirectory` persists to Tauri store immediately (async, non-blocking)
- `setSelectedDirectory` with null clears the selection
- `getSelectedDirectory` returns null if no directory selected or ID not found
- `getFirstValidDirectory` is safe fallback - never throws

### Modified Method

```typescript
// Existing initialize() method updated to load selected directory
async initialize(): Promise<void>
```

**Contract Update**:
- Now also loads `selected_directory` from Tauri store
- Validates selected directory still exists (clears if not)
- All existing behavior preserved

---

## 6. SettingsComponent Updates

### New Methods

```typescript
/**
 * Handle scan directory selection change
 * @param directoryId ID of directory to select
 */
onDirectorySelect(directoryId: string): void

/**
 * Check if a directory is currently selected
 * @param directoryId ID to check
 * @returns true if this directory is selected
 */
isDirectorySelected(directoryId: string): boolean
```

**Contract**:
- `onDirectorySelect` delegates to `directoryService.setSelectedDirectory`
- `isDirectorySelected` uses `directoryService.selectedDirectoryIdSig`

### Template Usage

```html
<!-- For each directory row -->
<div class="form-control">
    <label class="label cursor-pointer">
        <input
            type="radio"
            class="radio radio-primary"
            [name]="'scan-directory'"
            [checked]="isDirectorySelected(dir.id)"
            (change)="onDirectorySelect(dir.id)"
        />
        <span class="label-text">{{ dir.displayName }}</span>
    </label>
</div>
```

**Contract**:
- Radio buttons indicate currently selected directory
- Clicking a radio button updates selection immediately
- Selection persists across app restarts

---

## 7. Rust Tauri Commands

### New Command: get_item_texture_path

```rust
#[tauri::command]
pub async fn get_item_texture_path(
    item_file_path: String,
    icon_filename: String,
) -> Result<String, String>
```

**Contract**:
- Input: Absolute path to item XML file, icon filename from `hud_icon` element
- Output: Absolute path to texture file OR error message
- Navigates from `.../packages/*/items/` to `.../packages/*/textures/`
- Returns error if texture file doesn't exist

**Response Format**:
```json
// Success
"/absolute/path/to/packages/vanilla/textures/hud_exo_vest.png"

// Error
"Icon file not found: hud_missing.png (expected at: /path/to/textures/hud_missing.png)"
```

### New Commands: Selected Directory Persistence

```rust
#[tauri::command]
async fn save_selected_directory(directoryId: Option<String>) -> Result<(), String>

#[tauri::command]
async fn get_selected_directory() -> Result<Option<String>, String>
```

**Contract**:
- `save_selected_directory`: Stores directory ID in Tauri store (settings.json)
- `get_selected_directory`: Retrieves directory ID from store, returns null if not set
- Both use Tauri plugin-store for persistence

---

## 8. i18n Keys

### New Keys (English)

```json
{
  "weapons": {
    "columns": {
      "classTag": "Class Tag",
      "class": "Class"
    }
  },
  "items": {
    "columns": {
      "image": "Image"
    }
  },
  "settings": {
    "scanLibrary": {
      "selected": "Selected Scan Library",
      "noneSelected": "No scan library selected",
      "selectFirst": "Select a library to enable scanning"
    }
  }
}
```

### New Keys (Chinese)

```json
{
  "weapons": {
    "columns": {
      "classTag": "类别标签",
      "class": "类别"
    }
  },
  "items": {
    "columns": {
      "image": "图片"
    }
  },
  "settings": {
    "scanLibrary": {
      "selected": "已选扫描库",
      "noneSelected": "未选择扫描库",
      "selectFirst": "请选择一个库以启用扫描"
    }
  }
}
```

**Contract**:
- All keys must exist in both en.json and zh.json
- Missing keys cause runtime translation errors
- Keys follow dot notation pattern

---

## 9. Error Handling Contracts

### Image Load Errors

**Expected Behavior**:
- Console error logged with weapon/item key
- Placeholder icon displayed in table
- Table rendering continues without interruption

**Example**:
```typescript
(error)="onImageError($event, weapon)"

onImageError(event: Event, weapon: Weapon): void {
    console.warn(`Failed to load icon for weapon: ${weapon.key}`);
    // weaponIconUrls remains unset, template shows placeholder
}
```

### Selected Directory Errors

**Expected Behavior**:
- If saved directory ID not found → clear selection silently
- If all directories invalid → show error message in settings
- Scan operations fall back to first valid directory

---

## 10. Performance Contracts

### Image Loading

- Images load on-demand as rows render (not upfront)
- Cache prevents repeated Tauri invocations
- Maximum ~200 concurrent image load operations (one per weapon)
- Each image load is async and non-blocking

### Selected Directory Persistence

- Save operation is async and fire-and-forget (doesn't block UI)
- Load operation happens during service initialization (async)
- Selection state uses signals (O(1) access)

---

## 11. Testing Contracts

### Manual Testing Checklist

**Image Rendering**:
- [ ] Weapon images display correctly in table
- [ ] Item images display correctly in table
- [ ] Missing/broken images show placeholder
- [ ] Images load on page navigation

**Class Columns**:
- [ ] Class Tag column shows text values (assault, sniper, etc.)
- [ ] Class column shows numeric values (0, 1, 2)
- [ ] Both columns sort independently
- [ ] Filter by class works correctly

**Selected Directory**:
- [ ] Selection persists across app restart
- [ ] Settings page shows current selection
- [ ] Changing selection updates immediately
- [ ] Removed directory clears selection
