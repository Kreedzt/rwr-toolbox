# Tauri Command Contracts

**Feature**: 002-table-enhancements
**Backend**: Rust (Tauri 2.x)
**Frontend**: Angular 20.x

## Overview

This document defines the Tauri command contracts for frontend-backend communication.

---

## Commands

### 1. scan_items (NEW)

**Purpose**: Scan game directory for item files and return parsed item data.

**Command Name**: `scan_items`

**Backend Signature** (Rust):
```rust
#[tauri::command]
pub async fn scan_items(game_path: String) -> Result<ItemScanResult, String>
```

**Frontend Signature** (TypeScript):
```typescript
interface ItemScanResult {
    items: GameItem[];
    errors: ItemScanError[];
    duplicateKeys: string[];
    scanTime: number;
}

const result = await invoke<ItemScanResult>('scan_items', {
    gamePath: string
});
```

**Request Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| gamePath | string | Yes | Absolute path to RWR game directory |

**Response**:
| Field | Type | Description |
|-------|------|-------------|
| items | GameItem[] | Array of parsed item objects |
| errors | ItemScanError[] | Array of parse errors |
| duplicateKeys | string[] | Array of duplicate item keys found |
| scanTime | number | Scan duration in milliseconds |

**Error Handling**:
- Returns `Err(String)` on:
  - Invalid game_path (directory doesn't exist)
  - Permission denied reading directory
  - Critical scan failure
- Individual file parse errors returned in `errors` array (non-fatal)

**File Extensions Scanned**:
- `.carry_item` - Equipment and consumable items
- `.visual_item` - Visual props and effects
- `.item` - Generic item files
- `.armor` - Armor files (if found)

**Scan Pattern**:
```
{game_path}/packages/{mod_name}/items/**/*.{carry_item,visual_item,item,armor}
```

**Example Call**:
```typescript
try {
    const result = await invoke<ItemScanResult>('scan_items', {
        gamePath: '/path/to/rwr/game'
    });
    console.log(`Found ${result.items.length} items`);
    console.log(`Scan took ${result.scanTime}ms`);
    if (result.errors.length > 0) {
        console.warn(`${result.errors.length} files failed to parse`);
    }
} catch (e) {
    console.error('Scan failed:', e);
}
```

---

### 2. scan_weapons (EXISTING - No Changes)

**Purpose**: Scan game directory for weapon files.

**Status**: Existing command from Feature 001. No changes required.

---

## Data Types

### GameItem (Union Type)

```typescript
type GameItem = CarryItem | VisualItem | GenericItem;

interface BaseItem {
    key?: string;
    name: string;
    itemType: string;
    encumbrance?: number;
    price?: number;
    canRespawnWith?: boolean;
    inStock?: boolean;
    filePath: string;
    sourceFile: string;
    packageName: string;
}

interface CarryItem extends BaseItem {
    itemType: 'carry_item';
    slot?: string;
    transformOnConsume?: string;
    timeToLiveOutInTheOpen?: number;
    playerDeathDropOwnerLockTime?: number;
    capacity?: ItemCapacity[];
    modifiers?: ItemModifier[];
    hudIcon?: string;
    modelFilename?: string;
}

interface VisualItem extends BaseItem {
    itemType: 'visual_item';
    meshFilenames: string[];
    effectRef?: string;
}

interface GenericItem extends BaseItem {
    itemType: 'item';
    [key: string]: any;
}

interface ItemCapacity {
    value: number;
    source: string;
    sourceValue: number;
}

interface ItemModifier {
    class: string;
    value?: number;
    inputCharacterState?: string;
    outputCharacterState?: string;
    consumesItem?: boolean;
}
```

### ItemScanError

```typescript
interface ItemScanError {
    file: string;
    error: string;
    severity: 'error' | 'warning';
}
```

---

## Rust Backend Structures

### Item Struct

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    pub name: String,
    #[serde(rename = "itemType")]
    pub item_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encumbrance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub price: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_respawn_with: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub in_stock: Option<bool>,
    #[serde(rename = "filePath")]
    pub file_path: String,
    #[serde(rename = "sourceFile")]
    pub source_file: String,
    #[serde(rename = "packageName")]
    pub package_name: String,
    // CarryItem-specific
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slot: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transform_on_consume: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_to_live: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modifiers: Option<Vec<ItemModifier>>,
    // VisualItem-specific
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mesh_filenames: Option<Vec<String>>,
}
```

### ItemModifier Struct

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemModifier {
    #[serde(rename = "class")]
    pub modifier_class: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input_character_state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output_character_state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub consumes_item: Option<bool>,
}
```

### ItemScanResult Struct

```rust
#[derive(Debug, Serialize)]
pub struct ItemScanResult {
    pub items: Vec<Item>,
    pub errors: Vec<ScanError>,
    #[serde(rename = "duplicateKeys")]
    pub duplicate_keys: Vec<String>,
    #[serde(rename = "scanTime")]
    pub scan_time: u64,
}
```

---

## Integration Points

### Frontend Service Integration

**ItemService.ts**:
```typescript
import { inject, Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { TranslocoService } from '@jsverse/transloco';
import { GameItem, ItemScanResult } from '../../../../shared/models/items.models';

@Injectable({ providedIn: 'root' })
export class ItemService {
    private transloco = inject(TranslocoService);

    private items = signal<GameItem[]>([]);
    private loading = signal<boolean>(false);
    private error = signal<string | null>(null);

    readonly itemsSig = this.items.asReadonly();
    readonly loadingSig = this.loading.asReadonly();
    readonly errorSig = this.error.asReadonly();

    async scanItems(gamePath: string): Promise<void> {
        if (this.loading()) return;

        this.loading.set(true);
        this.error.set(null);

        try {
            const result = await invoke<ItemScanResult>('scan_items', {
                gamePath: gamePath,
            });

            this.items.set(result.items);

            if (result.errors.length > 0) {
                const errorMsg = this.transloco.translate('items.scanError', {
                    error: `${result.errors.length} files failed`,
                });
                this.error.set(errorMsg);
            }
        } catch (e) {
            const errorMsg = this.transloco.translate('items.scanError', {
                error: String(e),
            });
            this.error.set(errorMsg);
        } finally {
            this.loading.set(false);
        }
    }
}
```

### Backend Command Registration

**lib.rs**:
```rust
mod items;
mod weapons;

#[tauri::command]
async fn scan_items(game_path: String) -> Result<items::ItemScanResult, String> {
    items::scan_items(game_path).await
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Existing commands
            scan_weapons,
            // New command
            scan_items,
            // ... other commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Performance Considerations

1. **Scan Duration Target**: <3 seconds for typical game installation (SC-008)
2. **File Pattern**: Use `walkdir` for efficient directory traversal
3. **Parallel Parsing**: Consider rayon for parallel XML parsing (if needed)
4. **Memory Efficiency**: Stream results rather than loading all into memory at once

---

## Error Scenarios

| Scenario | Error Response | Handling |
|----------|----------------|----------|
| Invalid game_path | `Err("Directory not found: {path}")` | Show error in UI, don't scan |
| Permission denied | `Err("Permission denied: {path}")` | Show error in UI, suggest running as admin |
| No items directory | `Ok(ItemScanResult { items: [], errors: [], ... })` | Show empty-state message |
| Malformed XML file | `Ok(ItemScanResult { items: [...], errors: [{ file, error, severity: 'error' }], ... })` | Log error, continue parsing other files |
| Duplicate keys | `Ok(ItemScanResult { items: [...], duplicateKeys: [...], ... })` | Show warning in UI |
