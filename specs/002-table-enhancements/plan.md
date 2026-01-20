# Implementation Plan: Data Table Enhancements

**Branch**: `002-table-enhancements` | **Date**: 2026-01-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-table-enhancements/spec.md`

## Summary

This feature enhances the existing data table (Feature 001: Weapons Directory Scanner) with three user-facing improvements and one code quality improvement:

1. **Column Visibility Toggle (P1)**: Users can customize which columns are visible via a dropdown menu, with settings persisted to localStorage
2. **Column Sorting (P2)**: Click column headers to sort ascending/descending, with visual indicators and null-safe sorting
3. **Items Data Tab (P3)**: New tab alongside Weapons to browse game items (carry_item, visual_item, etc.) with independent state
4. **Code Quality Improvements (P4)**: Refactor non-data directory components to follow Angular v20 Signal patterns

**Technical Approach**: Extend existing WeaponsComponent/WeaponService patterns to create ItemsComponent/ItemService. Use Signals for state management, localStorage for persistence, and DaisyUI components for UI consistency.

---

## Technical Context

**Language/Version**: TypeScript 5.8 (Angular 20.x), Rust Edition 2021 (Tauri 2.x)
**Primary Dependencies**: Angular 20.3.15, Tauri 2.x, Tailwind CSS 4.x, DaisyUI 5.x, Transloco 8.x, quick-xml (Rust)
**Storage**: localStorage (column visibility, sort state per-tab), JSON files via Tauri Store (settings)
**Testing**: Manual testing (no unit tests in scope), cargo test (Rust), pnpm run lint (TypeScript)
**Target Platform**: Desktop (Windows, macOS, Linux) via Tauri
**Project Type**: Single project (Angular frontend + Rust backend in same repository)
**Performance Goals**: Column sort <500ms for 500 items, tab switch <100ms, item scan <3 seconds
**Constraints**: 800×600 minimum resolution (no horizontal scroll), Signal管状态/RxJS管异步 pattern (Principle IX)
**Scale/Scope**: ~500 weapons, ~500-1000 items, 2 tabs, 7-10 columns per table

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Documentation-First | ✅ PASS | Follows spec → plan → tasks workflow |
| II. Desktop-First Design | ✅ PASS | 800×600 maintained, DaisyUI components, high information density |
| III. i18n Mandate | ✅ PASS | All UI text via Transloco keys (`items.*` keys added) |
| IV. AI Collaboration Protocol | ✅ PASS | Following established workflow, Chinese output |
| V. Data Safety & Backup | ✅ PASS | Read-only operations, no file writes |
| VI. Resolution Constraint | ✅ PASS | Column toggle prevents overflow, stable layout maintains 800×600 |
| VII. Architecture Consistency | ✅ PASS | Follows Feature 001 patterns, Signal管状态 |
| VIII. Simplicity First | ✅ PASS | No new dependencies, reuses existing patterns |
| IX. Angular v20 Modern Architecture | ✅ PASS | Signals for state, no BehaviorSubject, no toSignal() bridges |
| X. Dark Mode Mandate | ✅ PASS | DaisyUI semantic classes (`bg-base-100`, `text-base-content`) |

### Technology Stack Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Angular 20.x | ✅ PASS | Existing project, using @if/@for/@switch, input()/output() |
| Tauri 2.x | ✅ PASS | Existing project, `scan_items` command added |
| Tailwind CSS 4.x + DaisyUI 5.x | ✅ PASS | Existing project, dropdown/tabs components |
| Transloco 8.x | ✅ PASS | Existing project, runtime language switching |
| Lucide Angular | ✅ PASS | Existing project, sort icons (chevron-up/down) |

### Architecture Pattern Compliance

| Pattern | Status | Implementation |
|---------|--------|----------------|
| Signal管状态 | ✅ PASS | Service uses `signal()` for state, computed for filtered/sorted data |
| RxJS管异步 | ✅ PASS | RxJS limited to Tauri invoke (async), no Observable state storage |
| Component直接引用Service Signal | ✅ PASS | No `toSignal()` bridges, component uses `service.itemsSig` |
| @if/@for/@switch | ✅ PASS | Tab switching with `@if(tabState() === 'items')` |

### Overall Gate Status: ✅ PASS - No violations

---

## Project Structure

### Documentation (this feature)

```text
specs/002-table-enhancements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Technical decisions
├── data-model.md        # Phase 1 output - Entity definitions
├── quickstart.md        # Phase 1 output - Development setup
├── contracts/           # Phase 1 output - API contracts
│   └── tauri-commands.md
├── spec.md              # Feature specification
├── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── features/
│   │   └── data/
│   │       ├── data-layout/              # ENHANCED
│   │       │   ├── data-layout.component.ts      # Add tab state, switching logic
│   │       │   ├── data-layout.component.html    # Add tab navigation UI
│   │       │   └── data-layout.component.css
│   │       ├── weapons/                         # ENHANCED (Feature 001)
│   │       │   ├── weapons.component.ts          # Add sorting state/methods
│   │       │   ├── weapons.component.html        # Add sort indicators to headers
│   │       │   ├── services/
│   │       │   │   └── weapon.service.ts         # Add sortState signal, sorting logic
│   │       │   └── weapon-columns.ts             # Existing (no changes)
│   │       └── items/                            # NEW (Feature 002)
│   │           ├── items.component.ts            # Items table component
│   │           ├── items.component.html          # Items table template
│   │           ├── items.component.scss
│   │           ├── services/
│   │           │   └── item.service.ts           # Item data service (Signals pattern)
│   │           └── item-columns.ts               # Item column definitions
│   ├── shared/
│   │   └── models/
│   │       ├── weapons.models.ts                 # Existing (no changes)
│   │       ├── items.models.ts                   # NEW: Item entities
│   │       ├── column.models.ts                  # NEW: Generic column types
│   │       └── sort.models.ts                    # NEW: Sort state types
│   ├── core/
│   │   └── services/
│   │       └── settings.service.ts               # Existing (no changes)
│   └── assets/
│       └── i18n/
│           ├── en.json                           # ENHANCED: Add items.* keys
│           └── zh.json                           # ENHANCED: Add items.* keys
└── main.ts

src-tauri/
├── src/
│   ├── lib.rs                                    # ENHANCED: Register scan_items command
│   ├── weapons.rs                                # Existing (no changes)
│   ├── items.rs                                  # NEW: Items scanner module
│   └── rwrmi.rs                                  # Existing (no changes)
├── Cargo.toml
└── tauri.conf.json
```

**Structure Decision**: Single project structure (Option 1) - Angular frontend + Rust backend in same repository. This matches the existing project structure. The feature adds new items/ directory parallel to weapons/, with shared model types in src/app/shared/models/.

---

## Complexity Tracking

> No complexity violations - all architecture decisions align with Constitution principles and follow established patterns from Feature 001.

| Aspect | Decision | Justification |
|--------|----------|---------------|
| Column Toggle | Custom DaisyUI dropdown | Lightweight, theme-consistent, no new dependencies |
| Sorting | Computed signal with Array.sort() | Fast, follows existing filteredWeapons pattern |
| Tab Switching | @if component toggle | Simple, no routing complexity, state isolation via Services |
| Items Parsing | Extension-based separate structs | Type-safe, extensible, matches weapons pattern |

---

## Phase 0: Research & Decisions

**Status**: ✅ Complete - See [research.md](research.md)

### Key Decisions

1. **Column Visibility**: Custom DaisyUI dropdown with localStorage persistence
2. **Column Sorting**: Computed signal with stable sort, null-safe comparison
3. **Tab Switching**: @if component toggle with per-tab Services for state isolation
4. **Items Parsing**: Extension-based parsing (.carry_item, .visual_item, etc.) with extensible design
5. **Column Storage**: localStorage per-tab (matches existing weapons pattern)
6. **toSignal Refactoring**: Convert to Signal pattern (Principle IX compliance)
7. **Scrolling**: Fixed controls, scrollable table viewport only

---

## Phase 1: Design & Artifacts

**Status**: ✅ Complete

### Artifacts Generated

1. **[research.md](research.md)** - Technical decisions and trade-offs
2. **[data-model.md](data-model.md)** - Entity definitions, state structures, data flows
3. **[quickstart.md](quickstart.md)** - Development setup and implementation checklist
4. **[contracts/tauri-commands.md](contracts/tauri-commands.md)** - Tauri API contracts

### Data Model Summary

**New Entities**:
- `GameItem` (union of CarryItem, VisualItem, GenericItem)
- `ColumnConfig<T>` (generic column configuration)
- `SortState` (column key + direction)
- `DataTab` ('weapons' | 'items')

**Enhanced Services**:
- `WeaponService`: Add `sortState` signal, sorting logic
- `ItemService` (new): Mirror WeaponService pattern

**Backend**:
- `items.rs` module with `scan_items` command
- Parse `.carry_item`, `.visual_item`, `.item`, `.armor` files
- Scan `packages/**/items/` directory

---

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design completion*

### Principle Compliance Confirmation

| Principle | Status | Design Confirmation |
|-----------|--------|---------------------|
| I. Documentation-First | ✅ PASS | research.md, data-model.md, quickstart.md complete |
| II. Desktop-First Design | ✅ PASS | Column toggle prevents overflow, stable layout maintained |
| III. i18n Mandate | ✅ PASS | items.* keys defined in quickstart.md |
| IV. AI Collaboration Protocol | ✅ PASS | Following workflow, Chinese output |
| V. Data Safety & Backup | ✅ PASS | Read-only operations, no game file writes |
| VI. Resolution Constraint | ✅ PASS | 800×600 maintained, table area scrolls independently |
| VII. Architecture Consistency | ✅ PASS | Follows Feature 001 patterns exactly |
| VIII. Simplicity First | ✅ PASS | No new dependencies, minimal abstraction |
| IX. Angular v20 Modern Architecture | ✅ PASS | Signals for all state, no BehaviorSubject |
| X. Dark Mode Mandate | ✅ PASS | DaisyUI semantic classes throughout |

### Overall Gate Status: ✅ PASS - Proceed to Phase 2 (tasks generation)

---

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed, dependency-ordered task breakdown
2. **Implement Phase 1-4** following task sequence
3. **Update PROGRESS.md** after implementation completion

---

## References

- Constitution: `.specify/memory/constitution.md`
- Specification: `specs/002-table-enhancements/spec.md`
- Feature 001 (Weapons): `specs/001-weapons-directory-scanner/`
- Example item files: `docs-ai/rwr/*.carry_item`, `docs-ai/rwr/*.visual_item`
