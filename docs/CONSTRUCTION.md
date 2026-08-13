# RWR Toolbox Project Constitution

<!--
Sync Impact Report:
- Version: 1.3.0 → 1.4.0 (minor update)
- Modified: Principle I - Desktop-First UI Design (added 4K maximum resolution support)
- Added: Maximum Resolution guidance (3840 × 2160) with responsive scaling requirements
- Added: Display scaling strategy for high-DPI displays
- Templates reviewed: No changes required (templates remain generic)
- Related files: docs/UI.md updated for consistency
- Follow-up TODOs: None
-->

## Core Principles

### I. Desktop-First UI Design (NON-NEGOTIABLE)

**Resolution Range**: The application MUST support resolutions from 800 × 600 (minimum) to 3840 × 2160 (4K, maximum) without layout breakage or usability degradation.

- **Minimum Resolution**: 800 × 600 pixels MUST be fully usable without horizontal scrolling or content clipping. Default window size is 800 × 600.
- **Recommended Resolution**: 1280 × 720 or higher for optimal experience.
- **Maximum Resolution**: 3840 × 2160 (4K) pixels MUST display correctly with appropriate content scaling. UI elements should not appear excessively small or sparse.

**High Information Density**: The application is a desktop tool for advanced gamers/modders. Use `text-sm` (14px) and `text-xs` (12px) sizing to present more information efficiently. However, maintain readability - avoid过度压缩导致阅读困难。

**Display Scaling Strategy**:
- For displays ≤ 1920 × 1080: Standard layout with fixed sidebar (200px)
- For displays > 1920 × 1080: Consider proportional scaling or max-width constraints to prevent content from stretching too thin
- Tables: Maintain readable column widths; avoid excessive white space on large screens
- Font sizes: Remain readable at 4K (avoid absolute px; prefer rem/em or Tailwind responsive classes)

**Fixed Layout Strategy**:
- Sidebar: Fixed width (200px), with `truncate` to prevent text overflow
- Work area: Independent scrolling, not affected by sidebar
- Tables: Use `sticky` positioning for critical columns (left/right fixed) with horizontal scroll for middle columns
- Modals: Max height constraints (e.g., `max-h-[80vh]`) with internal scrolling, max width constraints for 4K displays

**Rationale**: Running With Rifles players often use older hardware or windowed mode. The tool must be usable on netbooks, older laptops, and alongside the game running simultaneously. Conversely, modern gaming setups frequently use 4K displays, and the UI must scale gracefully to prevent unusably small elements or excessive wasted space.

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

**Single source of colour**: The two custom `@plugin "daisyui/theme"` blocks in `src/styles.css` (the military `light` and `dark` themes) define every colour in the application. `themes: false` — DaisyUI's built-in themes are NOT bundled. Adding a colour means editing those blocks, never a component.

**CSS Variable Usage** (DaisyUI v5 names):
- Backgrounds: `var(--color-base-100)`, `var(--color-base-200)`, `var(--color-base-300)`
- Text: `var(--color-base-content)`
- Accents: `var(--color-primary)`, `var(--color-primary-content)`
- Alpha: `color-mix(in oklab, var(--color-base-content) 20%, transparent)`
- Radii: `var(--radius-box)`, `var(--radius-field)`, `var(--radius-selector)`

**Forbidden**:
- daisyUI v4 short names — `var(--b1)`, `var(--b2)`, `var(--bc)`, `var(--p)`, `var(--rounded-box)`. They no longer exist in v5, so they fail silently and the rule renders with no colour at all.
- Hardcoded Tailwind palette values in templates or TS (`bg-gray-100`, `text-blue-700`, `bg-yellow-200`). They do not track the theme and lose contrast in dark mode.
- Any literal hex / oklch outside the theme blocks, except the pre-boot skeleton in `index.html`, which paints before Angular starts and therefore mirrors the themes through `prefers-color-scheme`.

**Testing**: All UI components must be visually verified in both light and dark themes before merge.

**Rationale**: Gamers often prefer dark themes for long sessions. DaisyUI provides a robust theming system that must be fully leveraged, not bypassed with hard-coded colors. The v4 variable names above are called out explicitly because an earlier version of this document recommended them; every custom stylesheet in the project inherited them and broke silently on the v5 upgrade.

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

**Single Source of Truth**: The `docs/` directory contains the authoritative project documentation. All development MUST align with these documents.

**Required Reading Order** (for any AI/developer joining):
1. `docs/STATUS.md` - Current tech stack, directory structure, feature completion snapshot
2. `docs/UI.md` - UI/UX principles, 800×600 constraints, component semantics, design constraints
3. `docs/PLAN.APPENDIX.md` - Implementation references (Ping/parsing/hotkeys/mods)
4. `docs/CONSTRUCTION.md` - Angular v20 Signals pattern migration guidance
5. `docs/AI_BOOTSTRAP_PROMPT.md` - Bootstrap prompt for AI agents

**Status Updates**: `docs/STATUS.md` is updated ONLY when project state snapshot materially changes (new modules, completion status shifts, tech stack changes).

**Working Protocol** (from AI_BOOTSTRAP_PROMPT.md):
1. Define task boundaries: What / Not What
2. Small-step delivery: prioritize minimum viable product (MVP) then enhance
3. Changes affecting user experience/data safety must explain backup/rollback strategy
4. Output language: **Simplified Chinese** (简体中文)

**Rationale**: The project uses AI-assisted development across multiple sessions. Documentation ensures continuity and prevents repeated work or conflicting decisions.

---

### VI. Icon Management (NON-NEGOTIABLE)

**Lucide-Angular Components Only**: All icons MUST use lucide-angular components via the centralized registry. Manual SVG tags are PROHIBITED.

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
- **Manual SVG tags (`<svg>`, `<path>`, etc.) in templates or components**
- Using icon libraries other than lucide-angular

**Rationale**: Centralized registration enables tree-shaking (only used icons are bundled), provides single source of truth for all icons used in the application, and follows lucide-angular's official best practices for optimal bundle size. Using lucide-angular components ensures consistent styling, automatic theme adaptation, and maintainability compared to manual SVG implementations.

---

### VII. Tailwind-First Styling (NON-NEGOTIABLE)

**Tailwind Utility Classes Preferred**: For repeated styling patterns, prefer Tailwind CSS utility classes over creating custom CSS classes with multiple style properties.

**Styling Hierarchy** (in order of preference):
1. A shared component from `src/app/shared/components/` — see the catalogue in `docs/UI.md`. Patterns it already covers (page header, section title, empty state, pagination, label/value pair, stat card, filter toolbar) MUST NOT be hand-rolled again.
2. Tailwind utility classes directly in templates (e.g., `class="flex items-center gap-2 p-4"`)
3. DaisyUI component classes (e.g., `class="btn btn-primary"`)
4. Angular `@HostBinding` for dynamic style bindings
5. Custom CSS classes ONLY when:
   - The style cannot be expressed with Tailwind utilities
   - The style involves complex pseudo-elements or animations
   - The style is truly unique and not reusable

**Prohibited Patterns**:
- Creating custom CSS classes that replicate existing Tailwind utilities
- Custom classes with many standard CSS properties (e.g., margin, padding, flexbox, grid)
- `styles: []` arrays in component decorators for standard styling
- Component stylesheets that are never referenced by their component (`styleUrl` omitted) — the file silently does nothing

**Allowed Exceptions** — the current global component-class list in `src/styles.css`. Adding to it requires showing that utilities cannot express the rule:
- `.markdown-body` — styles HTML generated at runtime, which utilities cannot reach
- `.custom-scrollbar` — `::-webkit-scrollbar` pseudo-elements have no utility equivalent
- `.table-sticky-zebra` — needs `:nth-child` plus a descendant selector, because a sticky cell does not inherit its row's background
- `.control-area` — legacy filter toolbar, pending removal in favour of `<app-filter-toolbar>`

**Rationale**: Tailwind CSS utilities provide a consistent design system, reduce bundle size through purging of unused styles, improve maintainability by making styles visible in templates, and prevent CSS bloat from custom classes. Custom CSS classes create hidden dependencies, naming conflicts, and increase the cognitive load of tracking styles across multiple files.

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

- All pull requests MUST verify compliance with Core Principles I-VII
- Constitution violations MUST be explicitly justified with rationale
- Technical debt related to constitution SHOULD be tracked in issue tracker or project documentation

### Scope

This constitution governs all development activity for the RWR Toolbox project. It supersedes conflicting practices or conventions found elsewhere in the codebase.

### Runtime Guidance

For implementation-specific guidance, see:
- UI/UX specification: `docs/UI.md`
- Implementation references: `docs/PLAN.APPENDIX.md`
- Current project status: `docs/STATUS.md`
- Signals migration guidance: `docs/CONSTRUCTION.md`
- Angular migration: `docs/MIGRATE_ANGULAR.md`
- AI developer bootstrap: `docs/AI_BOOTSTRAP_PROMPT.md`

---

**Version**: 1.4.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-02-12
