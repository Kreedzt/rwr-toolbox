# Quickstart: Data Table Enhancements

**Feature**: 002-table-enhancements
**Branch**: `002-table-enhancements`
**Date**: 2026-01-15

## Overview

This feature adds column visibility toggle, column sorting, tab switching (Weapons/Items), and code quality improvements to the RWR Toolbox data browser.

---

## Development Environment

### Prerequisites

- Node.js 20.x
- Rust (Edition 2021) with Cargo
- pnpm (preferred) or npm
- Angular CLI 20.x

### Setup

1. **Clone and checkout feature branch**:
   ```bash
   git checkout 002-table-enhancements
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1: Angular dev server
   pnpm run dev

   # Terminal 2: Tauri dev (optional, for backend testing)
   pnpm run tauri dev
   ```

---

## Project Structure

### Frontend (TypeScript/Angular)

```
src/app/
├── features/
│   └── data/
│       ├── data-layout/
│       │   ├── data-layout.component.ts      # Tab container (enhanced)
│       │   ├── data-layout.component.html
│       │   └── data-layout.component.css
│       ├── weapons/                          # Existing (Feature 001)
│       │   ├── weapons.component.ts          # Enhanced with sorting
│       │   ├── services/
│       │   │   └── weapon.service.ts         # Enhanced with sortState
│       │   └── weapon-columns.ts             # Existing column defs
│       └── items/                            # NEW
│           ├── items.component.ts            # Items table component
│           ├── items.component.html
│           ├── services/
│           │   └── item.service.ts           # Item data service
│           └── item-columns.ts               # Item column defs
├── shared/
│   └── models/
│       ├── weapons.models.ts                 # Existing
│       ├── items.models.ts                   # NEW: Item entities
│       ├── column.models.ts                  # NEW: Generic column types
│       └── sort.models.ts                    # NEW: Sort state types
└── assets/
    └── i18n/
        ├── en.json                           # Add items.* keys
        └── zh.json                           # Add items.* keys
```

### Backend (Rust/Tauri)

```
src-tauri/src/
├── lib.rs                                    # Register scan_items command
├── weapons.rs                                # Existing (Feature 001)
└── items.rs                                  # NEW: Items scanner
```

---

## Implementation Checklist

### Phase 1: Column Visibility Toggle (US1 - P1)

**Frontend**:
- [ ] Add `ColumnVisibility` type to `column.models.ts` (or use existing from weapons)
- [ ] Create `items-column-visibility.component.ts` (DaisyUI dropdown)
- [ ] Add column toggle button to items table toolbar
- [ ] Implement `onColumnToggle(columnId)` in ItemsComponent
- [ ] Add i18n keys for items columns

**Testing**:
- [ ] Toggle columns on/off
- [ ] Verify settings persist after page refresh
- [ ] Verify last column cannot be hidden

### Phase 2: Column Sorting (US2 - P2)

**Frontend**:
- [ ] Add `SortState` type to `sort.models.ts`
- [ ] Add `sortState` signal to WeaponService
- [ ] Add `setSortState()` / `getSortState()` methods
- [ ] Update `filteredWeapons` computed to apply sort
- [ ] Implement `sortWeapons()` with stable sort
- [ ] Add sort indicators to table headers (chevron-up/down)
- [ ] Handle null/undefined values correctly
- [ ] Implement three-state cycle (unsorted → asc → desc → unsorted)

**Apply same pattern to ItemService**:
- [ ] Mirror sorting implementation in ItemService

**Testing**:
- [ ] Click column headers to sort
- [ ] Verify sort direction cycles correctly
- [ ] Verify null values sort to correct position
- [ ] Verify sort maintains through filter/search

### Phase 3: Items Data Tab (US3 - P3)

**Backend (Rust)**:
- [ ] Create `src-tauri/src/items.rs`
- [ ] Define `Item`, `ItemModifier`, `ItemScanResult` structs
- [ ] Implement `scan_items()` Tauri command
- [ ] Parse `.carry_item` files (CarryItem struct)
- [ ] Parse `.visual_item` files (VisualItem struct)
- [ ] Scan `packages/**/items/` directory
- [ ] Handle parse errors gracefully
- [ ] Register command in `lib.rs`

**Frontend**:
- [ ] Create `src/app/shared/models/items.models.ts`
- [ ] Create `ItemService` with Signals pattern
- [ ] Create `items.component.ts/html`
- [ ] Create `item-columns.ts` with column definitions
- [ ] Add tab navigation to `data-layout.component`
- [ ] Implement `@if(tabState() === 'items')` switching
- [ ] Add `scan_items()` Tauri invoke call
- [ ] Add items i18n keys to `en.json` and `zh.json`

**Testing**:
- [ ] Switch between Weapons and Items tabs
- [ ] Verify items scan correctly from game directory
- [ ] Verify independent state per tab
- [ ] Verify empty-state message when no items found

### Phase 4: Code Quality Improvements (US4 - P4)

**Audit**:
- [ ] Search codebase for `BehaviorSubject` outside data directory
- [ ] Search for `toSignal()` usage patterns
- [ ] Search for manual `subscribe()` calls

**Refactor**:
- [ ] Convert `BehaviorSubject` state to `signal()`
- [ ] Remove `toSignal()` bridges - use service signals directly
- [ ] Replace `subscribe()` with Signal computed/reactive pattern
- [ ] Verify no memory leaks from unsubscribed observables

**Testing**:
- [ ] Run application and verify all features work
- [ ] Check browser console for errors/warnings
- [ ] Verify no memory leaks in DevTools

---

## Development Workflow

### 1. Component Development

**New Items Component**:
```bash
# Generate component (optional)
ng generate component features/data/items --skip-tests
```

**Follow existing WeaponsComponent pattern**:
- Use `inject()` for dependencies
- Use `signal()` for UI state
- Use `computed()` for derived state
- Delegate data logic to Service

### 2. Service Development

**ItemService should mirror WeaponService**:
- Private signals: `items`, `loading`, `error`, `searchTerm`, `filters`, `sortState`
- Public readonly signals via `.asReadonly()`
- Computed signal for `filteredItems` (filter + sort)
- Async methods for Tauri commands
- localStorage persistence for column visibility

### 3. Backend Development

**Add to `src-tauri/src/lib.rs`**:
```rust
mod items;

#[tauri::command]
async fn scan_items(game_path: String) -> Result<ItemScanResult, String> {
    items::scan_items(game_path).await
}

// Register in tauri::Builder
.invoke_handler(tauri::generate_handler![
    scan_weapons,
    scan_items,  // NEW
    // ... other commands
])
```

### 4. Internationalization

**Add to `src/assets/i18n/en.json`**:
```json
{
  "items": {
    "title": "Items",
    "columns": {
      "key": "Key",
      "name": "Name",
      "type": "Type",
      "encumbrance": "Weight",
      "price": "Price"
    },
    "noData": "No items found",
    "scanError": "Scan failed: {{error}}"
  }
}
```

**Add to `src/assets/i18n/zh.json`** (Chinese translation):
```json
{
  "items": {
    "title": "物品",
    "columns": {
      "key": "键",
      "name": "名称",
      "type": "类型",
      "encumbrance": "重量",
      "price": "价格"
    },
    "noData": "未找到物品",
    "scanError": "扫描失败：{{error}}"
  }
}
```

---

## Testing Checklist

### Manual Testing

**Column Visibility**:
- [ ] Open weapons table
- [ ] Click column visibility button
- [ ] Toggle "Magazine" column off
- [ ] Verify column disappears
- [ ] Refresh page
- [ ] Verify column visibility is restored
- [ ] Try to hide all columns
- [ ] Verify last column cannot be hidden

**Column Sorting**:
- [ ] Click any column header
- [ ] Verify ascending sort indicator appears
- [ ] Click same column again
- [ ] Verify descending sort indicator appears
- [ ] Click same column again
- [ ] Verify sort is cleared
- [ ] Click different column
- [ ] Verify previous sort is cleared
- [ ] Apply filter while sorted
- [ ] Verify filtered results maintain sort order

**Items Tab**:
- [ ] Click "Items" tab
- [ ] Verify items table appears
- [ ] Set a filter in Items tab
- [ ] Switch to Weapons tab
- [ ] Verify filter is NOT applied to Weapons
- [ ] Switch back to Items tab
- [ ] Verify filter is still applied
- [ ] Verify no re-scan occurs when switching tabs

### Resolution Testing

**800×600 Validation**:
- [ ] Open browser DevTools → Responsive Design Mode
- [ ] Set resolution to 800×600
- [ ] Verify no horizontal scrolling
- [ ] Verify all controls visible
- [ ] Verify table content scrolls while controls remain fixed

---

## Common Issues

### Issue: Column toggle doesn't persist
**Solution**: Verify localStorage key matches (`weapons.column.visibility` vs `items.column.visibility`)

### Issue: Sort doesn't work with null values
**Solution**: Ensure `compareValues()` handles `null`/`undefined` before type comparison

### Issue: Tab switch causes re-scan
**Solution**: Ensure components remain mounted (use `@if` not `*ngIf`), don't call scan on tab switch

### Issue: Items not found during scan
**Solution**: Verify game directory has `packages/**/items/` subdirectory with `.carry_item` files

---

## Next Steps

After implementation:

1. **Run linters**:
   ```bash
   pnpm run lint
   cargo clippy --manifest-path=src-tauri/Cargo.toml
   ```

2. **Format code**:
   ```bash
   pnpm run format
   cargo fmt --manifest-path=src-tauri/Cargo.toml
   ```

3. **Run tests** (if any):
   ```bash
   pnpm run test
   cargo test --manifest-path=src-tauri/Cargo.toml
   ```

4. **Update PROGRESS.md** with implementation summary

5. **Run `/speckit.tasks`** to generate detailed task breakdown

---

## References

- Constitution: `.specify/memory/constitution.md`
- Research: `specs/002-table-enhancements/research.md`
- Data Model: `specs/002-table-enhancements/data-model.md`
- Feature 001 (Weapons): `specs/001-weapons-directory-scanner/`
- Example item files: `docs-ai/rwr/*.carry_item`, `docs-ai/rwr/*.visual_item`
