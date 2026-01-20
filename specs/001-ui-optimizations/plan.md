# Implementation Plan: UI Optimizations

**Branch**: `001-ui-optimizations` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-optimizations/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements three UI improvements for the RWR Toolbox: (1) Fix search bar layout consistency to use vertical arrangement across all pages with search functionality, (2) Implement persistent storage for scan directories in settings, and (3) Add table-only vertical scrolling mode with layout toggle for all data tables (weapons, items, players, servers), plus (4) Adjust left navigation menu to properly utilize its 200px width.

The technical approach involves:
- Angular component template and CSS modifications for layout fixes
- Tauri plugin-store integration for persisting scan directories and scrolling mode preferences
- Angular Signals-based state management for scrolling mode state
- Tailwind CSS utility adjustments for navigation menu width utilization
- Runtime i18n (Transloco) for all user-facing text
- DaisyUI theme compatibility for all styling changes

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8.3 (Angular v20.3.15), Rust Edition 2021 (Tauri 2.x)
**Primary Dependencies**: Angular, Tailwind CSS v4.1.18, DaisyUI v5.5.14, Transloco v8.x, Tauri plugin-store, Lucide Angular v0.562.0
**Storage**: Tauri plugin-store for scan directories and scrolling mode preferences
**Testing**: Angular CLI tests (Karma/Jasmine), cargo test for Rust
**Target Platform**: Desktop (Windows, macOS, Linux) via Tauri
**Project Type**: Tauri desktop application (single project with Angular frontend + Rust backend)
**Performance Goals**: UI layout rendering <16ms, table scrolling maintains 60fps, persistence operations <100ms
**Constraints**: 800×600 minimum resolution, DaisyUI theme compatibility, Signal-based state management (no BehaviorSubjects), runtime i18n support
**Scale/Scope**: 4 data table pages (weapons, items, players, servers), settings page, navigation menu, 2 persistent preferences (scan directories, scrolling mode)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Desktop-First UI Design** | ✅ PASS | Search bar layout fixes, navigation menu width adjustments, and table scrolling changes comply with 800×600 minimum resolution and high information density requirements |
| **II. Internationalization (i18n)** | ✅ PASS | All new UI text (toggle button labels, tooltips) documented with Transloco keys in both en.json and zh.json (see quickstart Phase 8) |
| **III. Theme Adaptability** | ✅ PASS | All CSS modifications use Tailwind utilities and DaisyUI CSS variables - no fixed colors (see research Decision 7) |
| **IV. Signal-Based State Management** | ✅ PASS | ScrollingModeService implemented with Angular Signals (see research Decision 5) |
| **V. Documentation-Driven Development** | ✅ PASS | Feature completion will be recorded in docs-ai/PROGRESS.md (see quickstart Phase 9) |

### Technical Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| TypeScript 5.8.3 | ✅ PASS | Existing project uses this version |
| Angular v20.3.15 | ✅ PASS | Existing project uses this version |
| Tailwind CSS v4.1.18 | ✅ PASS | Use utility classes for layout changes (w-full, flex-col, overflow-y-auto) |
| DaisyUI v5.5.14 | ✅ PASS | CSS variables for theme compatibility |
| Transloco v8.x | ✅ PASS | Required for all new UI text (scrolling.* keys) |
| Tauri 2.x + Rust 2021 | ✅ PASS | Plugin-store for persistence (scan_directories, scrolling_mode) |
| pnpm | ✅ PASS | Package manager for development |
| Signal-only state | ✅ PASS | ScrollingModeService uses signal() not BehaviorSubject |

### Post-Design Re-verification

After Phase 1 design completion, all constitution requirements remain satisfied:

✅ **Desktop-First UI Design**:
- Table scrolling maintains 800×600 minimum (fixed height h-[600px] for table-only mode)
- High information density maintained (text-sm, text-xs not modified)
- Fixed layout strategy preserved (sidebar 200px, work area independent scrolling)

✅ **Internationalization (i18n)**:
- Runtime translation system documented with Transloco (quickstart Phase 8)
- All new UI text added to both en.json and zh.json
- Hierarchical dot notation used (scrolling.tableOnly, scrolling.fullPage)

✅ **Theme Adaptability**:
- DaisyUI CSS variables documented for all color usage (research Decision 7)
- No fixed hex colors in implementation plan
- Both light and dark theme compatibility tested in quickstart checklist

✅ **Signal-Based State Management**:
- ScrollingModeService uses signal() for mode state (research Decision 5)
- No BehaviorSubjects in design (DirectoryService and ScrollingModeService)
- Components access signals directly without toSignal() wrapper

✅ **Documentation-Driven Development**:
- PROGRESS.md update included in quickstart (Phase 9, Next Steps section 3)
- All changes will be documented with required sections

### Gates Summary

✅ **ALL GATES PASSED** (Pre-Design and Post-Design Verification) - No violations identified. Feature may proceed to `/speckit.tasks` for task breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/ (Angular frontend)
├── app/
│   ├── features/
│   │   ├── players/
│   │   │   ├── players.component.html
│   │   │   ├── players.component.css
│   │   │   └── players.component.ts
│   │   ├── weapons/
│   │   │   ├── weapons.component.html
│   │   │   ├── weapons.component.css
│   │   │   └── weapons.component.ts
│   │   ├── items/
│   │   │   ├── items.component.html
│   │   │   ├── items.component.css
│   │   │   └── items.component.ts
│   │   ├── servers/
│   │   │   ├── servers.component.html
│   │   │   ├── servers.component.css
│   │   │   └── servers.component.ts
│   │   ├── settings/
│   │   │   ├── services/
│   │   │   │   └── directory.service.ts
│   │   │   ├── settings.component.html
│   │   │   ├── settings.component.css
│   │   │   └── settings.component.ts
│   │   └── shared/
│   │       ├── models/
│   │       │   └── tab.models.ts (scrolling mode preference)
│   │       └── services/
│   │           └── scrolling-mode.service.ts (new)
├── assets/
│   └── i18n/
│       ├── en.json
│       └── zh.json
└── app.component.html (navigation menu)

src-tauri/ (Rust backend)
└── src/
    ├── lib.rs (Tauri commands for persistence)
    └── main.rs
```

**Structure Decision**: This is a Tauri desktop application (single project structure). Feature changes will affect Angular frontend components (players, weapons, items, servers, settings, navigation) and create a new scrolling mode service. Rust backend will support Tauri plugin-store for persistence operations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
