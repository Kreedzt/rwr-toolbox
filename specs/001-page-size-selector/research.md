# Research: Page Size Selector for Data Tables

**Feature**: 001-page-size-selector
**Date**: 2026-01-17
**Research Focus**: Adapting Players page size selector to Weapons/Items client-side pagination

---

## Pagination Pattern Comparison

### Players Page (Server-Side)

```typescript
// Players fetches data from API with page parameter
loadData(page: number = 1) {
    this.playerService.fetchPlayers(
        this.selectedDatabase(),
        page,           // ← Server-side page
        this.pageSize(), // ← Server-side page size
        this.sortField(),
        this.filter().search || ''
    );
}

// Page size options
pageSizeOptions = [20, 50, 100];
```

**Key Characteristic**: Each page change triggers an HTTP request to the backend. Pagination is managed server-side.

### Weapons/Items Pages (Client-Side)

```typescript
// Weapons/Items load ALL data once, then paginate client-side
readonly paginatedWeapons = computed(() => {
    const filtered = this.weapons();        // All filtered data
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);       // ← Client slice
});
```

**Key Characteristic**: All data is loaded in browser. Pagination is a computed view over the loaded data.

---

## Decision: UI Adaptation Strategy

| Aspect | Players (Reference) | Weapons/Items (Implementation) |
|--------|---------------------|-------------------------------|
| **Page size options** | [20, 50, 100] | [25, 50, 100, 200] |
| **Pagination type** | Server-side (API) | Client-side (computed signals) |
| **Data flow** | Component → API → Component | Component → computed() → View |
| **State persistence** | Not persisted (session only) | localStorage required per spec |
| **Page reset on change** | `loadData(1)` | `pagination.update({ ...p, currentPage: 1 })` |

**Decision**: Reuse Players UI pattern (dropdown in control bar), but adapt state management to:
1. Store page size in component signal (like Players)
2. Persist to localStorage (unlike Players)
3. Reset to page 1 via signal update (not API call)

---

## Page Size Options Decision

**Question**: Why different page size options for Weapons/Items vs Players?

| Page Size | Players | Weapons/Items | Rationale |
|-----------|---------|---------------|-----------|
| 20 | ✅ | ❌ | Players has fewer columns, simpler rows |
| 25 | ❌ | ✅ | Weapons/Items have more data columns |
| 50 | ✅ | ✅ | Balanced option for all pages |
| 100 | ✅ | ✅ | High-density option (current default) |
| 200 | ❌ | ✅ | Power user option for large datasets |

**Decision**: Use [25, 50, 100, 200] for Weapons/Items as specified in feature spec.

---

## localStorage Persistence Pattern

### Existing Pattern (Column Visibility)

From `WeaponService`:

```typescript
// Save
setColumnVisibility(columns: ColumnVisibility[]): void {
    this._visibleColumns.set(columns);
    try {
        localStorage.setItem('weapons.column.visibility', JSON.stringify(columns));
    } catch { /* ignore */ }
}

// Load (in getDefaultColumns())
getDefaultColumns(): ColumnVisibility[] {
    try {
        const stored = localStorage.getItem('weapons.column.visibility');
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return /* defaults */;
}
```

### Page Size Pattern Decision

**Option A**: Persist in service layer (like column visibility)
- Pros: Consistent with existing pattern
- Cons: Page size is UI state, not data state

**Option B**: Persist in component layer (simpler)
- Pros: Page size is a UI preference, not data
- Cons: Inconsistent with column visibility pattern

**Decision**: **Option B** - Persist page size in component layer using a helper method. Page size is transient UI state that doesn't need service layer management.

```typescript
// In component constructor
constructor() {
    // Load saved page size from localStorage
    const savedPageSize = localStorage.getItem('weapons-page-size');
    if (savedPageSize) {
        this.pagination.set({
            currentPage: 1,
            pageSize: parseInt(savedPageSize, 10),
        });
    }
}

// In onPageSizeChange
onPageSizeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const newSize = parseInt(value, 10);
    this.pagination.update((p) => ({ ...p, pageSize: newSize, currentPage: 1 }));
    localStorage.setItem('weapons-page-size', String(newSize));
}
```

---

## UI Layout Placement

### Players Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Search input] [Database selector] [Page Size selector]     │  ← Controls row
├─────────────────────────────────────────────────────────────┤
│ Table                                                          │
├─────────────────────────────────────────────────────────────┤
│ [Showing X count]     [<] [Page 1] [>]                      │  ← Pagination row
└─────────────────────────────────────────────────────────────┘
```

### Weapons/Items Current Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Search input] [Filter dropdown] [Columns] [Scroll] [Refresh]│  ← Controls row
├─────────────────────────────────────────────────────────────┤
│ [Advanced Search Panel (collapsible)]                        │
├─────────────────────────────────────────────────────────────┤
│ Table                                                          │
├─────────────────────────────────────────────────────────────┤
│ [Showing X to Y of Z]    [1] [2] [3] ... [10]                │  ← Pagination row
└─────────────────────────────────────────────────────────────┘
```

**Decision**: Insert page size selector in the controls row, between filter dropdown and column toggle button.

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **UI Pattern** | Mirror Players page dropdown | Consistency across app |
| **Page Size Options** | [25, 50, 100, 200] | Specified in requirements, appropriate for data tables |
| **State Management** | Component-level signals | Page size is UI state, not data state |
| **Persistence** | localStorage in component | Simpler than service layer, appropriate for transient UI state |
| **Page Reset** | Signal update to currentPage: 1 | No API call needed for client-side pagination |

---

**Research Complete**: All technical questions resolved, implementation pattern confirmed, ready for Phase 1 (Design & Contracts).
