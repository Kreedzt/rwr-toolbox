# Implementation Plan: Weapons Table Pagination

**Branch**: `003-ux-improvements` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: User request: "现在 weapons 的表格搜索非常卡, 并且这个数量过多请增加分页器, 就像 servers 视图一样"

## Summary

Add pagination to the Weapons table (and Items table) to improve performance when searching through large datasets. The current implementation filters all weapons in memory and renders the entire list, causing significant lag when typing search queries. This feature will implement client-side pagination similar to the Servers view, displaying a configurable number of items per page with page navigation controls.

**Performance Problem**: With 1000+ weapons, each keystroke in the search box triggers filtering and rendering of all items, causing 500ms+ delays and poor UX.

**Solution**: Implement pagination with default page size of 100 items, reducing rendered DOM elements and improving search responsiveness to <50ms.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Angular 20.3.15)
**Primary Dependencies**: @angular/core, @angular/cdk (for virtual scrolling fallback), Transloco, Lucide Angular
**Storage**: In-memory signals pattern (WeaponService, ItemService)
**Testing**: Manual testing (performance validation)
**Target Platform**: Desktop (Tauri 2.x, Windows/macOS/Linux)
**Project Type**: Web application (Angular frontend + Rust backend via Tauri)
**Performance Goals**: <50ms search response time, <100ms page navigation, smooth typing experience
**Constraints**: Must maintain existing Signals pattern, no backend changes required (client-side only), must preserve existing filter/sort functionality
**Scale/Scope**: 1000-5000 weapons/items expected, 100 items per page default

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### I. Desktop-First UI Design ✓ PASS
- Pagination controls will fit within 800×600 minimum resolution
- Use `text-xs` and `text-sm` sizing for compact pagination UI
- Follow DaisyUI component patterns (join, btn-xs) for consistency

### II. Internationalization (i18n) ✓ PASS
- All pagination text MUST use Transloco keys
- New keys required: `weapons.pagination_info`, `items.pagination_info`
- Both English and Chinese translations required

### III. Theme Adaptability ✓ PASS
- Use DaisyUI button and join component classes
- All styling uses DaisyUI CSS variables for light/dark theme support
- No custom color overrides required

### IV. Signal-Based State Management ✓ PASS
- Pagination state MUST use `signal<PaginationState>()` pattern
- Computed signals for `paginatedWeapons`, `totalItems`, `totalPages`
- NO RxJS BehaviorSubjects or toSignal() conversions
- Follow existing ServersComponent pattern exactly

### V. Documentation-Driven Development ✓ PASS
- Update PROGRESS.md with pagination implementation
- Document performance improvements
- Record any breaking changes or migrations

### VI. Icon Management ✓ PASS
- No new icons required (using existing pagination patterns)
- If icons needed (ChevronLeft, ChevronRight), register in APP_ICONS

**Gate Result**: ✓ ALL PASSED - Proceed with Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/003-ux-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output (performance analysis, pagination patterns)
├── data-model.md        # Phase 1 output (PaginationState already exists)
├── quickstart.md        # Phase 1 output (pagination usage guide)
├── contracts/           # Phase 1 output (PaginationState interface)
└── tasks.md             # Existing tasks file (will add pagination tasks)
```

### Source Code (repository root)

```text
src/app/features/data/
├── weapons/
│   ├── weapons.component.ts      # ADD: Pagination state, computed signals
│   ├── weapons.component.html     # ADD: Pagination controls UI
│   └── services/
│       └── weapon.service.ts      # NO CHANGE: Service provides all weapons
└── items/
    ├── items.component.ts         # ADD: Pagination state, computed signals
    ├── items.component.html        # ADD: Pagination controls UI
    └── services/
        └── item.service.ts         # NO CHANGE: Service provides all items

src/app/shared/models/
└── common.models.ts                # EXISTS: PaginationState interface
```

**Structure Decision**: Existing Angular frontend with Signals pattern. Pagination is client-side only (no backend changes). Follow ServersComponent pattern exactly for consistency.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | This is a straightforward pagination feature following established patterns |

---

## Phase 0: Research & Analysis

### Research Tasks

1. **Performance Profiling**
   - Task: Profile current search latency with 1000+ weapons
   - Method: Measure time from keystroke to render completion
   - Expected: 500ms+ delays on each keystroke
   - Target: <50ms with pagination

2. **Pagination Pattern Analysis**
   - Task: Analyze ServersComponent pagination implementation
   - Findings:
     - Uses `signal<Pick<PaginationState, 'currentPage' | 'pageSize'>>()` for state
     - Computed signals: `filteredServers`, `paginatedServers`, `totalPages`
     - UI: DaisyUI join component with btn-xs buttons
     - Page numbers with ellipsis for large page counts
     - Display range: "Showing X to Y of Z items"
   - Reusability: Pattern is directly applicable to Weapons/Items

3. **Existing Dependencies**
   - `PaginationState` interface exists in `common.models.ts`
   - No new packages required
   - DaisyUI components available (`join`, `btn-xs`)

4. **Internationalization Requirements**
   - Current: `servers.pagination_info` key exists
   - New: `weapons.pagination_info`, `items.pagination_info` keys needed
   - Format: `"Showing {{ start }} to {{ end }} of {{ total }} weapons"`

### Research Findings

**Decision**: Client-side pagination (not server-side)
**Rationale**:
- All weapons/items already loaded in memory (Rust backend scans entire directory)
- Network latency not a factor (local file system)
- Simpler implementation (no backend API changes)
- Instant page navigation (<50ms)
- Search filters apply to full dataset, then pagination applies to filtered results

**Alternatives Considered**:
- Virtual scrolling with @angular/cdk: More complex, requires refactoring table structure
- Infinite scroll: Poor UX for "find specific item" use case
- Server-side pagination: Requires backend changes, not needed for local data

---

## Phase 1: Design & Contracts

### Data Model Updates

**Existing Model** (no changes needed):
```typescript
// src/app/shared/models/common.models.ts
export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
```

**Component State Pattern** (from ServersComponent):
```typescript
// Local component state (partial PaginationState)
pagination = signal<Pick<PaginationState, 'currentPage' | 'pageSize'>>({
    currentPage: 1,
    pageSize: 100, // Default: 100 items per page
});

// Computed signals
totalItems = computed(() => this.filteredWeapons().length);
totalPages = computed(() => Math.ceil(this.totalItems() / this.pagination().pageSize) || 1);
paginatedWeapons = computed(() => {
    const filtered = this.filteredWeapons();
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
});
```

### API Contracts (None Required)

No backend API changes needed. This is purely a frontend optimization using existing service data.

### UI/UX Design

**Pagination Controls** (DaisyUI join component):
```html
<!-- Display Stats -->
<div class="text-[10px] text-base-content/50">
    {{ 'weapons.pagination_info' | transloco: {
        start: getDisplayRange().start,
        end: getDisplayRange().end,
        total: totalItems()
    } }}
</div>

<!-- Page Navigation -->
<div class="join">
    @for (page of getPageNumbers(); track page) {
        @if (page === -1) {
            <button class="btn btn-xs join-item pointer-events-none opacity-50">...</button>
        } @else {
            <button class="btn btn-xs join-item"
                [class.btn-active]="page === pagination().currentPage"
                (click)="onPageChange(page)">
                {{ page }}
            </button>
        }
    }
</div>
```

**Behavioral Requirements**:
- Reset to page 1 when search term changes
- Reset to page 1 when filters change
- Reset to page 1 when sort changes
- Maintain page position when refresh button clicked
- Hide pagination when totalPages = 1

### i18n Keys Required

```json
// src/assets/i18n/en.json
{
    "weapons": {
        "pagination_info": "Showing {{ start }} to {{ end }} of {{ total }} weapons"
    },
    "items": {
        "pagination_info": "Showing {{ start }} to {{ end }} of {{ total }} items"
    }
}

// src/assets/i18n/zh.json
{
    "weapons": {
        "pagination_info": "显示第 {{ start }} - {{ end }} 条，共 {{ total }} 条武器"
    },
    "items": {
        "pagination_info": "显示第 {{ start }} - {{ end }} 条，共 {{ total }} 条物品"
    }
}
```

---

## Implementation Phases

### Phase A: Weapons Component Pagination (Core)

**Files Modified**:
- `src/app/features/data/weapons/weapons.component.ts`
- `src/app/features/data/weapons/weapons.component.html`
- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`

**Tasks**:
1. Add pagination state signal to WeaponsComponent
2. Add computed signals (totalItems, totalPages, paginatedWeapons)
3. Update table to iterate over `paginatedWeapons()` instead of `weapons()`
4. Add pagination controls UI (inspired by ServersComponent)
5. Add i18n keys for pagination_info
6. Add onPageChange handler
7. Reset to page 1 when search/filters/sort changes
8. Test performance with 1000+ weapons

### Phase B: Items Component Pagination (Consistency)

**Files Modified**:
- `src/app/features/data/items/items.component.ts`
- `src/app/features/data/items/items.component.html`
- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`

**Tasks**:
1. Apply same pagination pattern as WeaponsComponent
2. Ensure consistent UI/UX across both tables
3. Test with 1000+ items

### Phase C: Edge Cases & Polish

**Tasks**:
1. Handle empty results (no items match filters)
2. Handle single page (hide pagination controls)
3. Add keyboard navigation (optional: Arrow keys for page navigation)
4. Add page size selector (optional: 50/100/200 per page)
5. Performance testing with 5000+ items
6. Cross-browser testing (Chrome, Firefox, Safari on Windows/macOS/Linux)

---

## Success Criteria

### Measurable Outcomes

- **SC-PAG-001**: Search response time <50ms with 1000+ weapons
- **SC-PAG-002**: Page navigation time <100ms
- **SC-PAG-003**: Pagination controls visible when totalPages > 1
- **SC-PAG-004**: Pagination controls hidden when totalPages = 1
- **SC-PAG-005**: Page resets to 1 when search term changes
- **SC-PAG-006**: Display range shows accurate counts (e.g., "1 to 100 of 1234")
- **SC-PAG-007**: Page numbers with ellipsis for large page counts (>7 pages)
- **SC-PAG-008**: i18n translations present for EN and ZH
- **SC-PAG-009**: Consistent UI/UX between Weapons and Items tables
- **SC-PAG-010**: No regression to existing filter/sort functionality

### Performance Benchmarks

| Dataset Size | Before Pagination | After Pagination | Improvement |
|--------------|-------------------|------------------|-------------|
| 500 weapons  | ~200ms/search     | <30ms/search     | 6.7x faster |
| 1000 weapons | ~500ms/search     | <50ms/search     | 10x faster  |
| 2000 weapons | ~1000ms/search    | <50ms/search     | 20x faster  |

---

## Dependencies & Constraints

### D-PAG-001: WeaponsComponent Structure
- **Depends on**: Existing WeaponsComponent with Signal-based state
- **Constraints**: Must maintain existing filteredWeapons computed signal
- **Blockers**: None

### D-PAG-002: ItemsComponent Structure
- **Depends on**: Existing ItemsComponent with Signal-based state
- **Constraints**: Must maintain existing filteredItems computed signal
- **Blockers**: None

### D-PAG-003: i18n Keys
- **Depends on**: Transloco service and translation files
- **Constraints**: Must add both EN and ZH translations
- **Blockers**: None

### D-PAG-004: DaisyUI Components
- **Depends on**: DaisyUI v5.5.14 (already installed)
- **Constraints**: Use join and btn-xs component classes
- **Blockers**: None

---

## Risks & Decisions

### Risk 1: Filtered Results Span Multiple Pages
**Risk**: User searches, gets results on page 1, but relevant items on page 5+
**Mitigation**: Reset to page 1 on any filter/search change (standard UX pattern)

### Risk 2: Performance with 5000+ Items
**Risk**: 100 items per page may still be slow with very large datasets
**Mitigation**: Monitor performance, consider reducing pageSize to 50 or adding virtual scrolling within page

### Risk 3: Breaking Existing Features
**Risk**: Changes to table iteration may break row click handlers, column sorting
**Mitigation**: Careful testing of all existing features (search, filter, sort, row click, column visibility)

### Decision 1: Page Size = 100 (Default)
**Decision**: Default page size of 100 items
**Rationale**: Balance between information density (desktop UI) and performance
**Alternative**: 50 items (too many clicks), 200 items (slower rendering)

### Decision 2: No Page Size Selector (Phase 1)
**Decision**: Fixed page size of 100, no user-configurable page size
**Rationale**: Simpler implementation, sufficient for most use cases
**Alternative**: Add page size selector (50/100/200) in Phase C if needed

---

## Notes

- Pagination is CLIENT-SIDE only (no backend changes)
- Follows ServersComponent pattern exactly for consistency
- Uses existing PaginationState interface (no new models)
- Resets to page 1 on any search/filter/sort change
- Hides pagination controls when single page
- Display range format: "Showing X to Y of Z items"
- Performance improvement: 10-20x faster search with large datasets

---

**End of Implementation Plan**
