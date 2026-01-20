# WeaponsComponent Page Size Selector Contract

**Component**: `WeaponsComponent`
**Feature**: 001-page-size-selector
**Last Updated**: 2026-01-17

## Public Interface

### Signals (New/Modified)

```typescript
// Existing - now includes configurable pageSize
readonly pagination = signal<{
    currentPage: number;
    pageSize: number;  // NOW: Configurable via dropdown (was fixed at 100)
}>({
    currentPage: 1,
    pageSize: 100,
});

// New - Page size options array
readonly pageSizeOptions = [25, 50, 100, 200];
```

### Methods (New)

```typescript
/**
 * Handle page size dropdown change
 * @param event - Change event from select element
 * @effects Updates pagination signal with new pageSize and resets currentPage to 1
 * @effects Persists new pageSize to localStorage under 'weapons-page-size' key
 */
onPageSizeChange(event: Event): void
```

### Methods (Modified - Behavior Change)

```typescript
/**
 * Get page numbers for pagination display
 * @returns Array of page numbers (or -1 for ellipsis)
 * @behavior Change: Now respects dynamic pageSize from pagination signal
 */
getPageNumbers(): number[]
```

## Constructor Behavior (Modified)

```typescript
constructor() {
    // Existing column visibility load
    this.weaponService.setColumnVisibility(
        this.weaponService.getColumnVisibility(),
    );

    // NEW: Load saved page size from localStorage
    const savedPageSize = localStorage.getItem('weapons-page-size');
    if (savedPageSize) {
        const parsedSize = parseInt(savedPageSize, 10);
        if (!isNaN(parsedSize) && this.pageSizeOptions.includes(parsedSize)) {
            this.pagination.set({
                currentPage: 1,
                pageSize: parsedSize,
            });
        }
    }
}
```

## Template Additions

```html
<!-- Page Size Selector (inserted in controls row, after filter dropdown) -->
<div class="form-control">
    <label class="label py-1">
        <span class="label-text text-xs">{{ 'weapons.page_size' | transloco }}</span>
    </label>
    <select
        class="select select-bordered select-sm"
        [value]="pagination().pageSize"
        (change)="onPageSizeChange($event)"
    >
        @for (size of pageSizeOptions; track size) {
            <option [value]="size">
                {{ 'weapons.page_size_' + size | transloco }}
            </option>
        }
    </select>
</div>
```

## i18n Keys Required

Add to `src/assets/i18n/en.json` and `src/assets/i18n/zh.json`:

```json
{
  "weapons": {
    "page_size": "Per Page",
    "page_size_25": "25",
    "page_size_50": "50",
    "page_size_100": "100",
    "page_size_200": "200"
  }
}
```

## Integration Points

| Integration Point | Type | Contract |
|-------------------|------|----------|
| `WeaponService` | Read-only | No changes required |
| `localStorage` | Write | Key: `weapons-page-size`, Value: stringified number |
| `TranslocoService` | Read | Page size labels via pipe |

---

# ItemsComponent Page Size Selector Contract

**Component**: `ItemsComponent`
**Feature**: 001-page-size-selector
**Last Updated**: 2026-01-17

## Public Interface

### Signals (New/Modified)

```typescript
// Existing - now includes configurable pageSize
readonly pagination = signal<{
    currentPage: number;
    pageSize: number;  // NOW: Configurable via dropdown (was fixed at 100)
}>({
    currentPage: 1,
    pageSize: 100,
});

// New - Page size options array
readonly pageSizeOptions = [25, 50, 100, 200];
```

### Methods (New)

```typescript
/**
 * Handle page size dropdown change
 * @param event - Change event from select element
 * @effects Updates pagination signal with new pageSize and resets currentPage to 1
 * @effects Persists new pageSize to localStorage under 'items-page-size' key
 */
onPageSizeChange(event: Event): void
```

### Methods (Modified - Behavior Change)

```typescript
/**
 * Get page numbers for pagination display
 * @returns Array of page numbers (or -1 for ellipsis)
 * @behavior Change: Now respects dynamic pageSize from pagination signal
 */
getPageNumbers(): number[]
```

## Constructor Behavior (Modified)

```typescript
constructor() {
    // Existing column visibility load
    this.itemService.setColumnVisibility(
        this.itemService.getColumnVisibility(),
    );

    // NEW: Load saved page size from localStorage
    const savedPageSize = localStorage.getItem('items-page-size');
    if (savedPageSize) {
        const parsedSize = parseInt(savedPageSize, 10);
        if (!isNaN(parsedSize) && this.pageSizeOptions.includes(parsedSize)) {
            this.pagination.set({
                currentPage: 1,
                pageSize: parsedSize,
            });
        }
    }
}
```

## Template Additions

```html
<!-- Page Size Selector (inserted in controls row, after filter dropdown) -->
<div class="form-control">
    <label class="label py-1">
        <span class="label-text text-xs">{{ 'items.page_size' | transloco }}</span>
    </label>
    <select
        class="select select-bordered select-sm"
        [value]="pagination().pageSize"
        (change)="onPageSizeChange($event)"
    >
        @for (size of pageSizeOptions; track size) {
            <option [value]="size">
                {{ 'items.page_size_' + size | transloco }}
            </option>
        }
    </select>
</div>
```

## i18n Keys Required

Add to `src/assets/i18n/en.json` and `src/assets/i18n/zh.json`:

```json
{
  "items": {
    "page_size": "Per Page",
    "page_size_25": "25",
    "page_size_50": "50",
    "page_size_100": "100",
    "page_size_200": "200"
  }
}
```

## Integration Points

| Integration Point | Type | Contract |
|-------------------|------|----------|
| `ItemService` | Read-only | No changes required |
| `localStorage` | Write | Key: `items-page-size`, Value: stringified number |
| `TranslocoService` | Read | Page size labels via pipe |
