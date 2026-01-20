# Quickstart: Full Carry Items Parsing with Extended Attributes

**Feature**: 006-carry-items-full-parsing
**Date**: 2025-01-19
**For**: Developers implementing this feature

## Overview

This quickstart guide helps developers implement the full carry_items parsing feature. The feature changes how `.carry_item` files are parsed (extract all items, not just the first) and adds extended attributes (capacity, commonness, modifiers) to the Items table.

**Estimated Implementation Time**: 4-6 hours

## Prerequisites

- Rust edition 2021 with quick-xml 0.37
- Angular 20.3.15 with Signals
- Tauri 2.x
- Familiarity with existing items.rs module structure

## Implementation Checklist

### Phase 1: Backend Changes (Rust)

**File**: `src-tauri/src/items.rs`

#### 1.1 Extend Item struct with new fields

```rust
// Add to Item struct (after existing fields)
#[serde(skip_serializing_if = "Option::is_none")]
pub capacity: Option<ItemCapacity>,
#[serde(skip_serializing_if = "Option::is_none")]
pub commonness: Option<ItemCommonness>,
```

#### 1.2 Add new structs (if not present)

```rust
/// Item capacity/spawn requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemCapacity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(rename = "sourceValue", skip_serializing_if = "Option::is_none")]
    pub source_value: Option<f64>,
}

/// Item spawn frequency settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemCommonness {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,
    #[serde(rename = "inStock", skip_serializing_if = "Option::is_none")]
    pub in_stock: Option<bool>,
    #[serde(rename = "canRespawnWith", skip_serializing_if = "Option::is_none")]
    pub can_respawn_with: Option<bool>,
}
```

#### 1.3 Add RawCapacity and RawCommonness structs (for parsing)

```rust
#[derive(Debug, Deserialize, Default)]
struct RawCapacity {
    #[serde(rename = "@value", default)]
    value: Option<f64>,
    #[serde(rename = "@source", default)]
    source: Option<String>,
    #[serde(rename = "@sourceValue", default)]
    source_value: Option<f64>,
}

#[derive(Debug, Deserialize, Default)]
struct RawCommonness {
    #[serde(rename = "@value", default)]
    value: Option<f64>,
    #[serde(rename = "@in_stock", default)]
    in_stock: Option<String>,
    #[serde(rename = "@can_respawn_with", default)]
    can_respawn_with: Option<String>,
}
```

#### 1.4 Update RawCarryItem to include new fields

```rust
struct RawCarryItem {
    // ... existing fields ...
    #[serde(rename = "capacity", default)]
    capacities: Vec<RawCapacity>,
    #[serde(rename = "commonness", default)]
    commonness: Option<RawCommonness>,
}
```

#### 1.5 Refactor parse_carry_item() to return Vec<Item>

**Current signature**:
```rust
fn parse_carry_item(path: &Path, input_path: &Path) -> Result<Item, String>
```

**New signature**:
```rust
fn parse_carry_item(path: &Path, input_path: &Path) -> Result<Vec<Item>, String>
```

**Key changes**:
1. Change return type from `Result<Item>` to `Result<Vec<Item>>`
2. Instead of `raw_root.items.first()`, iterate over all items
3. For each item in the vector, create an `Item` with extended attributes
4. Collect all items into a `Vec<Item>`

**Example transformation**:
```rust
// OLD
let raw = raw_root.items.first()
    .ok_or_else(|| format!("No carry_item found in file"))?;

Ok(Item { /* ... */ })

// NEW
let mut items = Vec::new();
for raw in &raw_root.items {
    let item = parse_single_carry_item(raw, path, input_path)?;
    items.push(item);
}
Ok(items)
```

#### 1.6 Update scan_items() to handle Vec<Item> return

In `scan_items()` function, flatten the results:
```rust
// Parse each file and collect all items
for entry in entries {
    if let Ok(path) = entry {
        if path.is_file() {
            match parse_carry_item(&path, &input_path) {
                Ok(items_from_file) => {
                    for item in items_from_file {
                        // Check for duplicates
                        if let Some(ref key) = item.key {
                            if seen_keys.contains(key) {
                                duplicate_keys.push(key.clone());
                            } else {
                                seen_keys.insert(key.clone());
                            }
                        }
                        items.push(item);
                    }
                }
                Err(e) => { /* handle error */ }
            }
        }
    }
}
```

### Phase 2: Frontend Model Changes (TypeScript)

**File**: `src/app/shared/models/items.models.ts`

#### 2.1 Add new interfaces

```typescript
export interface ItemCapacity {
    value?: number;
    source?: string;
    sourceValue?: number;
}

export interface ItemCommonness {
    value?: number;
    inStock?: boolean;
    canRespawnWith?: boolean;
}
```

#### 2.2 Extend GenericItem interface

```typescript
export interface GenericItem {
    // ... existing fields ...
    modifiers?: ItemModifier[];  // Already exists

    // NEW fields
    capacity?: ItemCapacity;
    commonness?: ItemCommonness;
}
```

### Phase 3: Frontend Display Changes

**File**: `src/app/features/data/items/items.component.ts`

#### 3.1 Add new column definitions

```typescript
readonly columns = [
    // ... existing columns ...
    {
        key: 'capacityValue',
        field: 'capacity.value',
        label: 'Capacity Value',
        i18nKey: 'items.columns.capacityValue',
        alignment: 'right',
    },
    {
        key: 'capacitySource',
        field: 'capacity.source',
        label: 'Capacity Source',
        i18nKey: 'items.columns.capacitySource',
        alignment: 'left',
    },
    {
        key: 'commonnessValue',
        field: 'commonness.value',
        label: 'Commonness',
        i18nKey: 'items.columns.commonnessValue',
        alignment: 'right',
    },
    {
        key: 'inStock',
        field: 'commonness.inStock',
        label: 'In Stock',
        i18nKey: 'items.columns.inStock',
        alignment: 'center',
    },
    {
        key: 'canRespawnWith',
        field: 'commonness.canRespawnWith',
        label: 'Can Respawn',
        i18nKey: 'items.columns.canRespawnWith',
        alignment: 'center',
    },
    {
        key: 'modifiers',
        field: 'modifiers',
        label: 'Modifiers',
        i18nKey: 'items.columns.modifiers',
        alignment: 'left',
    },
];
```

#### 3.2 Add formatter for modifier display

```typescript
formatModifiers(modifiers: ItemModifier[] | undefined): string {
    if (!modifiers || modifiers.length === 0) return '-';

    const count = modifiers.length;
    const classes = modifiers.slice(0, 3).map(m => m.modifierClass).join(', ');
    const more = modifiers.length > 3 ? ` +${modifiers.length - 3} more` : '';

    return `${count} × (${classes}${more})`;
}
```

### Phase 4: i18n Translations

**Files**: `src/assets/i18n/en.json`, `src/assets/i18n/zh.json`

#### 4.1 Add English translations

```json
"items": {
    "columns": {
        // ... existing columns ...
        "capacityValue": "Capacity",
        "capacitySource": "Source",
        "commonnessValue": "Spawn Rate",
        "inStock": "In Stock",
        "canRespawnWith": "Respawn",
        "modifiers": "Modifiers"
    }
}
```

#### 4.2 Add Chinese translations

```json
"items": {
    "columns": {
        // ... existing columns ...
        "capacityValue": "容量要求",
        "capacitySource": "来源",
        "commonnessValue": "生成概率",
        "inStock": "有库存",
        "canRespawnWith": "可重生",
        "modifiers": "修饰器"
    }
}
```

### Phase 5: Template Updates

**File**: `src/app/features/data/items/items.component.html`

#### 5.1 Add new column templates

```html
<!-- Capacity Value -->
<ng-container *ngIf="col.field === 'capacity.value'">
    {{ item.capacity?.value ?? '-' }}
</ng-container>

<!-- Capacity Source -->
<ng-container *ngIf="col.field === 'capacity.source'">
    {{ item.capacity?.source ?? '-' }}
</ng-container>

<!-- Commonness Value -->
<ng-container *ngIf="col.field === 'commonness.value'">
    {{ item.commonness?.value?.toFixed(2) ?? '-' }}
</ng-container>

<!-- In Stock -->
<ng-container *ngIf="col.field === 'commonness.inStock'">
    <span *ngIf="item.commonness?.inStock === true" class="badge badge-success">{{ 'common.yes' | transloco }}</span>
    <span *ngIf="item.commonness?.inStock === false" class="badge badge-error">{{ 'common.no' | transloco }}</span>
    <span *ngIf="item.commonness?.inStock === null">-</span>
</ng-container>

<!-- Can Respawn With -->
<ng-container *ngIf="col.field === 'commonness.canRespawnWith'">
    <span *ngIf="item.commonness?.canRespawnWith === true" class="badge badge-success">{{ 'common.yes' | transloco }}</span>
    <span *ngIf="item.commonness?.canRespawnWith === false" class="badge badge-error">{{ 'common.no' | transloco }}</span>
    <span *ngIf="item.commonness?.canRespawnWith === null">-</span>
</ng-container>

<!-- Modifiers -->
<ng-container *ngIf="col.field === 'modifiers'">
    <div class="tooltip tooltip-bottom" data-tip="{{ getModifierTooltip(item.modifiers) }}">
        {{ formatModifiers(item.modifiers) }}
    </div>
</ng-container>
```

## Testing

### Backend Testing

```bash
# Run Rust tests
cargo test --package rwr-toolbox-lib --lib items

# Check for compilation errors
cargo check

# Format code
cargo fmt

# Lint
cargo clippy
```

### Frontend Testing

```bash
# Build Angular
pnpm build

# Run tests (if available)
pnpm test

# Check TypeScript
npx tsc --noEmit
```

### Integration Testing

1. Scan a directory with `vest2.carry_item`
2. Verify 15+ items appear in the table
3. Check that all items have the same `filePath`
4. Verify extended attributes are populated:
   - `capacity.value` shows rank requirement
   - `commonness.inStock` shows boolean
   - `modifiers` shows count and list

## Troubleshooting

### Issue: Table shows duplicate items

**Solution**: Check that `parse_carry_item()` is iterating correctly and not re-adding items.

### Issue: Extended attributes are all undefined

**Solution**: Verify that:
1. `RawCapacity` and `RawCommonness` are correctly deserializing from XML
2. Fields are being mapped from `Raw` structs to `Item` struct

### Issue: Build fails with type errors

**Solution**: Run `npx tsc --noEmit` to see detailed TypeScript errors, check that interfaces match Rust struct serialization.

## Next Steps

After completing this feature:
1. Run `/speckit.tasks` to generate implementation tasks
2. Implement tasks in order (backend → frontend → i18n)
3. Update `docs-ai/PROGRESS.md` with implementation notes
4. Test with real game data files
