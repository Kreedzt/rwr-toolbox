# Quickstart Guide: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Feature**: 004-image-class-settings
**Branch**: `004-image-class-settings`
**Date**: 2026-01-17

## Overview

This guide provides step-by-step instructions for implementing the three bug fixes/features in this sprint.

---

## Phase 1: Rust Backend - Add Item Texture Path Command

### Step 1.1: Add `get_item_texture_path` to items.rs

**File**: `src-tauri/src/items.rs`

Add this function after the existing `parse_visual_item` function:

```rust
/// Get the absolute path to a texture file for item icon rendering
/// Navigates from item file location to textures/ folder (sibling directory)
#[tauri::command]
pub async fn get_item_texture_path(
    item_file_path: String,
    icon_filename: String,
) -> Result<String, String> {
    let item_path = PathBuf::from(&item_file_path);
    let item_dir = item_path
        .parent()
        .ok_or("Invalid item path: cannot get parent directory")?;

    // textures/ is a sibling to items/ folder
    let textures_dir = item_dir
        .parent()
        .ok_or("Invalid item path: cannot get grandparent directory")?
        .join("textures");

    let icon_path = textures_dir.join(&icon_filename);

    if !icon_path.exists() {
        return Err(format!(
            "Icon file not found: {} (expected at: {})",
            icon_filename,
            icon_path.display()
        ));
    }

    let canonical = icon_path
        .canonicalize()
        .map_err(|e| format!("Failed to resolve icon path: {}", e))?;

    Ok(canonical.to_string_lossy().to_string())
}
```

### Step 1.2: Register command in lib.rs

**File**: `src-tauri/src/lib.rs`

Add to `invoke_handler`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    get_item_texture_path,
])
```

### Step 1.3: Add selected directory persistence commands

**File**: `src-tauri/src/lib.rs` (or create new `src-tauri/src/settings.rs`)

```rust
/// Save the selected directory ID to Tauri store
#[tauri::command]
async fn save_selected_directory(directoryId: Option<String>) -> Result<(), String> {
    let store = tauri_plugin_store::StoreBuilder::new("settings.json").build();
    store.set("selected_directory", directoryId);
    store.save()?;
    Ok(())
}

/// Get the selected directory ID from Tauri store
#[tauri::command]
async fn get_selected_directory() -> Result<Option<String>, String> {
    let store = tauri_plugin_store::StoreBuilder::new("settings.json").build();
    Ok(store.get("selected_directory").and_then(|v| v.as_str()).map(|s| s.to_string()))
}
```

Register in `invoke_handler`:
```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    save_selected_directory,
    get_selected_directory,
])
```

### Step 1.4: Test Rust commands

```bash
cd src-tauri
cargo build
```

---

## Phase 2: Frontend - Update Weapon Columns

### Step 2.1: Update WEAPON_COLUMNS

**File**: `src/app/features/data/weapons/weapon-columns.ts`

Replace the existing "Class" column with TWO columns:

```typescript
export const WEAPON_COLUMNS: WeaponColumn[] = [
    // ... existing columns before class ...
    {
        key: 'classTag',          // CHANGED from 'class'
        field: 'classTag',        // Now correctly maps to classTag
        label: 'Class Tag',
        i18nKey: 'weapons.columns.classTag',
        alignment: 'left',
        alwaysVisible: false,
    },
    {
        key: 'class',             // NEW COLUMN
        field: 'class',           // Maps to numeric class value
        label: 'Class',
        i18nKey: 'weapons.columns.class',
        alignment: 'right',       // Numeric values right-aligned
        alwaysVisible: false,
    },
    // ... existing columns after class ...
];
```

### Step 2.2: Add i18n keys

**File**: `src/assets/i18n/en.json`

```json
{
  "weapons": {
    "columns": {
      "classTag": "Class Tag",
      "class": "Class"
    }
  }
}
```

**File**: `src/assets/i18n/zh.json`

```json
{
  "weapons": {
    "columns": {
      "classTag": "类别标签",
      "class": "类别"
    }
  }
}
```

---

## Phase 3: Frontend - Add Image Loading to Weapons

### Step 3.1: Add image cache signal to WeaponsComponent

**File**: `src/app/features/data/weapons/weapons.component.ts`

Add to the component class:

```typescript
export class WeaponsComponent implements OnInit {
    // ... existing code ...

    // Image URL cache: weapon.key -> image URL
    readonly weaponIconUrls = signal<Map<string, string>>(new Map());

    // ... rest of component ...
}
```

### Step 3.2: Add image loading methods

Add methods after the existing `closeWeaponDetails()` method:

```typescript
/** Load weapon icon URL and cache the result */
async loadWeaponIcon(weapon: Weapon): Promise<void> {
    const weaponKey = weapon.key || '';
    if (!weapon.hudIcon || this.weaponIconUrls().has(weaponKey)) {
        return;
    }
    try {
        const url = await this.weaponService.getIconUrl(weapon);
        if (url) {
            this.weaponIconUrls.update(map => {
                const newMap = new Map(map);
                newMap.set(weaponKey, url);
                return newMap;
            });
        }
    } catch (error) {
        console.error('Failed to load icon for', weapon.key, error);
    }
}

/** Get cached icon URL for a weapon */
getWeaponIconUrl(weapon: Weapon): string {
    const weaponKey = weapon.key || '';
    return this.weaponIconUrls().get(weaponKey) || '';
}

/** Handle image load error */
onWeaponImageError(event: Event, weapon: Weapon): void {
    console.warn('Failed to load image for weapon:', weapon.key);
    // Optionally remove from cache to retry later
}
```

### Step 3.3: Update template with image rendering

**File**: `src/app/features/data/weapons/weapons.component.html`

Find the image column `<td>` and replace with:

```html
<td class="w-16">
    @if (getWeaponIconUrl(weapon)) {
        <img
            [src]="getWeaponIconUrl(weapon)"
            [alt]="weapon.name"
            class="w-12 h-12 object-contain"
            (error)="onWeaponImageError($event, weapon)"
        />
    } @else {
        <div class="w-12 h-12 bg-base-300 flex items-center justify-center">
            <lucide-icon name="image-off" class="w-6 h-6 opacity-30" />
        </div>
    }
</td>
```

Add loading trigger in the table row:

```html
<tr
    class="hover:bg-base-200 cursor-pointer"
    (click)="onRowClick(weapon)"
>
    <!-- ... existing columns ... -->
</tr>

<!-- Add at component level to trigger image loading -->
@for (weapon of paginatedWeapons(); track weapon.key) {
    { loadWeaponIcon(weapon) }
}
```

---

## Phase 4: Frontend - Add Image Loading to Items

### Step 4.1: Add image cache to ItemsComponent

**File**: `src/app/features/data/items/items.component.ts`

Same pattern as WeaponsComponent:

```typescript
export class ItemsComponent implements OnInit {
    // ... existing code ...

    // Image URL cache: item.key -> image URL
    readonly itemIconUrls = signal<Map<string, string>>(new Map());
}
```

### Step 4.2: Add image loading methods

```typescript
/** Load item icon URL and cache the result */
async loadItemIcon(item: GenericItem): Promise<void> {
    const itemKey = item.key || '';
    // Only CarryItem has hudIcon
    if (!isCarryItem(item) || !item.hudIcon || this.itemIconUrls().has(itemKey)) {
        return;
    }
    try {
        const url = await this.itemService.getIconUrl(item);
        if (url) {
            this.itemIconUrls.update(map => {
                const newMap = new Map(map);
                newMap.set(itemKey, url);
                return newMap;
            });
        }
    } catch (error) {
        console.error('Failed to load icon for', item.key, error);
    }
}

/** Get cached icon URL for an item */
getItemIconUrl(item: GenericItem): string {
    const itemKey = item.key || '';
    return this.itemIconUrls().get(itemKey) || '';
}

/** Handle image load error */
onItemImageError(event: Event, item: GenericItem): void {
    console.warn('Failed to load image for item:', item.key);
}
```

### Step 4.3: Add getIconUrl to ItemService

**File**: `src/app/features/data/items/services/item.service.ts`

```typescript
import { convertFileSrc } from '@tauri-apps/api/core';

// ... existing code ...

async getIconUrl(item: GenericItem): Promise<string> {
    // Only CarryItem has hudIcon
    if (!isCarryItem(item) || !item.hudIcon) {
        return '';
    }

    try {
        const iconPath = await invoke<string>('get_item_texture_path', {
            itemFilePath: item.sourceFile,
            iconFilename: item.hudIcon,
        });
        return convertFileSrc(iconPath);
    } catch (error) {
        console.error('Failed to resolve icon path:', error);
        return '';
    }
}
```

### Step 4.4: Update Items template

**File**: `src/app/features/data/items/items.component.html`

Same pattern as Weapons template.

---

## Phase 5: Frontend - Add Selected Directory Persistence

### Step 5.1: Update DirectoryService

**File**: `src/app/features/settings/services/directory.service.ts`

Add new signals:

```typescript
export class DirectoryService {
    // ... existing signals ...

    // Selected directory ID signal
    private selectedDirectoryIdState = signal<string | null>(null);
    readonly selectedDirectoryIdSig = this.selectedDirectoryIdState.asReadonly();

    // Computed: Get selected directory object
    readonly selectedDirectorySig = computed(() => {
        const id = this.selectedDirectoryIdState();
        if (!id) return null;
        return this.directoriesState().find(d => d.id === id) || null;
    });
}
```

Add new methods:

```typescript
setSelectedDirectory(directoryId: string | null): void {
    this.selectedDirectoryIdState.set(directoryId);
    this.saveSelectedDirectory(directoryId);
}

getSelectedDirectory(): ScanDirectory | null {
    return this.selectedDirectorySig();
}

getFirstValidDirectory(): ScanDirectory | null {
    return this.getValidDirectories()[0] || null;
}

private async saveSelectedDirectory(directoryId: string | null): Promise<void> {
    try {
        await invoke('save_selected_directory', { directoryId });
    } catch (error) {
        console.error('Failed to save selected directory:', error);
    }
}

private async loadSelectedDirectory(): Promise<void> {
    try {
        const directoryId = await invoke<string | null>('get_selected_directory');
        // Validate directory still exists
        if (directoryId) {
            const exists = this.directoriesState().some(d => d.id === directoryId);
            if (exists) {
                this.selectedDirectoryIdState.set(directoryId);
            } else {
                // Selected directory was removed, clear selection
                await this.saveSelectedDirectory(null);
            }
        }
    } catch (error) {
        console.error('Failed to load selected directory:', error);
    }
}
```

Update `initialize()` method:

```typescript
async initialize(): Promise<void> {
    const directories = this.settingsService.getScanDirectories();
    this.directoriesState.set(directories);

    // Load selected directory
    await this.loadSelectedDirectory();

    // Revalidate all directories
    this.revalidateAll();
}
```

### Step 5.2: Update SettingsComponent

**File**: `src/app/features/settings/settings.component.ts`

Add methods:

```typescript
onDirectorySelect(directoryId: string): void {
    this.directoryService.setSelectedDirectory(directoryId);
}

isDirectorySelected(directoryId: string): boolean {
    return this.directoryService.selectedDirectoryIdSig() === directoryId;
}
```

Update template:

**File**: `src/app/features/settings/settings.component.html`

```html
<!-- In the directory list section -->
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

### Step 5.3: Update Weapons/Items to use selected directory

**File**: `src/app/features/data/weapons/weapons.component.ts`

Update `loadWeapons()`:

```typescript
async loadWeapons(): Promise<void> {
    // Use selected directory or fall back to first valid
    const directory = this.directoryService.getSelectedDirectory()
        || this.directoryService.getFirstValidDirectory();

    if (!directory) {
        const errorMsg = this.transloco.translate('weapons.errors.noGamePath');
        this.weaponService['error'].set(errorMsg);
        return;
    }

    await this.weaponService.scanWeapons(
        directory.path,
        directory.path,
    );
}
```

Same for ItemsComponent.

---

## Phase 6: i18n Updates

### Step 6.1: Add all i18n keys

**File**: `src/assets/i18n/en.json`

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

**File**: `src/assets/i18n/zh.json`

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

---

## Phase 7: Testing

### Step 7.1: Build and test

```bash
pnpm build
pnpm tauri dev
```

### Step 7.2: Manual testing checklist

**Image Rendering**:
- [ ] Navigate to Weapons page - images should load
- [ ] Navigate to Items page - images should load
- [ ] Missing images show placeholder icon
- [ ] Navigate between pages - images persist in cache

**Class Columns**:
- [ ] Weapons page shows both "Class Tag" and "Class" columns
- [ ] Class Tag shows "assault", "sniper", etc.
- [ ] Class shows 0, 1, 2, etc.
- [ ] Sorting works independently for each column

**Selected Directory**:
- [ ] Settings page shows radio button selection
- [ ] Clicking radio button updates selection
- [ ] Selection persists after app restart
- [ ] Weapons/Items use selected directory for scanning

---

## Troubleshooting

### Images not loading

1. Check browser console for Tauri command errors
2. Verify `get_texture_path` command is registered in lib.rs
3. Verify texture files exist in `textures/` folder

### Class column showing wrong data

1. Verify `weapon-columns.ts` has both columns defined
2. Check that field mapping is correct (`field: 'class'` for numeric class)
3. Verify i18n keys exist in both en.json and zh.json

### Selected directory not persisting

1. Check Tauri store contains `selected_directory` entry
2. Verify `save_selected_directory` and `get_selected_directory` are registered
3. Check DirectoryService `initialize()` is being called on app startup
