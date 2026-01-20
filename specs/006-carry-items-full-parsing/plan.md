# Implementation Plan: Full Carry Items Parsing with Extended Attributes

**Branch**: `006-carry-items-full-parsing` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-carry-items-full-parsing/spec.md`

## Summary

Parse ALL `<carry_item>` elements from multi-item XML files (previously only first item was extracted), extract extended attributes (capacity, commonness, modifiers, transform_on_consume, time_to_live_out_in_the_open, draggable), and display them in the Items table with configurable columns and detail modal.

**Primary Requirements**:
- Parse all items from multi-item files (e.g., vest2.carry_item contains 15 items)
- Extract and display capacity, commonness, and modifiers
- Add new behavioral attributes: transform_on_consume, time_to_live_out_in_the_open, draggable
- Configurable table columns with column visibility feature
- Detail modal with extended attributes sections

**Technical Approach**: Extend existing Rust XML parsing (items.rs) to iterate over all items in a file, add new fields to data models (frontend and backend), update Angular component to display new columns and modal sections.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Angular 20.3.15 frontend), Rust edition 2021 (Tauri 2.x backend)
**Primary Dependencies**: Angular v20.3.15, Tauri 2.x, quick-xml (Rust), Transloco 8.x (i18n), Tailwind CSS 4.1.18, DaisyUI 5.5.14, Tauri plugin-store
**Storage**: File-based XML (game data) + Tauri plugin-store (settings persistence)
**Testing**: Manual testing + automated build validation (cargo clippy, pnpm build)
**Target Platform**: Desktop (Tauri - Windows/macOS/Linux)
**Project Type**: Single Tauri project (Rust backend + Angular frontend)
**Performance Goals**: Table rendering <2 seconds for 500+ items with extended attributes
**Constraints**: Desktop-first 800×600 minimum resolution, Signal-based state management, runtime i18n (Transloco)
**Scale/Scope**: ~15 items from vest2.carry_item, potentially hundreds of items total across all carry_item files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Desktop-First UI Design | ✅ PASS | Items table uses 800×600 minimum, sticky columns, dense information display |
| II. Internationalization (i18n) | ✅ PASS | All UI text uses Transloco runtime translation; en.json and zh.json include new keys |
| III. Theme Adaptability | ✅ PASS | DaisyUI themes with CSS variables; badges use badge-success/badge-ghost |
| IV. Signal-Based State Management | ✅ PASS | ItemService uses signals for items, loading, error; components access directly |
| V. Documentation-Driven Development | ✅ PASS | Spec, plan, tasks, contracts documented; PROGRESS.md to be updated |
| VI. Icon Management | ✅ PASS | Uses Lucide Angular icons via centralized registry |

### Technical Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| Angular v20.3.15 | ✅ PASS | Frontend uses Angular 20.3.15 |
| TypeScript 5.8.3 strict mode | ✅ PASS | Frontend uses TypeScript 5.8.3 strict |
| Tailwind CSS v4.1.18 + DaisyUI v5.5.14 | ✅ PASS | UI uses Tailwind + DaisyUI |
| Tauri 2.x + Rust 2021 | ✅ PASS | Backend uses Tauri 2.x, Rust edition 2021 |
| pnpm package manager | ✅ PASS | Project uses pnpm |
| cargo fmt/clippy | ✅ PASS | Rust code formatted and linted |

**Result**: ✅ All gates passed - no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/006-carry-items-full-parsing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (skipped - already researched)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
└── tasks.md             # Phase 2 output (already exists - /speckit.tasks command)
```

### Source Code (repository root)

```text
# Tauri Desktop Application (Rust + Angular)
src-tauri/
├── src/
│   ├── items.rs          # Backend: Carry item XML parsing, multi-item support, extended attributes
│   ├── lib.rs            # Tauri command registration
│   └── (other Rust modules)

src/app/
├── shared/
│   ├── models/
│   │   └── items.models.ts      # Frontend: Item data models (GenericItem, CarryItem, ItemCapacity, ItemCommonness, ItemModifier)
├── features/
│   └── data/
│       └── items/
│           ├── items.component.ts       # Items table component with detail modal
│           ├── items.component.html     # Template with table, modal, extended attributes
│           ├── services/
│           │   └── item.service.ts        # Item scanning service with Signals
│           └── item-columns.ts           # Column definitions for table
└── assets/
    └── i18n/
        ├── en.json                     # English translations
        └── zh.json                     # Chinese translations
```

**Structure Decision**: Single Tauri project structure with Rust backend for XML parsing and Angular frontend for UI. This is the established pattern for the project.

## Complexity Tracking

> No constitution violations - this section is not applicable.
