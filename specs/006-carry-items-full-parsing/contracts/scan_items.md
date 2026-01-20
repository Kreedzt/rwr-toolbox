# Tauri Command Contract: scan_items

**Feature**: 006-carry-items-full-parsing
**Command Name**: `scan_items`
**Source**: `src-tauri/src/items.rs`

## Command Signature

```rust
#[tauri::command]
async fn scan_items(
    game_path: String,
    directory: Option<String>
) -> ItemScanResult
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `game_path` | `String` | Yes | Absolute path to the game packages directory (e.g., "/path/to/rwr/packages") |
| `directory` | `Option<String>` | No | Optional subdirectory within game_path to scan (e.g., "vanilla/items") |

## Response Structure

```typescript
interface ItemScanResult {
    items: GenericItem[];      // All successfully parsed items
    errors: ItemScanError[];    // Parsing errors encountered
    duplicateKeys: string[];     // Duplicate item keys detected
    scanTime: number;           // Scan duration in milliseconds
}

interface ItemScanError {
    file: string;               // File that caused error
    error: string;              // Error message
    severity: 'error' | 'warning'; // Error classification
}
```

## Response Examples

### Success Response (Single Item)

```json
{
    "items": [
        {
            "_id": "uuid-1",
            "key": "ak47",
            "name": "AK-47",
            "itemType": "carry_item",
            "encumbrance": 30,
            "price": 150,
            "canRespawnWith": true,
            "inStock": true,
            "filePath": "vanilla/weapons/ak47.weapon",
            "sourceFile": "/path/to/rwr/packages/vanilla/weapons/ak47.weapon",
            "packageName": "vanilla",
            "sourceDirectory": "/path/to/rwr/packages",
            "capacity": {
                "value": 1,
                "source": "rank",
                "sourceValue": 0.5
            },
            "commonness": {
                "value": 0.1,
                "inStock": true,
                "canRespawnWith": false
            },
            "modifiers": [],
            "transformOnConsume": null,
            "timeToLiveOutInTheOpen": null,
            "draggable": null
        }
    ],
    "errors": [],
    "duplicateKeys": [],
    "scanTime": 150
}
```

### Success Response (Multi-Item File)

```json
{
    "items": [
        {
            "_id": "uuid-1",
            "key": "vest2.carry_item_0",
            "name": "Health, 150%",
            "itemType": "carry_item",
            "slot": "1",
            "encumbrance": 30,
            "price": 20,
            "canRespawnWith": false,
            "inStock": true,
            "filePath": "vanilla/items/vest2.carry_item",
            "sourceFile": "/path/to/rwr/packages/vanilla/items/vest2.carry_item",
            "packageName": "vanilla",
            "sourceDirectory": "/path/to/rwr/packages",
            "capacity": {
                "value": 1,
                "source": "rank",
                "sourceValue": 0.05
            },
            "commonness": {
                "value": 0.05,
                "inStock": true,
                "canRespawnWith": false
            },
            "modifiers": [
                {
                    "_id": "uuid-mod-1",
                    "modifierClass": "projectile_blast_result",
                    "inputCharacterState": "death",
                    "outputCharacterState": "stun"
                },
                {
                    "_id": "uuid-mod-2",
                    "modifierClass": "hit_success_probability",
                    "value": -2.5
                }
            ],
            "transformOnConsume": "Health, 140%",
            "timeToLiveOutInTheOpen": 0.0,
            "draggable": true
        },
        {
            "_id": "uuid-2",
            "key": "vest2.carry_item_1",
            "name": "Health, 140%",
            "itemType": "carry_item",
            "slot": "1",
            "encumbrance": 30,
            "price": 2,
            "canRespawnWith": false,
            "inStock": false,
            "filePath": "vanilla/items/vest2.carry_item",
            "sourceFile": "/path/to/rwr/packages/vanilla/items/vest2.carry_item",
            "packageName": "vanilla",
            "sourceDirectory": "/path/to/rwr/packages",
            "capacity": {
                "value": 1,
                "source": "rank",
                "sourceValue": 0.0
            },
            "commonness": {
                "value": 0.0,
                "inStock": false,
                "canRespawnWith": false
            },
            "modifiers": [...],
            "transformOnConsume": "Health, 130%",
            "timeToLiveOutInTheOpen": 0.0,
            "draggable": false
        }
        // ... 13 more items from the same file
    ],
    "errors": [],
    "duplicateKeys": [],
    "scanTime": 300
}
```

### Error Response (Partial Failure)

```json
{
    "items": [
        // Successfully parsed items...
    ],
    "errors": [
        {
            "file": "vanilla/items/broken_item.carry_item",
            "error": "XML parse error: missing field `name`",
            "severity": "error"
        }
    ],
    "duplicateKeys": ["duplicate_key_1", "duplicate_key_2"],
    "scanTime": 200
}
```

## Error Conditions

| Condition | Response Behavior |
|-----------|-------------------|
| Invalid game_path | Returns error via Tauri invoke exception |
| Directory not found | Returns empty items array with error in errors array |
| Invalid XML syntax | Returns partial results with parsing errors in errors array |
| Duplicate keys in file | Returns items with duplicate_keys array populated |
| Missing optional attributes | Returns items with fields as null/undefined |

## Usage Examples

### TypeScript Frontend

```typescript
import { invoke } from '@tauri-apps/api/core';
import type { ItemScanResult } from '@/shared/models/items.models';

async function scanItems(gamePath: string, directory?: string): Promise<ItemScanResult> {
    const result = await invoke<ItemScanResult>('scan_items', {
        gamePath,
        directory: directory || null
    });

    // Tag items with source directory for multi-directory support and generate unique IDs
    const itemsWithIds = result.items.map((i, index) => ({
        ...i,
        sourceDirectory: directory || gamePath,
        _id: crypto.randomUUID(),
        modifiers: i.modifiers?.map((m) => ({
            ...m,
            _id: crypto.randomUUID(),
        })),
    }));

    return { ...result, items: itemsWithIds };
}
```

### Rust Backend

```rust
#[tauri::command]
async fn scan_items(
    game_path: String,
    directory: Option<String>,
) -> Result<ItemScanResult, String>
{
    // Implementation details in src-tauri/src/items.rs
    // - Iterate over all .carry_item files in directory
    // - Parse each file with quick-xml
    // - Extract all <carry_item> elements (not just first)
    // - Parse capacity, commonness, modifiers
    // - Generate unique keys for items without @key attribute
    // - Flag duplicate keys
}
```

## Performance Characteristics

- **Typical scan time**: 100-500ms for vanilla game directory
- **Memory usage**: O(n) where n = total items scanned
- **File I/O**: Synchronous file reading for each .carry_item file
- **XML parsing**: quick-xml deserialization

## Related Commands

- `get_item_texture_path` - Get absolute icon path for an item
- `get_item_icon_base64` - Get item icon as base64 encoded string
