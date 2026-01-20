# Data Model: Page Size Selector for Data Tables

**Feature**: 001-page-size-selector
**Last Updated**: 2026-01-17

## Overview

This feature adds page size selection state to existing Weapons and Items data tables. No new data entities are introduced - we extend the existing pagination state with a configurable page size value.

## State Model

### Page Size State (Component-Level)

Page size preference is stored as a component signal with localStorage persistence.

```typescript
// In WeaponsComponent and ItemsComponent
readonly pagination = signal<{
    currentPage: number;
    pageSize: number;  // NEW: Configurable via dropdown (25, 50, 100, 200)
}>({
    currentPage: 1,
    pageSize: 100,     // Default value
});

// Page size options array
readonly pageSizeOptions = [25, 50, 100, 200];
```

### localStorage Schema

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| `weapons-page-size` | string | Saved page size for Weapons table | `"50"` |
| `items-page-size` | string | Saved page size for Items table | `"100"` |

**Note**: Page size is stored as string in localStorage (localStorage API limitation), converted to number for use in signals.

### Computed Signals (Existing, Now Page-Size Aware)

```typescript
// Total pages based on current page size
readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pagination().pageSize) || 1
);

// Current page's items
readonly paginatedWeapons = computed(() => {
    const filtered = this.weapons();
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
});

// Display range for pagination info
getDisplayRange(): { start: number; end: number } {
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, this.totalItems());
    return { start, end };
}
```

## State Transitions

### Page Size Change Flow

```
User selects new page size
        ↓
onPageSizeChange(event)
        ↓
1. Parse new value (string → number)
2. Update pagination signal: { currentPage: 1, pageSize: newSize }
3. Save to localStorage: setItem('weapons-page-size', String(newSize))
        ↓
Computed signals react:
- totalPages() recalculates
- paginatedWeapons() reslices with new pageSize
- getDisplayRange() recalculates
        ↓
View updates (<100ms)
```

### Edge Case: Page Size Change on Page > Total Pages

```
Current state: Page 5 of 10, pageSize = 50
User changes: pageSize = 200
        ↓
New total pages: Math.ceil(500 / 200) = 3
        ↓
Reset to: Page 1 (automatic via currentPage: 1 in signal update)
```

## Validation Rules

| Rule | Description | Implementation |
|------|-------------|----------------|
| **Min page size** | Cannot go below 25 | Constrained by dropdown options |
| **Max page size** | Cannot exceed 200 | Constrained by dropdown options |
| **Valid options only** | Only predefined values allowed | HTML select element |
| **Page reset** | Reset to page 1 on size change | Signal update includes `currentPage: 1` |

## Relationships to Existing State

### Weapons Component State

| State | Type | Source | Page Size Dependency |
|-------|------|--------|---------------------|
| `weapons` | signal<Weapon[]> | WeaponService | None (source data) |
| `filteredWeapons` | computed | WeaponService | None (filtering) |
| `pagination` | signal | Component | **Contains pageSize** |
| `totalPages` | computed | Component | **Derived from pageSize** |
| `paginatedWeapons` | computed | Component | **Slices by pageSize** |

### Items Component State

| State | Type | Source | Page Size Dependency |
|-------|------|--------|---------------------|
| `items` | signal<GenericItem[]> | ItemService | None (source data) |
| `filteredItems` | computed | ItemService | None (filtering) |
| `pagination` | signal | Component | **Contains pageSize** |
| `totalPages` | computed | Component | **Derived from pageSize** |
| `paginatedItems` | computed | Component | **Slices by pageSize** |

## No Service Layer Changes

The WeaponService and ItemService do not require modifications. Page size is purely a UI concern handled at the component level:

- **No new service methods**
- **No new service signals**
- **No Tauri command changes**

This aligns with the client-side pagination architecture where all data is loaded upfront and pagination is a view concern.
