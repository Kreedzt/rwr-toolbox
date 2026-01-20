# Implementation Plan: Tag Column Rename and Data Reading Fix

**Branch**: `005-tag-column-fix` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-005-tag-column/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix data reading bug where weapon tag values (e.g., "assault", "smg", "sniper") are not displaying correctly due to field name mismatch between Rust backend (serializes as `tag`) and TypeScript frontend (expects `classTag`). Also rename column label from "Class Tag" to "Tag" for clarity alongside the separate "Class" numeric column.

**Technical Approach**:
1. Rename TypeScript `Weapon.classTag` field to `tag` to match Rust serialization
2. Update all related types, columns, and component logic
3. Migrate existing localStorage column visibility preferences
4. Update i18n keys from `weapons.columns.classTag` to `weapons.columns.tag`

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Angular 20.3.15), Rust edition 2021
**Primary Dependencies**: Angular v20.3.15, Tauri 2.x, serde (Rust), Signals (Angular)
**Storage**: localStorage for column visibility preferences
**Testing**: Manual testing with real game data; no automated tests for this simple refactoring
**Target Platform**: Desktop (Tauri 2.x - Windows, macOS, Linux)
**Project Type**: Desktop application (Tauri + Angular)
**Performance Goals**: No performance impact (pure refactoring)
**Constraints**: Must migrate existing user preferences without data loss
**Scale/Scope**: Affects ~10 files across models, components, and i18n

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Desktop-First UI Design | PASS | No UI layout changes, only label renaming |
| II. Internationalization (i18n) | PASS | Will update i18n keys in en.json and zh.json |
| III. Theme Adaptability | PASS | No theme-related changes |
| IV. Signal-Based State Management | PASS | No state management changes |
| V. Documentation-Driven Development | PASS | This plan + PROGRESS.md update planned |
| VI. Icon Management | PASS | No icon changes |

**All gates passed** - no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/005-005-tag-column/
├── spec.md              # Feature specification (already created)
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - root cause already identified)
├── data-model.md        # Phase 1 output (Weapon interface changes)
├── quickstart.md        # Phase 1 output (migration guide)
└── contracts/           # Phase 1 output (N/A - no API contracts for this refactoring)
```

### Source Code (affected files)

```text
src/
├── app/
│   ├── shared/
│   │   └── models/
│   │       └── weapons.models.ts          # Rename classTag → tag
│   ├── features/
│   │   └── data/
│   │       └── weapons/
│   │           ├── weapon-columns.ts      # Update column config
│   │           ├── weapons.component.ts   # Rename signals/methods
│   │           └── weapons.component.html # Update bindings
│   └── assets/
│       └── i18n/
│           ├── en.json                    # Rename key
│           └── zh.json                    # Rename key
src-tauri/
└── src/
    └── weapons.rs                          # NO CHANGE (already uses 'tag')
```

**Structure Decision**: Single project (Tauri desktop app with Angular frontend). No new directories created - only modifications to existing files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All gates passed | N/A |

---

## Phase 0: Research & Unknowns

### Research Tasks

Given that the root cause is already identified (field name mismatch), research is minimal. The following is documented for completeness:

**Decision**: Align TypeScript field name with Rust serialization (`tag`)
**Rationale**: Rust backend uses `#[serde(rename = "tag")]` which serializes as `"tag"` in JSON. TypeScript expects `classTag`. Changing TypeScript is simpler than changing Rust (which would require changing XML parsing logic).
**Alternatives Considered**:
1. Change Rust to serialize as `classTag` - Rejected because XML element is `<tag name="..."/>`, so `tag` is the semantically correct name
2. Add alias mapping in TypeScript - Rejected because it adds unnecessary complexity

### State Migration Strategy

**localStorage Migration**: When loading column visibility preferences, check for legacy `classTag` key and migrate to `tag`:

```typescript
// In weapons.component.ts constructor
const saved = this.getColumnVisibility();
const migrated = saved.map(col => {
  if (col.columnId === 'classTag') {
    return { ...col, columnId: 'tag' };
  }
  return col;
});
this.setColumnVisibility(migrated);
```

---

## Phase 1: Design Artifacts

### Data Model Changes

See [data-model.md](./data-model.md) for detailed Weapon interface changes.

**Summary**:
- `Weapon.classTag: string` → `Weapon.tag: string`
- `WeaponColumnKey` includes `'tag'` instead of `'classTag'`
- `AdvancedFilters.classTag` → `AdvancedFilters.tag`

### Migration Guide

See [quickstart.md](./quickstart.md) for step-by-step implementation.

---

## Phase 2: Implementation Tasks

> **Note**: Tasks are generated by `/speckit.tasks` command, not included in this plan.

Expected task breakdown:
1. Update TypeScript models (weapons.models.ts)
2. Update column configuration (weapon-columns.ts)
3. Update component logic (weapons.component.ts)
4. Update HTML template (weapons.component.html)
5. Update i18n files (en.json, zh.json)
6. Build and test
7. Update PROGRESS.md

---

## References

- **Spec**: [spec.md](./spec.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Progress**: [docs-ai/PROGRESS.md](../../docs-ai/PROGRESS.md)
