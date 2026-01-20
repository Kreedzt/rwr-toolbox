# Quickstart: Page Size Selector Implementation

**Feature**: 001-page-size-selector
**Target Audience**: Developers implementing this feature
**Prerequisites**: Angular v20, Signals pattern knowledge, existing Weapons/Items components

## Overview

Add a page size selector dropdown to Weapons and Items data tables, matching the UX pattern from the Players page. The implementation is straightforward - we're adding a dropdown that updates an existing signal and persists to localStorage.

## Implementation Checklist

- [ ] Update WeaponsComponent TypeScript
- [ ] Update WeaponsComponent template
- [ ] Update ItemsComponent TypeScript
- [ ] Update ItemsComponent template
- [ ] Add i18n keys to en.json
- [ ] Add i18n keys to zh.json
- [ ] Test Weapons page
- [ ] Test Items page

## Step-by-Step Implementation

### 1. WeaponsComponent TypeScript Changes

**File**: `src/app/features/data/weapons/weapons.component.ts`

**A. Add page size options signal (after existing signals, around line 50):**

```typescript
// Page size options
readonly pageSizeOptions = [25, 50, 100, 200];
```

**B. Modify constructor to load saved page size (around line 85):**

```typescript
constructor() {
    // Load column visibility from localStorage on init
    this.weaponService.setColumnVisibility(
        this.weaponService.getColumnVisibility(),
    );

    // Load page size from localStorage (NEW)
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

**C. Add onPageSizeChange method (around line 250, after onRefresh):**

```typescript
/** Handle page size dropdown change */
onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const newSize = parseInt(value, 10);
    this.pagination.update((p) => ({
        ...p,
        pageSize: newSize,
        currentPage: 1, // Reset to page 1
    }));
    localStorage.setItem('weapons-page-size', String(newSize));
}
```

### 2. WeaponsComponent Template Changes

**File**: `src/app/features/data/weapons/weapons.component.html`

**Add page size selector in the controls row (around line 10, after the class filter dropdown):**

```html
<!-- Page Size Selector -->
<div class="form-control">
    <label class="label py-1">
        <span class="label-text text-xs">{{
            'weapons.page_size' | transloco
        }}</span>
    </label>
    <select
        class="select select-bordered select-sm"
        [value]="pagination().pageSize"
        (change)="onPageSizeChange($event)"
    >
        @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{
                'weapons.page_size_' + size | transloco
            }}</option>
        }
    </select>
</div>
```

**Placement context**: The controls row uses `flex flex-col sm:flex-row gap-2`. Insert the page size selector div within this flex container.

### 3. ItemsComponent TypeScript Changes

**File**: `src/app/features/data/items/items.component.ts`

**Same changes as WeaponsComponent, but replace "weapons" with "items":**

**A. Add page size options signal:**

```typescript
readonly pageSizeOptions = [25, 50, 100, 200];
```

**B. Modify constructor:**

```typescript
constructor() {
    this.itemService.setColumnVisibility(
        this.itemService.getColumnVisibility(),
    );

    // Load page size from localStorage
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

**C. Add onPageSizeChange method:**

```typescript
onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const newSize = parseInt(value, 10);
    this.pagination.update((p) => ({
        ...p,
        pageSize: newSize,
        currentPage: 1,
    }));
    localStorage.setItem('items-page-size', String(newSize));
}
```

### 4. ItemsComponent Template Changes

**File**: `src/app/features/data/items/items.component.html`

**Same as Weapons template, replace "weapons" with "items":**

```html
<!-- Page Size Selector -->
<div class="form-control">
    <label class="label py-1">
        <span class="label-text text-xs">{{
            'items.page_size' | transloco
        }}</span>
    </label>
    <select
        class="select select-bordered select-sm"
        [value]="pagination().pageSize"
        (change)="onPageSizeChange($event)"
    >
        @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{
                'items.page_size_' + size | transloco
            }}</option>
        }
    </select>
</div>
```

### 5. i18n Translation Keys

**File**: `src/assets/i18n/en.json`

Add under `weapons` object (around line 330):

```json
"page_size": "Per Page",
"page_size_25": "25",
"page_size_50": "50",
"page_size_100": "100",
"page_size_200": "200"
```

Add under `items` object (around line 415):

```json
"page_size": "Per Page",
"page_size_25": "25",
"page_size_50": "50",
"page_size_100": "100",
"page_size_200": "200"
```

**File**: `src/assets/i18n/zh.json`

Add under `weapons` object (around line 345):

```json
"page_size": "每页",
"page_size_25": "25",
"page_size_50": "50",
"page_size_100": "100",
"page_size_200": "200"
```

Add under `items` object (around line 435):

```json
"page_size": "每页",
"page_size_25": "25",
"page_size_50": "50",
"page_size_100": "100",
"page_size_200": "200"
```

## Testing

### Manual Test Steps

1. **Load Weapons page**:
   - Navigate to Data > Weapons
   - Verify page size dropdown is visible in controls row
   - Select different page size (e.g., 50)
   - Verify table updates to show 50 items
   - Refresh page - verify 50 is still selected

2. **Load Items page**:
   - Navigate to Data > Items
   - Verify page size dropdown is visible
   - Test all page size options (25, 50, 100, 200)
   - Verify pagination stats update correctly

3. **Edge cases**:
   - Change page size while on page 3+ - verify resets to page 1
   - Change page size with active filters - verify filters persist
   - Change page size with search active - verify search persists

## Code Quality Standards

- Run `pnpm format` before committing
- Run `pnpm tsc --noEmit` to verify TypeScript
- No ESLint errors expected
- Build must succeed: `pnpm build`

## Common Issues

| Issue | Solution |
|-------|----------|
| Page size not persisting | Check localStorage key name matches (`weapons-page-size` vs `items-page-size`) |
| i18n key not found | Verify keys exist in BOTH en.json and zh.json |
| Page doesn't reset to 1 | Ensure signal update includes `currentPage: 1` |
| TypeScript error on `event.target` | Use type assertion: `(event.target as HTMLSelectElement).value` |

## Next Steps

After implementation:
1. Run `/speckit.tasks` to generate task breakdown
2. Implement tasks in order
3. Update `docs-ai/PROGRESS.md` with completion summary
