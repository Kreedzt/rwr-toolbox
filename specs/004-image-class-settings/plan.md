# Implementation Plan: Image Rendering, Weapon Class Display, and Scan Library Persistence

**Branch**: `004-image-class-settings` | **Date**: 2026-01-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-image-class-settings/spec.md`

## Summary

This feature fixes three critical issues in the RWR Toolbox data tables:

1. **Image Column Bug Fix**: Weapons and Items tables have image columns but images aren't rendering. The backend provides `hudIcon` field and a `get_texture_path` Tauri command, but the frontend doesn't use them correctly.

2. **Weapon Class Column Bug Fix**: The "Class" column currently displays `classTag` (from `<tag name="assault"/>`) instead of the actual `class` attribute (from `<specification class="0"/>`). These must be separated into two distinct columns: "Class Tag" and "Class".

3. **Scan Library Persistence**: Users must reselect scan libraries on every app launch. The DirectoryService persists directory lists but lacks a "selected directory" feature.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (frontend), Rust edition 2021 (backend via Tauri 2.x)
**Primary Dependencies**: Angular 20.3.15, Tauri 2.x, Transloco 8.x, Tailwind CSS 4.x, DaisyUI 5.x
**Storage**: Tauri plugin-store for persistent settings
**Testing**: Manual testing (no automated tests specified)
**Target Platform**: Desktop (Windows, macOS, Linux via Tauri)
**Project Type**: Single Angular project at `src/`
**Performance Goals**: Image loading should not block table rendering; graceful fallback for missing images
**Constraints**: 800×600 minimum resolution, i18n required (en.json + zh.json), Signal-based state management
**Scale/Scope**: ~200 weapons, ~300 items per scan

**Backend Status**:
- Rust already separates `tag` (string) and `class` (i32) in weapon parsing
- `get_texture_path` Tauri command exists for resolving texture file paths
- `hud_icon` field is properly parsed from XML

**Frontend Status**:
- Weapon model has both `classTag` and `class` fields
- Current column mapping: `{ key: 'class', field: 'classTag' }` - **THIS IS THE BUG**
- Image column exists but doesn't use Tauri command for path resolution
- DirectoryService has persistence for directory lists but no "selected directory" feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Desktop-First UI Design (800×600) | ✅ PASS | Image columns use fixed width, tables already responsive |
| II. Internationalization (i18n) | ✅ PASS | All new UI text will use Transloco keys in en.json + zh.json |
| III. Theme Adaptability (DaisyUI) | ✅ PASS | Image placeholders will use theme-aware CSS |
| IV. Signal-Based State Management | ✅ PASS | Will use existing Signals pattern in DirectoryService |
| V. Documentation-Driven Development | ✅ PASS | Will update PROGRESS.md after implementation |
| VI. Icon Management | ⚪ N/A | No new Lucide icons needed |

**Gate Result**: ✅ **PASS** - No constitution violations. All changes align with existing patterns.

## Project Structure

### Documentation (this feature)

```text
specs/004-image-class-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── components.md    # Component interface contracts
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── features/
│   │   ├── data/
│   │   │   ├── weapons/
│   │   │   │   ├── weapons.component.ts    # FIX: column mapping
│   │   │   │   ├── weapons.component.html  # FIX: image rendering
│   │   │   │   └── weapon-columns.ts       # FIX: add 'classTag' and 'class' columns
│   │   │   └── items/
│   │   │       ├── items.component.ts      # FIX: image rendering
│   │   │       ├── items.component.html    # FIX: image rendering
│   │   │       └── item-columns.ts         # (optional: item class if needed)
│   │   └── settings/
│   │       ├── services/
│   │       │   └── directory.service.ts    # ADD: selected directory persistence
│   │       ├── settings.component.ts       # ADD: selected directory management
│   │       └── settings.component.html     # ADD: UI for selected directory
│   ├── shared/
│   │   └── models/
│   │       ├── weapons.models.ts           # Already has classTag and class fields
│   │       └── directory.models.ts         # ADD: selectedDirectoryId field
│   └── assets/
│       └── i18n/
│           ├── en.json                     # ADD: new translation keys
│           └── zh.json                     # ADD: new translation keys
└── app/features/shared/services/
    └── scrolling-mode.service.ts           # No changes needed

src-tauri/
├── src/
│   ├── weapons.rs                          # Already has get_texture_path command
│   └── items.rs                            # May need get_texture_path for items
└── Cargo.toml
```

**Structure Decision**: Single Angular project at repository root. All changes are within existing feature modules.

## Complexity Tracking

> **No violations to justify - this section is intentionally empty.**

All changes are bug fixes and feature additions that align with existing architecture patterns. No complexity increases beyond standard feature development.
