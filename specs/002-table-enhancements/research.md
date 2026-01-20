# Research: Data Table Enhancements

**Feature**: 002-table-enhancements
**Date**: 2026-01-15
**Status**: Complete

## Overview

This document captures technical research and design decisions for implementing column visibility toggle, column sorting, tab switching (Weapons/Items), and code quality improvements.

---

## Decision 1: Column Visibility Toggle Implementation

### Problem
Users need to customize which columns are visible in the data tables to focus on relevant attributes and reduce visual clutter.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Angular Material Table | Use mat-table with column hiding | Built-in column toggle, well-documented | Heavy dependency, breaks DaisyUI theme consistency |
| B) Custom DaisyUI Dropdown | Manual implementation with DaisyUI dropdown | Lightweight, theme-consistent, follows existing patterns | Requires manual state management |
| C) Third-party table library | Use ngx-datatable or AG Grid | Feature-rich, enterprise-grade | Overkill for simple use case, large bundle size |

### Decision: **Option B - Custom DaisyUI Dropdown**

**Rationale**:
- Aligns with existing weapons table implementation (Feature 001)
- DaisyUI already integrated and provides theme consistency
- Lightweight solution without additional dependencies
- Follows Principle VIII (Simplicity First) - no over-engineering
- localStorage for persistence matches existing pattern

**Implementation Approach**:
1. Use DaisyUI `dropdown` component with `dropdown-content` for column list
2. Store column visibility in localStorage per-tab (`weapons.column.visibility`, `items.column.visibility`)
3. Prevent hiding last visible column (FR-003)
4. Use computed signals to filter visible columns (follows Angular v20 Signal pattern)

---

## Decision 2: Column Sorting Implementation

### Problem
Users need to sort tables by any column in ascending/descending order to quickly find highest/lowest values.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Client-side array sort | Sort data array with JavaScript `sort()` | Simple, fast for <1000 items | Re-sorts on every filter change |
| B) Angular KeyValuePipe | Use `keyvalue` pipe with ordering | Built-in Angular solution | Limited to specific use cases, not for tables |
| C) RxJS `sort()` operator | Sort in observable pipeline | Reactive, composable | Adds unnecessary complexity with Signal pattern |

### Decision: **Option A - Client-side computed signal sort**

**Rationale**:
- Computed signals automatically re-sort when data changes
- Follows existing `filteredWeapons` pattern from Feature 001
- JavaScript `Array.prototype.sort()` with stable sort for equal items
- Fast enough for datasets up to 500 items (SC-002: 500ms target)
- No RxJS complexity - Signal管状态 principle

**Implementation Approach**:
1. Add `sortState` signal: `{ columnKey: string | null, direction: 'asc' | 'desc' | null }`
2. Create computed signal `sortedItems` that filters then sorts
3. Use TypeScript type guards for proper sorting (string vs number vs null handling)
4. Visual indicators with Lucide icons (`chevron-up`, `chevron-down`)
5. Three-state cycle: unsorted → ascending → descending → unsorted

**Null/Undefined Handling** (FR-011):
- Treat null/undefined as "less than" any defined value
- Ascending: nulls at end; Descending: nulls at beginning

---

## Decision 3: Tab Switching Architecture

### Problem
Need to switch between Weapons and Items views while maintaining independent state per tab.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Angular Router Tabs | Use router-outlet with child routes | Deep linking, browser history | Overkill, requires route config changes |
| B) Component @if switching | Toggle components with `@if(activeTab === 'weapons')` | Simple, no routing | Both components loaded in memory |
| C) Shared Component + Service | Single table component with data service | Reusable, DRY | Complex conditional logic |

### Decision: **Option B - Component @if switching with per-tab Services**

**Rationale**:
- Simplest solution matching current `data-layout` structure
- Independent Services (`WeaponService`, `ItemService`) for state isolation
- Per-tab state (filters, search, sort, column visibility) naturally separated
- No routing complexity - feature lives within `/data` route
- Tab switches complete instantly (SC-003: <100ms) as components remain mounted

**Implementation Approach**:
1. Add `tabState` signal to parent component: `'weapons' | 'items'`
2. Use `@if(tabState() === 'weapons')` and `@if(tabState() === 'items')`
3. Each tab component uses its own Service (state isolation per FR-016)
4. Tab UI with DaisyUI `tabs` component

---

## Decision 4: Items File Parsing Strategy

### Problem
Items in RWR have different file types (`.carry_item`, `.visual_item`, etc.) with varying XML structures, unlike the uniform `.weapon` files.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Parse all file types uniformly | Single generic parser for all items | DRY code | Complex union type, loss of type safety |
| B) Parse by file extension | Separate parsers for each type | Type-safe, extensible | More code, multiple parser functions |
| C) Parse only `.carry_item` | Focus on equipment items only | Simpler MVP | Incomplete, misses visual items |

### Decision: **Option B - Parse by file extension with extensible design**

**Rationale**:
- Type-safe - each item type has its own struct/interface
- Extensible - easy to add new item types later (`.armor`, `.item`, etc.)
- Follows existing weapons pattern (specific Rust struct)
- User specified: parse `items/` directory (same level as `weapons/`)
- Example files show `.carry_item` and `.visual_item` have different structures

**Implementation Approach**:
1. Scan `packages/**/items/` directory for `.carry_item`, `.visual_item`, `.item`, `.armor` files
2. Parse each file type with dedicated Rust struct:
   - `CarryItem`: for equipment (vests, helmets, consumables)
   - `VisualItem`: for visual props (may be skipped or minimal parse)
   - `Item` (generic): for other item types
3. Return unified `Item` list with `itemType` field to distinguish
4. Rust backend command: `scan_items` (parallel to `scan_weapons`)

**Item Entity Fields** (based on example files):
- Common: `key`, `name`, `encumbrance`, `price`, `filePath`, `sourceFile`, `packageName`
- CarryItem-specific: `slot`, `modifiers` (speed, detectability, etc.), `capacity`, `canRespawnWith`
- VisualItem: minimal parse (key, filename only)

---

## Decision 5: Column Storage Strategy

### Problem
Need to persist column visibility settings per-tab across sessions.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Tauri Store | Use `settings.json` via Tauri | Centralized, cross-platform | Requires Tauri API call, async complexity |
| B) localStorage | Browser localStorage API | Simple, synchronous | Browser-specific |
| C) File-based JSON | Manual JSON file read/write | Explicit control | Requires Tauri commands |

### Decision: **Option B - localStorage (consistent with existing weapons implementation)**

**Rationale**:
- Matches existing `WeaponService.setColumnVisibility()` pattern
- Synchronous access simplifies component initialization
- Sufficient for small JSON data (column visibility lists)
- No need for additional Tauri commands

**Storage Keys**:
- `weapons.column.visibility` (existing)
- `items.column.visibility` (new)

---

## Decision 6: toSignal Code Quality Refactoring

### Problem
Existing code outside data directory may use RxJS observables that should follow established Signal patterns.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Global toSignal wrapper | Create helper to convert all observables | Centralized conversion | Hides underlying issue, violates Principle IX |
| B) Refactor to Signal pattern | Convert observables to signals directly | Follows constitution | Requires component/service changes |
| C) Ignore for now | Leave as-is | No work | Technical debt accumulates |

### Decision: **Option B - Refactor to Signal pattern (FR-020 through FR-022)**

**Rationale**:
- Constitution Principle IX requires Signal管状态, RxJS管异步
- Feature 001 (weapons) established the correct pattern
- Any observable used for state storage violates the principle
- Component should directly reference Service signals, no `toSignal()` bridge

**Refactoring Scope**:
1. Audit components outside `src/app/features/data/` for:
   - `BehaviorSubject` used as state container
   - `toSignal(service.observable$)` patterns
   - Manual `subscribe()` calls
2. Convert to:
   - Service uses `signal()` for state
   - Component directly references service signal
   - RxJS limited to async operations only (Tauri invoke, HTTP, etc.)

---

## Decision 7: Stable Layout for Table Scrolling

### Problem
Search/filter controls should remain visible while table content scrolls (from clarification session).

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Fixed header with scrollable body | CSS `position: fixed` for header | Proven pattern | Requires careful height calculations |
| B) CSS Grid layout | Grid with fixed rows, scrollable content area | Modern, flexible | More complex setup |
| C) Flexbox with overflow | Flex container with `overflow-auto` on table wrapper | Simple, matches existing | Needs explicit height constraints |

### Decision: **Option C - Flexbox with overflow on table wrapper**

**Rationale**:
- Matches existing weapons component structure
- DaisyUI components work well with flexbox
- Explicit height constraints (`max-h-[calc(100vh-200px)]`) for table area
- Search/filter controls remain visible at top
- Page itself doesn't scroll - only table viewport

**Implementation**:
```html
<div class="flex flex-col h-screen">
  <!-- Fixed: Search/filter controls (no scroll) -->
  <div class="flex-shrink-0 p-4">...</div>

  <!-- Scrollable: Table content area -->
  <div class="flex-1 overflow-auto">
    <table>...</table>
  </div>
</div>
```

---

## Technology Choices

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| Frontend Framework | Angular | 20.x | Constitution mandated |
| State Management | Signals | Built-in | Constitution Principle IX |
| Desktop Framework | Tauri | 2.x | Existing project |
| Styling | Tailwind CSS + DaisyUI | 4.x / 5.x | Constitution mandated |
| Internationalization | Transloco | 8.x | Constitution Principle III |
| Icons | Lucide Angular | Latest | Existing project |
| Backend Language | Rust | Edition 2021 | Existing project |
| XML Parsing | quick-xml | Latest | Existing project (weapons) |

---

## Performance Considerations

1. **Column Sorting** (SC-002):
   - Target: <500ms for 500 items
   - Use native `Array.prototype.sort()` with typed comparison functions
   - Avoid re-sort on every render - sort in computed signal

2. **Tab Switching** (SC-003):
   - Target: <100ms
   - Components remain mounted, only visibility toggles
   - No re-scan when switching tabs

3. **Large Dataset Rendering**:
   - Consider virtual scrolling if item count exceeds 1000
   - Current scope: 500 items maximum per spec

---

## Open Questions Resolved

| Question | Resolution | Reference |
|----------|------------|-----------|
| Items file location | `packages/**/items/` directory (same level as `weapons/`) | User clarification |
| Item file types | `.carry_item`, `.visual_item`, `.item`, `.armor` (extensible) | Research from example files |
| Column storage | localStorage per-tab with keys `weapons.column.visibility`, `items.column.visibility` | Decision 5 |
| Scroll behavior | Fixed controls, scrollable table viewport only | Decision 7 |

---

## References

- Constitution: `.specify/memory/constitution.md`
- Feature 001 (Weapons): `specs/001-weapons-directory-scanner/`
- Example item files: `docs-ai/rwr/custome_rabbit.carry_item`, `docs-ai/rwr/burning_piece.visual_item`, `docs-ai/rwr/vest_exo.carry_item`
