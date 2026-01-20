# Data Model: Data Table Enhancements

**Feature**: 002-table-enhancements
**Date**: 2026-01-15
**Status**: Phase 1 - Design

## Overview

This document defines the data entities and state structures for implementing column visibility toggle, column sorting, tab switching (Weapons/Items), and code quality improvements.

---

## Core Entities

### 1. Weapon (Existing - from Feature 001)

**Location**: `src/app/shared/models/weapons.models.ts`

```typescript
interface Weapon {
    key?: string;
    name: string;
    classTag: string;
    magazineSize: number;
    killProbability: number;
    retriggerTime: number;
    burstShots?: number;
    spreadRange?: number;
    sightRangeModifier?: number;
    projectileSpeed?: number;
    barrelOffset?: number;
    encumbrance?: number;
    price?: number;
    suppressed: boolean;
    canRespawnWith: boolean;
    inStock: boolean;
    chainVariants: string[];
    stanceAccuracies: StanceAccuracy[];
    filePath: string;
    sourceFile: string;
    packageName: string;
}
```

**State**: Managed by `WeaponService` (existing)
- Uses Signals: `weapons`, `filteredWeapons`, `loading`, `error`
- Search/filter state: `searchTerm`, `advancedFilters`
- Column visibility: `_visibleColumns` (persisted to localStorage)

---

### 2. Item (New)

**Location**: `src/app/shared/models/items.models.ts`

```typescript
/**
 * Base item interface for all game items
 */
interface Item {
    /** Unique item identifier (filename without extension) */
    key?: string;
    /** Display name shown to users */
    name: string;
    /** Item type/class (carry_item, visual_item, armor, etc.) */
    itemType: string;
    /** Weight/encumbrance value */
    encumbrance?: number;
    /** In-game cost */
    price?: number;
    /** Can spawn with this item */
    canRespawnWith?: boolean;
    /** Available for purchase */
    inStock?: boolean;
    /** File path relative to packages directory */
    filePath: string;
    /** Original absolute XML file path */
    sourceFile: string;
    /** Package name (vanilla or mod) */
    packageName: string;
}

/**
 * Carryable item (equipment, consumables)
 * From .carry_item XML files
 */
interface CarryItem extends Item {
    itemType: 'carry_item';
    /** Slot identifier (0, 1, 2, etc.) */
    slot?: string;
    /** Item to transform into when consumed */
    transformOnConsume?: string;
    /** Time before despawning when dropped (seconds) */
    timeToLiveOutInTheOpen?: number;
    /** Owner lock time after player death (seconds) */
    playerDeathDropOwnerLockTime?: number;
    /** Capacity requirements */
    capacity?: ItemCapacity[];
    /** Modifiers affecting player stats */
    modifiers?: ItemModifier[];
    /** HUD icon filename */
    hudIcon?: string;
    /** 3D model filename */
    modelFilename?: string;
}

/**
 * Item capacity requirement
 */
interface ItemCapacity {
    /** Required capacity value */
    value: number;
    /** Source type (rank, etc.) */
    source: string;
    /** Source threshold value */
    sourceValue: number;
}

/**
 * Item modifier (affects player stats)
 */
interface ItemModifier {
    /** Modifier class (speed, detectability, hit_success_probability, etc.) */
    class: string;
    /** Modifier value (e.g., +0.06, -0.05) */
    value?: number;
    /** Input character state */
    inputCharacterState?: string;
    /** Output character state */
    outputCharacterState?: string;
    /** Whether modifier consumes the item */
    consumesItem?: boolean;
}

/**
 * Visual item (props, effects)
 * From .visual_item XML files
 */
interface VisualItem extends Item {
    itemType: 'visual_item';
    /** Mesh filenames for visual variation */
    meshFilenames: string[];
    /** Effect reference name */
    effectRef?: string;
}

/**
 * Generic item (for other .item files)
 */
interface GenericItem extends Item {
    itemType: 'item';
    /** Additional properties parsed dynamically */
    [key: string]: any;
}

/**
 * Union type for all item types
 */
type GameItem = CarryItem | VisualItem | GenericItem;

/**
 * Error during item scanning
 */
interface ItemScanError {
    /** File that caused error */
    file: string;
    /** Error message */
    error: string;
    /** Error classification */
    severity: 'error' | 'warning';
}

/**
 * Result from item scanning operation
 */
interface ItemScanResult {
    /** All scanned items */
    items: GameItem[];
    /** Errors encountered during scan */
    errors: ItemScanError[];
    /** Duplicate item keys detected */
    duplicateKeys: string[];
    /** Scan duration in milliseconds */
    scanTime: number;
}
```

**State**: Managed by new `ItemService` (to be created)
- Signals: `items`, `filteredItems`, `loading`, `error`
- Search/filter state: `searchTerm`, `advancedFilters`
- Column visibility: `_visibleColumns` (persisted to localStorage)

---

## Column Definition Entities

### 3. Column Definition (Reusable)

**Location**: `src/app/shared/models/column.models.ts` (new shared file)

```typescript
/**
 * Generic column configuration for data tables
 */
interface ColumnConfig<T = any> {
    /** Column key (unique identifier) */
    key: string;
    /** Field name in data entity */
    field: keyof T | string;
    /** Default label (fallback) */
    label: string;
    /** i18n key for translation */
    i18nKey: string;
    /** Text alignment */
    alignment: 'left' | 'center' | 'right';
    /** Always visible (cannot be toggled off) */
    alwaysVisible?: boolean;
    /** Data type for sorting */
    dataType?: 'string' | 'number' | 'boolean' | 'date';
}

/**
 * Column visibility preference (per-tab)
 */
interface ColumnVisibility {
    /** Column identifier */
    columnId: string;
    /** Is column currently shown */
    visible: boolean;
    /** Display order (optional) */
    order?: number;
}
```

---

## Sorting State Entities

### 4. Sort State

**Location**: `src/app/shared/models/sort.models.ts` (new shared file)

```typescript
/**
 * Sorting direction
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Sort state for a data table
 */
interface SortState {
    /** Column key currently being sorted */
    columnKey: string | null;
    /** Sort direction (null = no sort) */
    direction: SortDirection;
}

/**
 * Sort comparator function type
 */
type SortComparator<T> = (a: T, b: T) => number;
```

---

## Tab State Entities

### 5. Tab State

**Location**: `src/app/shared/models/tab.models.ts` (new shared file)

```typescript
/**
 * Data tab type
 */
type DataTab = 'weapons' | 'items';

/**
 * Per-tab state for filters, search, sort, and column visibility
 */
interface TabState {
    /** Active tab */
    activeTab: DataTab;
    /** Weapons tab state */
    weapons: {
        searchTerm: string;
        filters: any; // AdvancedFilters type
        sort: SortState;
        columnVisibility: ColumnVisibility[];
    };
    /** Items tab state */
    items: {
        searchTerm: string;
        filters: any; // ItemFilters type (to be defined)
        sort: SortState;
        columnVisibility: ColumnVisibility[];
    };
}
```

---

## Service State Architecture

### WeaponService (Existing - Enhanced)

**Location**: `src/app/features/data/weapons/services/weapon.service.ts`

**Enhancements**:
- Add `sortState` signal for column sorting
- Update `filteredWeapons` computed to include sorting
- Add `setSortState()` method

```typescript
class WeaponService {
    // Existing signals
    private weapons = signal<Weapon[]>([]);
    private loading = signal<boolean>(false);
    private error = signal<string | null>(null);
    private searchTerm = signal<string>('');
    private advancedFilters = signal<AdvancedFilters>({});
    private _visibleColumns = signal<ColumnVisibility[]>([]);

    // NEW: Sort state
    private sortState = signal<SortState>({
        columnKey: null,
        direction: null,
    });

    // Enhanced computed: filter + sort
    readonly filteredWeapons = computed(() => {
        const weapons = this.weapons();
        const term = this.searchTerm();
        const filters = this.advancedFilters();
        const sort = this.sortState();

        let filtered = weapons.filter(w =>
            this.matchesSearch(w, term) && this.matchesFilters(w, filters)
        );

        // Apply sorting if active
        if (sort.columnKey && sort.direction) {
            filtered = this.sortWeapons(filtered, sort.columnKey, sort.direction);
        }

        return filtered;
    });

    // NEW: Set sort state
    setSortState(state: SortState): void {
        this.sortState.set(state);
    }

    // NEW: Get current sort state
    getSortState(): SortState {
        return this.sortState();
    }

    // NEW: Sort weapons by column
    private sortWeapons(
        weapons: Weapon[],
        columnKey: string,
        direction: 'asc' | 'desc'
    ): Weapon[] {
        // Stable sort implementation
        return [...weapons].sort((a, b) => {
            const aVal = (a as any)[columnKey];
            const bVal = (b as any)[columnKey];
            return this.compareValues(aVal, bVal, direction);
        });
    }

    private compareValues(
        a: any,
        b: any,
        direction: 'asc' | 'desc'
    ): number {
        // Handle null/undefined (FR-011)
        if (a == null && b == null) return 0;
        if (a == null) return direction === 'asc' ? 1 : -1;
        if (b == null) return direction === 'asc' ? -1 : 1;

        // Type-aware comparison
        if (typeof a === 'number' && typeof b === 'number') {
            return direction === 'asc' ? a - b : b - a;
        }

        if (typeof a === 'string' && typeof b === 'string') {
            const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' });
            return direction === 'asc' ? cmp : -cmp;
        }

        // Fallback
        return direction === 'asc' ? 1 : -1;
    }
}
```

---

### ItemService (New - Parallels WeaponService)

**Location**: `src/app/features/data/items/services/item.service.ts`

```typescript
class ItemService {
    // Private signals (parallel to WeaponService)
    private items = signal<GameItem[]>([]);
    private loading = signal<boolean>(false);
    private error = signal<string | null>(null);
    private searchTerm = signal<string>('');
    private advancedFilters = signal<ItemFilters>({});
    private _visibleColumns = signal<ColumnVisibility[]>([]);
    private sortState = signal<SortState>({
        columnKey: null,
        direction: null,
    });

    // Public computed signals
    readonly filteredItems = computed(() => {
        const items = this.items();
        const term = this.searchTerm();
        const filters = this.advancedFilters();
        const sort = this.sortState();

        let filtered = items.filter(item =>
            this.matchesSearch(item, term) && this.matchesFilters(item, filters)
        );

        if (sort.columnKey && sort.direction) {
            filtered = this.sortItems(filtered, sort.columnKey, sort.direction);
        }

        return filtered;
    });

    readonly itemsSig = this.items.asReadonly();
    readonly loadingSig = this.loading.asReadonly();
    readonly errorSig = this.error.asReadonly();
    readonly visibleColumnsSig = this._visibleColumns.asReadonly();

    /** Scan items from game directory */
    async scanItems(gamePath: string): Promise<void> {
        if (this.loading()) return;

        this.loading.set(true);
        this.error.set(null);
        try {
            const result = await invoke<ItemScanResult>('scan_items', { gamePath });
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

    // Similar methods to WeaponService:
    // - setSearchTerm(), setAdvancedFilters(), clearFilters()
    // - setColumnVisibility(), getColumnVisibility()
    // - setSortState(), getSortState()
    // - matchesSearch(), matchesFilters()
    // - sortItems(), compareValues()
    // - getDefaultColumns()
}
```

---

## Backend Rust Structures

### Item Structures (New - Parallel to Weapon)

**Location**: `src-tauri/src/items.rs` (new file)

```rust
use serde::{Deserialize, Serialize};

/// Unified item structure (all item types)
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
    // Item-type-specific fields
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slot: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transform_on_consume: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_to_live: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modifiers: Option<Vec<ItemModifier>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mesh_filenames: Option<Vec<String>>,
}

/// Item modifier
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

/// Item scan result
#[derive(Debug, Serialize)]
pub struct ItemScanResult {
    pub items: Vec<Item>,
    pub errors: Vec<ScanError>,
    #[serde(rename = "duplicateKeys")]
    pub duplicate_keys: Vec<String>,
    #[serde(rename = "scanTime")]
    pub scan_time: u64,
}

#[tauri::command]
pub async fn scan_items(game_path: String) -> Result<ItemScanResult, String> {
    // Scan packages/**/items/ for .carry_item, .visual_item, .item, .armor files
    // Parse each file type with appropriate struct
    // Return unified Item list
}
```

---

## Component State Structure

### DataLayoutComponent (Enhanced)

**Location**: `src/app/features/data/data-layout/data-layout.component.ts`

```typescript
class DataLayoutComponent {
    // Tab state
    readonly activeTab = signal<DataTab>('weapons');

    // Per-tab component references
    readonly weaponsComponent = inject(WeaponsComponent);
    readonly itemsComponent = inject(ItemsComponent);

    /** Switch active tab */
    switchTab(tab: DataTab): void {
        this.activeTab.set(tab);
    }
}
```

---

## Data Flow Diagrams

### Column Visibility Flow

```
User toggles column (UI)
    ↓
onColumnToggle(columnId)
    ↓
WeaponService.setColumnVisibility(updated)
    ↓
_visibleColumns signal updates
    ↓
Persist to localStorage
    ↓
visibleColumnsSig computed updates
    ↓
Table re-renders with new column set
```

### Sorting Flow

```
User clicks column header (UI)
    ↓
onColumnClick(columnKey)
    ↓
WeaponService.setSortState({ columnKey, direction })
    ↓
sortState signal updates
    ↓
filteredWeapons computed re-evaluates
    ↓
Sort is applied to filtered data
    ↓
Table re-renders with sorted rows
```

### Tab Switching Flow

```
User clicks tab (UI)
    ↓
DataLayoutComponent.switchTab('items')
    ↓
activeTab signal updates
    ↓
@if(activeTab === 'items') shows ItemsComponent
    ↓
Each component maintains its own Service state
    ↓
Independent filters, search, sort, columns per tab
```

---

## Validation Rules

### Column Visibility (FR-003)
- At least one column must remain visible
- Prevent hiding last column via UI validation

### Sorting (FR-011, FR-012)
- Null/undefined values sort to end (ascending) or beginning (descending)
- String sorting is case-insensitive
- Stable sort preserves relative order of equal items

### Tab State (FR-016)
- Each tab has independent filter, search, sort, column visibility state
- State persists when switching between tabs
- No re-scan when switching tabs

---

## Storage Schema

### localStorage Keys

```typescript
// Column visibility
'weapons.column.visibility': ColumnVisibility[]
'items.column.visibility': ColumnVisibility[]

// Optional: Sort state persistence (future enhancement)
'weapons.sort.state': SortState
'items.sort.state': SortState
```

---

## Entity Relationships

```
┌─────────────────┐
│  WeaponService  │
│  - weapons      │──┐
│  - filtered...  │  │
│  - sortState    │  │  manages
│  - columns      │  │
└─────────────────┘  │
                     │
                     ├────→ Weapon[]
│                     │       │
│                     │       │ used by
│                     │       │
├─────────────────┐   │  ┌─────────────────┐
│   ItemService   │   └──│   WeaponColumn  │
│  - items        │──┐   │  ColumnConfig   │
│  - filtered...  │  │  └─────────────────┘
│  - sortState    │  │  manages
│  - columns      │  │
└─────────────────┘  │
                     │
                     ├────→ GameItem[]
│                     │       │
│                     │       │ used by
│                     │       │
│                     │  ┌─────────────────┐
│                     └──│    ItemColumn   │
│                         │  ColumnConfig   │
│                         └─────────────────┘
│
└────→ SortState (shared type)
```
