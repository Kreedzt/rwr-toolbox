# RWR Toolbox Project Constitution

<!--
Sync Impact Report:
- Version: 1.0.1 → 1.1.0 (minor update)
- Modified: Added Principle VI - Icon Management (NON-NEGOTIABLE)
- Templates reviewed: No changes required (templates remain generic)
- Follow-up TODOs: None
-->

## Core Principles

### I. Desktop-First UI Design (NON-NEGOTIABLE)

**Minimum Resolution**: 800 × 600 pixels MUST be fully usable without horizontal scrolling or content clipping. Default window size is 800 × 600; recommended is 1280 × 720 or higher.

**High Information Density**: The application is a desktop tool for advanced gamers/modders. Use `text-sm` (14px) and `text-xs` (12px) sizing to present more information efficiently. However, maintain readability - avoid过度压缩导致阅读困难。

**Fixed Layout Strategy**:
- Sidebar: Fixed width (200px), with `truncate` to prevent text overflow
- Work area: Independent scrolling, not affected by sidebar
- Tables: Use `sticky` positioning for critical columns (left/right fixed) with horizontal scroll for middle columns
- Modals: Max height constraints (e.g., `max-h-[80vh]`) with internal scrolling

**Rationale**: Running With Rifles players often use older hardware or windowed mode. The tool must be usable on netbooks, older laptops, and alongside the game running simultaneously.

---

### II. Internationalization (i18n) (NON-NEGOTIABLE)

**Runtime Translation System**: All UI text MUST use Transloco (Angular runtime i18n). No build-time translation (`@angular/localize`) is permitted.

**Translation File Structure**:
- Location: `src/assets/i18n/en.json` and `src/assets/i18n/zh.json`
- Key naming convention: Hierarchical dot notation (e.g., `weapons.column.name`, `common.yes`, `menu.dashboard`)
- All new UI text MUST include both English and Chinese translations

**No Hardcoded Text**: Templates and components MUST NOT contain user-facing text in English or Chinese. All text MUST be referenced via i18n keys.

**Language Switching**: Users can switch languages at runtime via Settings page without application restart. System language detection on first launch with confirmation prompt.

**Rationale**: The RWR community is global. Runtime switching enables better UX without rebuilds. Chinese translation is essential for the significant Asian player base.

---

### III. Theme Adaptability (NON-NEGOTIABLE)

**DaisyUI Theme Support**: The application MUST support both light and dark DaisyUI themes seamlessly. All custom styles MUST use DaisyUI CSS variables for colors to ensure automatic theme adaptation.

**CSS Variable Usage**:
- Backgrounds: Use `oklch(var(--b2))`, `oklch(var(--b3))` for base colors
- Text: Use `oklch(var(--bc))` for base content color
- Accents: Use `oklch(var(--p))`, `oklch(var(--pf))` for primary color variants
- Fixed colors are ONLY permitted where semantic meaning requires specific colors independent of theme

**Testing**: All UI components must be visually verified in both light and dark themes before merge.

**Rationale**: Gamers often prefer dark themes for long sessions. DaisyUI provides a robust theming system that must be fully leveraged, not bypassed with hard-coded colors.

---

### IV. Signal-Based State Management (NON-NEGOTIABLE)

**Angular v20 Signals Pattern**: Service layer state MUST be managed with Angular Signals, NOT BehaviorSubjects. RxJS is reserved ONLY for async operations (HTTP requests, event streams).

**Service Layer Pattern**:
```typescript
readonly items = signal<Item[]>([]);
readonly loading = signal(false);
readonly error = signal<string | null>(null);
```

**Component Layer**: Direct signal access from services WITHOUT `toSignal()` conversion:
```typescript
items = this.itemService.items;
loading = this.itemService.loading;
```

**RxJS Scope**: Use RxJS Observables for HTTP requests, with `.pipe()` operators for transformation. Update Signals via `.set()` or `.update()` in `tap()` or subscription handlers.

**Prohibited Patterns**:
- Services exposing `BehaviorSubject` as primary state
- Components using `toSignal()` wrapper
- Direct object mutation (use immutable update patterns)

**Rationale**: Signals provide single source of truth with better performance in Tauri (no Zone overhead). BehaviorSubject + toSignal creates dual state sources and migration debt.

---

### V. Documentation-Driven Development (NON-NEGOTIABLE)

**Single Source of Truth**: The `docs-ai/` directory contains the authoritative project documentation. All development MUST align with these documents, and any changes to project state MUST be recorded.

**Required Reading Order** (for any AI/developer joining):
1. `docs-ai/STATUS.md` - Current tech stack, directory structure, feature completion snapshot
2. `docs-ai/UI.md` - UI/UX principles, 800×600 constraints, component semantics
3. `docs-ai/PLAN.APPENDIX.md` - Implementation references (Ping/parsing/hotkeys/mods)
4. `docs-ai/PROGRESS.md` - Historical changes and uncompleted items

**Progress Tracking**: Every independent change set MUST append a record to `docs-ai/PROGRESS.md` with:
- Date and brief title
- Objectives
- High-level change summary
- Affected files/modules
- Done (completed)
- Leftover (known issues)
- TODO (next actions)
- Risks and decisions

**Status Updates**: `docs-ai/STATUS.md` is updated ONLY when project state snapshot materially changes (new modules, completion status shifts, tech stack changes).

**Rationale**: The project uses AI-assisted development across multiple sessions. Documentation ensures continuity and prevents repeated work or conflicting decisions.

---

### VI. Icon Management (NON-NEGOTIABLE)

**Centralized Icon Registry**: All Lucide icons MUST be registered in `src/app/shared/icons/index.ts` before use. This is the official recommended pattern for lucide-angular to enable tree-shaking and on-demand icon imports.

**Icon Registration Pattern**:
1. Import icon from `lucide-angular` in the import statement
2. Add icon to the `APP_ICONS` export object
3. Use icon in templates via the registered name (lucide-angular maps PascalCase to kebab-case automatically)

**Example**:
```typescript
// src/app/shared/icons/index.ts
import {
    Menu,
    Settings,
    NewIcon,  // Add new icon here
} from 'lucide-angular';

export const APP_ICONS = {
    Menu,
    Settings,
    NewIcon,  // Export new icon here
};
```

**Prohibited Patterns**:
- Direct import of icons in component files without registration
- Using icons that are not registered in `APP_ICONS`
- Bypassing the centralized icon registry

**Rationale**: Centralized registration enables tree-shaking (only used icons are bundled), provides single source of truth for all icons used in the application, and follows lucide-angular's official best practices for optimal bundle size.

---

## Technical Standards

### Frontend Stack

**Framework**: Angular v20.3.15 (mandatory)
**Language**: TypeScript 5.8.3 (strict mode enabled)
**Styling**: Tailwind CSS v4.1.18 + DaisyUI v5.5.14
**Icons**: Lucide Angular v0.562.0
**Build**: Angular CLI v20.3.13
**Package Manager**: pnpm (mandatory - use `pnpm` instead of `npm`)

### Backend Stack

**Framework**: Tauri 2.x
**Language**: Rust (edition 2021)
**XML Parsing**: quick-xml
**File Operations**: Standard Rust fs + walkdir
**Configuration**: Tauri plugin-store

### Code Quality Standards

**TypeScript**: Prettier formatting, no unused imports, strict null checks
**Rust**: `cargo fmt` for formatting, `cargo clippy` for linting (warnings documented if intentional)
**i18n Validation**: All keys present in both `en.json` and `zh.json`

### Development Commands

```bash
pnpm start          # Angular dev server (web testing)
pnpm tauri dev      # Full Tauri desktop development
pnpm build          # Production build
cargo clippy        # Rust lint checking
cargo fmt           # Rust formatting
```

---

## Architecture Constraints

### Signal-Only State in Services

All feature services (data management features) MUST use `signal()` for state. Legacy `BehaviorSubject` usage in non-data features (players, hotkeys, dashboard, mods) is permitted but marked as technical debt for future migration.

### Immutable Data Updates

Signal updates MUST use immutable patterns:
```typescript
this.items.update(list => list.map(item =>
  item.id === updatedId ? { ...item, changed: true } : item
));
```

Direct mutation of objects within signals is PROHIBITED.

### Component Communication

- Parent to child: Input signals with `computed()`
- Child to parent: Output events
- Shared state: Service signals (not component inputs/outputs chains)

### Error Handling

All Tauri command invocations MUST include error handling. User-facing error messages MUST be i18n keys, not hardcoded text.

---

## Governance

### Amendment Procedure

1. Propose change via pull request with rationale
2. Update `CONSTITUTION_VERSION` following semantic versioning:
   - MAJOR: Backward-incompatible principle changes
   - MINOR: New principles or significant guidance additions
   - PATCH: Clarifications, wording improvements, non-semantic changes
3. Update `LAST_AMENDED_DATE` to ISO format (YYYY-MM-DD)
4. Verify template alignment (plan/spec/tasks templates reflect changes)
5. Obtain approval before merge

### Compliance Review

- All pull requests MUST verify compliance with Core Principles I-VI
- Constitution violations MUST be explicitly justified with rationale
- Technical debt related to constitution MUST be tracked in PROGRESS.md

### Scope

This constitution governs all development activity for the RWR Toolbox project. It supersedes conflicting practices or conventions found elsewhere in the codebase.

### Runtime Guidance

For implementation-specific guidance, see:
- UI details: `docs-ai/UI.md`
- Implementation references: `docs-ai/PLAN.APPENDIX.md`
- Current status: `docs-ai/STATUS.md`
- Progress tracking: `docs-ai/PROGRESS.md`
- AI developer bootstrap: `docs-ai/AI_BOOTSTRAP_PROMPT.md`

---

**Version**: 1.1.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-17
