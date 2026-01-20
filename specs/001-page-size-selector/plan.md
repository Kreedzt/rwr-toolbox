# Implementation Plan: Page Size Selector for Data Tables

**Branch**: `001-page-size-selector` | **Date**: 2026-01-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-page-size-selector/spec.md`

## Summary

Add a page size selector dropdown to Weapons and Items data tables, following the UX pattern established in the Players page. Unlike Players (server-side pagination via API), Weapons and Items use client-side pagination where all filtered data is loaded in the browser and paginated using Angular Signals computed functions.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode)
**Primary Dependencies**: Angular v20.3.15, Transloco (i18n), DaisyUI v5.5.14, Lucide Angular v0.562.0
**Storage**: N/A (client-side state in Signals, localStorage for persistence)
**Testing**: Manual testing (no automated tests specified)
**Target Platform**: Tauri 2.x desktop application (Windows/macOS/Linux)
**Project Type**: Web (Angular frontend within Tauri)
**Performance Goals**: <100ms table update after page size change
**Constraints**: Must use Signals pattern (no BehaviorSubject), must follow Players page UX exactly
**Scale/Scope**: 2 components (Weapons, Items), 4 page size options (25, 50, 100, 200)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Desktop-First UI Design | ✅ PASS | 800×600 minimum, DaisyUI components used |
| II. Internationalization (i18n) | ✅ PASS | Transloco for all labels, en.json + zh.json required |
| III. Theme Adaptability | ✅ PASS | DaisyUI select-bordered, select-sm classes |
| IV. Signal-Based State Management | ✅ PASS | Client pagination uses computed() signals |
| V. Documentation-Driven Development | ✅ PASS | PROGRESS.md will be updated |
| VI. Icon Management | ✅ PASS | No new icons required |

**Gate Result**: ✅ ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-page-size-selector/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings (TBD)
├── data-model.md        # Phase 1: State model (TBD)
├── quickstart.md        # Phase 1: Developer guide (TBD)
├── contracts/           # Phase 1: Component interfaces (TBD)
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/app/features/data/
├── weapons/
│   ├── weapons.component.ts       # Add pageSize signal, onPageSizeChange(), getPageNumbers()
│   ├── weapons.component.html     # Add page size dropdown (mirrors Players layout)
│   └── services/
│       └── weapon.service.ts      # No changes needed (client-side filtering)
├── items/
│   ├── items.component.ts         # Add pageSize signal, onPageSizeChange(), getPageNumbers()
│   ├── items.component.html       # Add page size dropdown (mirrors Players layout)
│   └── services/
│       └── item.service.ts        # No changes needed (client-side filtering)
└── shared/
    └── services/
        └── scrolling-mode.service.ts  # No changes needed

src/assets/i18n/
├── en.json     # Add: weapons.page_size, weapons.page_size_25/50/100/200
├── zh.json     # Add: weapons.page_size, weapons.page_size_25/50/100/200
└──             # Add: items.page_size, items.page_size_25/50/100/200
```

**Structure Decision**: This is a web application (Angular frontend) with client-side state management. The Weapons and Items components already exist with Signals-based pagination. We're adding page size selection to the existing pagination infrastructure.

## Complexity Tracking

> No constitution violations to justify.

## Phase 0: Research

### Research Tasks

1. **Compare Players vs Weapons/Items Pagination Patterns**
   - Players: Server-side (API calls with page parameter)
   - Weapons/Items: Client-side (computed signals on loaded data)
   - Determine how to adapt Players UI pattern for client-side pagination

2. **Page Size Options for Data Tables**
   - Players uses: [20, 50, 100]
   - Spec requests: [25, 50, 100, 200]
   - Research: Why different options? (Weapons/Items have more rows than Players)

3. **localStorage Persistence Strategy**
   - Review existing column visibility persistence pattern in Weapons/Items services
   - Determine key naming: `weapons-page-size`, `items-page-size`

### Research Output

See [research.md](research.md) for findings and decisions.
