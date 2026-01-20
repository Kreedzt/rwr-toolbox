# Data Model: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Feature**: 004-image-class-settings
**Date**: 2026-01-17

## Overview

This document describes the state model, entity structures, and data flow for the three bug fixes/features in this sprint.

---

## 1. Image Loading State Model

### Weapon Image Cache (Component-Level)

Each component (WeaponsComponent, ItemsComponent) maintains a signal-based cache for resolved image URLs.

```typescript
// In weapons.component.ts
readonly weaponIconUrls = signal<Map<string, string>>(new Map());

async loadWeaponIcon(weapon: Weapon): Promise<void> {
    if (!weapon.hudIcon || this.weaponIconUrls().has(weapon.key || '')) {
        return;
    }
    try {
        const url = await this.weaponService.getIconUrl(weapon);
        if (url) {
            this.weaponIconUrls.update(map => new Map(map).set(weapon.key || '', url));
        }
    } catch (error) {
        console.error('Failed to load icon for', weapon.key, error);
    }
}

getWeaponIconUrl(weapon: Weapon): string {
    return this.weaponIconUrls().get(weapon.key || '') || '';
}
```

### Item Image Cache (Same Pattern)

```typescript
// In items.component.ts
readonly itemIconUrls = signal<Map<string, string>>(new Map());

// Same methods as weapons, using itemService.getIconUrl()
```

---

## 2. Column Configuration Model

### Weapon Columns (Updated)

```typescript
export const WEAPON_COLUMNS: WeaponColumn[] = [
    // ... existing columns ...
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
    // ... rest of columns ...
];
```

### Type Definition Update

```typescript
// In weapons.models.ts
export type WeaponColumnKey =
    | 'image'
    | 'key'
    | 'name'
    | 'classTag'      // NEW: Class tag column
    | 'class'         // NEW: Numeric class column
    | 'magazineSize'
    | 'killProbability'
    | 'retriggerTime'
    | 'filePath'
    | 'sourceDirectory';
```

---

## 3. Selected Directory Persistence Model

### DirectoryService State Extension

```typescript
// In directory.service.ts

// NEW: Selected directory ID signal
private selectedDirectoryIdState = signal<string | null>(null);

// Public readonly signal
readonly selectedDirectoryIdSig = this.selectedDirectoryIdState.asReadonly();

// Computed: Get the selected directory object
readonly selectedDirectorySig = computed(() => {
    const id = this.selectedDirectoryIdState();
    if (!id) return null;
    return this.directoriesState().find(d => d.id === id) || null;
});
```

### DirectoryService Methods

```typescript
/**
 * Set the selected scan directory by ID
 * @param directoryId ID of directory to select
 */
setSelectedDirectory(directoryId: string | null): void {
    this.selectedDirectoryIdState.set(directoryId);
    this.saveSelectedDirectory(directoryId);
}

/**
 * Get the currently selected directory
 * @returns Selected directory or null if none selected
 */
getSelectedDirectory(): ScanDirectory | null {
    return this.selectedDirectorySig();
}

/**
 * Get the first valid directory (fallback for scan operations)
 * @returns First valid directory or null
 */
getFirstValidDirectory(): ScanDirectory | null {
    return this.getValidDirectories()[0] || null;
}

/**
 * Persist selected directory ID to Tauri store
 */
private async saveSelectedDirectory(directoryId: string | null): Promise<void> {
    try {
        await invoke('save_selected_directory', { directoryId });
    } catch (error) {
        console.error('Failed to save selected directory:', error);
    }
}

/**
 * Load selected directory ID from Tauri store
 */
private async loadSelectedDirectory(): Promise<void> {
    try {
        const directoryId = await invoke<string | null>('get_selected_directory');
        this.selectedDirectoryIdState.set(directoryId);
    } catch (error) {
        console.error('Failed to load selected directory:', error);
    }
}
```

### Initialize Method Update

```typescript
async initialize(): Promise<void> {
    const directories = this.settingsService.getScanDirectories();
    this.directoriesState.set(directories);

    // NEW: Load selected directory
    await this.loadSelectedDirectory();

    // Validate selected directory still exists and is valid
    const selected = this.selectedDirectorySig();
    if (selected) {
        // Revalidate to ensure it's still valid
        await this.revalidateDirectory(selected.id);
    }

    // Revalidate all directories
    this.revalidateAll();
}
```

---

## 4. Rust Backend Extensions

### items.rs - Add get_texture_path Command

```rust
/// Get the absolute path to a texture file for icon rendering
/// Navigates from item file location to textures/ folder (sibling directory)
#[tauri::command]
pub async fn get_item_texture_path(
    item_file_path: String,
    icon_filename: String,
) -> Result<String, String> {
    // Same implementation as weapons get_texture_path
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

### lib.rs - Register New Command

```rust
// In main() or lib.rs
#[tauri::command]
async fn get_item_texture_path(
    item_file_path: String,
    icon_filename: String,
) -> Result<String, String> {
    items::get_item_texture_path(item_file_path, icon_filename).await
}

// In invoke_handler
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    get_item_texture_path,
])
```

---

## 5. Tauri Store Schema

### New Store Entries

```json
{
  "selected_directory": "dir_1234567890_abcde"  // ID or null
}
```

### Rust Commands for Store Access

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

---

## 6. Component Data Flow

### Weapon Image Loading Flow

```
1. Component initializes
   └─> weaponIconUrls = empty Map

2. Table renders with @for (weapon of paginatedWeapons(); track weapon.key)
   └─> Calls loadWeaponIcon(weapon) for each row
       └─> Check if already cached
           ├─> Yes: Return existing URL
           └─> No: Call weaponService.getIconUrl(weapon)
               └─> invoke('get_texture_path', {...})
                   └─> Rust resolves absolute path
               └─> convertFileSrc(path)
                   └─> Returns Tauri asset URL
               └─> Update weaponIconUrls signal
                   └─> Template re-renders with image

3. User navigates pages
   └─> New rows trigger loadWeaponIcon for unloaded weapons
```

### Selected Directory Flow

```
1. App starts
   └─> DirectoryService.initialize()
       ├─> Load directories from store
       └─> Load selected_directory from store

2. Settings page renders
   └─> Show all directories with radio buttons
   └─> Highlight selectedDirectoryId

3. User clicks different directory
   └─> setAsSelected(directoryId)
       ├─> Update selectedDirectoryId signal
       ├─> Save to Tauri store
       └─> UI updates (radio button highlight)

4. Weapons/Items page loads
   └─> Get first valid directory OR selected directory
   └─> Call scanWeapons(scanDir)
```

---

## 7. Error Handling Model

### Image Load Failures

```typescript
// In component template
@if (getWeaponIconUrl(weapon)) {
    <img [src]="getWeaponIconUrl(weapon)" [alt]="weapon.name" />
} @else {
    <div class="w-16 h-16 bg-base-300 flex items-center justify-center">
        <span class="text-xs opacity-50">No image</span>
    </div>
}
```

### Selected Directory Not Found

```typescript
// In DirectoryService
async loadSelectedDirectory(): Promise<void> {
    const directoryId = await invoke<string | null>('get_selected_directory');
    if (directoryId) {
        // Verify it still exists in our directories list
        const exists = this.directoriesState().some(d => d.id === directoryId);
        if (!exists) {
            // Selected directory was removed, clear selection
            this.selectedDirectoryIdState.set(null);
            await this.saveSelectedDirectory(null);
            return;
        }
        this.selectedDirectoryIdState.set(directoryId);
    }
}
```

---

## 8. Validation Rules

### Weapon/Item Icons

- `hudIcon` must be a valid filename (e.g., "hud_ak47.png")
- Texture file must exist in `textures/` sibling to `weapons/` or `items/`
- If image fails to load, show placeholder instead of breaking table

### Class Values

- `classTag`: String from `<tag name="..."/>` (e.g., "assault", "sniper")
- `class`: Number from `<specification class="..."/>` (e.g., 0, 1, 2)
- Both fields must be independently sortable and filterable

### Selected Directory

- Must be a valid directory ID from the directories list
- If selected directory becomes invalid, fall back to first valid directory
- If no valid directories exist, show error state
