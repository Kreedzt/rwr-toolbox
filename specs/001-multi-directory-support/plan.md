# Implementation Plan: Multi-Directory Scan Support

**Branch**: `001-multi-directory-support` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-multi-directory-support/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to configure multiple game/workshop directories for scanning. Each directory is validated by checking for a `media` subdirectory. Restore original navigation menu items (Dashboard, Servers, Players) while keeping the new "Data" menu item as a consolidated view for merged scan results. The "Source" column is removed from the data tables as the file path already provides sufficient context and the "Open in Editor" button allows direct access.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Angular 20.3.15), Rust Edition 2021 (Tauri 2.x)
**Primary Dependencies**: Angular 20.3.15, Transloco 8.x, Tailwind CSS 4.x, DaisyUI 5.x, Tauri 2.x, quick-xml
**Storage**: File-based configuration (Tauri settings store)
**Testing**: Karma + Jasmine (Frontend), cargo test (Backend)
**Target Platform**: Desktop (macOS, Windows, Linux) via Tauri
**Project Type**: Desktop application (Tauri + Angular)
**Performance Goals**: Directory validation < 1s, Scan result merging < 500ms
**Constraints**: UI must fit 800x600, Signal-based state management
**Scale/Scope**: ~10 directories, thousands of game items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Desktop-First UI Design | PASS | Layout supports 800x600, high density tables |
| II. Internationalization | PASS | All text uses Transloco keys |
| III. Theme Adaptability | PASS | Uses DaisyUI variables for all colors |
| IV. Signal-Based State Management | PASS | DirectoryService and Scan results use Signals |
| V. Documentation-Driven Development | PASS | Aligning with docs-ai/ and updating PROGRESS.md |

## Project Structure

### Documentation (this feature)

```text
specs/001-multi-directory-support/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── directory.service.ts  # NEW
│   │       └── settings.service.ts   # UPDATE
│   ├── features/
│   │   ├── dashboard/                # RESTORE TO NAV
│   │   ├── servers/                  # RESTORE TO NAV
│   │   ├── players/                  # RESTORE TO NAV
│   │   ├── data/
│   │   │   ├── local/                # MAIN DATA VIEW
│   │   │   ├── extract/
│   │   │   └── workshop/
│   │   ├── mods/
│   │   ├── hotkeys/
│   │   └── settings/                 # UPDATE FOR DIRECTORY MGMT
│   ├── shared/
│   │   ├── constants/
│   │   │   └── menu-items.ts         # UPDATE (Restore items)
│   │   └── models/
│   │       └── directory.models.ts   # NEW
│   └── app.routes.ts                 # UPDATE (Restore routes)
src-tauri/
├── src/
│   ├── lib.rs
│   ├── directories.rs                # NEW (Validation)
│   ├── weapons.rs                    # UPDATE (Multi-dir scan)
│   └── items.rs                      # UPDATE (Multi-dir scan)
```

**Structure Decision**: Standard Angular feature-based structure for frontend, module-based for Tauri backend.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A
