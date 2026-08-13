# rwr-toolbox Development Guidelines

Regenerated from `docs/` authoritative sources. Last updated: 2026-08-13

## Source of Truth

- Primary authority: `docs/` (Documentation-Driven Development)
- Required reading order for new contributors/agents:
    1. `docs/STATUS.md`
    2. `docs/UI.md`
    3. `docs/PLAN.md` (this file is currently titled `PLAN.APPENDIX`)
    4. `docs/CONSTRUCTION.md`
    5. `docs/AI_BOOTSTRAP_PROMPT.md`

## Project Snapshot

- Product: Desktop toolbox for Running With Rifles players/modders
- App type: Angular + Tauri desktop application (not web/mobile-first)
- Current app version: `0.1.2`
- UI baseline: 800x600 minimum, 3840x2160 maximum supported

## Active Technologies

- Frontend: Angular `20.3.15`, TypeScript `5.8.3`, Angular CLI `20.3.13`
- Desktop/backend: Tauri `2.x`, Rust (edition `2021`)
- Styling/UI: Tailwind CSS `4.2.4` (CSS-first, no config file), DaisyUI `5.5.19`
- i18n: Transloco `8.2.0` (runtime i18n only)
- Icons: Lucide Angular `0.562.0` via centralized registry
- Data/parsing: `quick-xml` (Rust), `fast-xml-parser` (TypeScript)
- Persistence/config: `tauri-plugin-store`

## Core Principles (Non-Negotiable)

1. Desktop-first UI design
    - Must remain fully usable at `800x600`
    - Must scale correctly up to `4K` without layout breakage
2. Runtime i18n with Transloco
    - No `@angular/localize` build-time i18n
    - No hardcoded user-facing text in templates/components
3. Theme adaptability
    - Two custom daisyUI themes (military `light` / `dark`) in `src/styles.css` are the only source of colour; `themes: false`
    - Custom CSS references theme colours through daisyUI **v5** names: `--color-base-100`, `--color-primary`, `--radius-box`
    - The v4 short names (`--b1`, `--b2`, `--bc`, `--p`, `--rounded-box`) no longer exist and fail silently — never use them
    - No hardcoded Tailwind palette values (`bg-gray-100`, `text-blue-700`) — they do not track the theme
4. Signal-based state management
    - Service state uses Angular `signal()`
    - RxJS is for async flows only
    - Avoid BehaviorSubject as primary state source
5. Documentation-driven development
    - Align all implementation decisions with `docs/`
6. Icon management
    - Only `lucide-angular`
    - Register icons in `src/app/shared/icons/index.ts` before use
    - No manual SVG tags in templates/components
7. Tailwind-first styling
    - Prefer Tailwind utilities and DaisyUI semantics
    - Only use custom CSS when utility/component patterns cannot express the requirement
8. Shared components before hand-rolled markup
    - `src/app/shared/components/` covers page headers, section titles, empty states, pagination, label/value pairs, stat cards and filter toolbars — use them, do not respell them
    - Every page has exactly one `<app-page-header>` (its h1)
9. Type and de-emphasis scale (see `docs/UI.md`)
    - Minimum font size 12px; arbitrary sizes (`text-[10px]`) are forbidden
    - `text-xs` is the auxiliary tier only; `text-sm` is body default
    - De-emphasise with colour alpha (`text-base-content/70`, `/50`), not `opacity-*`
    - `uppercase` always carries `tracking-wider` / `tracking-wide`
10. daisyUI v5 class blacklist
    - `form-control`, `label-text`, `input-bordered`, `select-bordered`, `textarea-bordered`, `card-compact`, bare `active` on menu items
    - These were removed in v5 and are silent no-ops

## Project Structure

```text
src/
  styles.css            # daisyUI themes + @theme tokens + the four global component classes
  app/
    core/
      components/       # app-shell-only components
    shared/
      components/       # reusable presentational components (barrel: index.ts)
      pipes/            # highlight
      utils/
    features/
src-tauri/
docs/
```

## Development Commands

Use `pnpm` as the package manager baseline.

```bash
pnpm install
pnpm start          # Angular dev server
pnpm tauri dev      # Tauri desktop development
pnpm build          # Angular production build
pnpm tauri build    # Tauri desktop production build

cargo fmt           # Rust formatting
cargo clippy        # Rust linting
cargo test          # Rust tests
```

## Engineering Standards

- TypeScript
    - Strict mode
    - Prettier formatting
    - No unused imports
- Rust
    - Keep `cargo fmt` clean
    - Keep `cargo clippy` clean (or document intentional warnings)
- i18n
    - New keys must be added in both:
        - `src/assets/i18n/en.json`
        - `src/assets/i18n/zh.json`
    - Use hierarchical key naming (for example: `menu.dashboard`, `common.yes`)

## Architecture Constraints

- Service-layer state should expose signals directly to components (no `toSignal()` bridge for primary state)
- Signal updates must follow immutable update patterns
- Tauri command calls must include explicit error handling
- User-facing error messages should be i18n keys, not hardcoded strings

## Working Protocol

- Define task boundaries clearly (`What` / `Not What`) before implementation
- Deliver small, verifiable increments (MVP first)
- For file overwrite/backup/risky operations, document rollback strategy
- Keep docs updated when project snapshot, architecture guidance, or reusable implementation references change

## Feature Status Snapshot

- Completed: i18n migration, 800x600 layout optimization, servers, settings, dashboard, players, hotkeys
- Completed: UI refactor to the military design system — custom light/dark themes, shared component layer, type and de-emphasis scales, removal of the daisyUI v4 leftovers
- In progress: data management is partially complete (about 90% per `docs/STATUS.md`)
- Deferred: merging the items/weapons virtual-scroll tables into one generic data-table. The two pages still duplicate the CDK double-table header-sync implementation; the merge needs a scroll-performance comparison against real game data, which only runs in the Tauri desktop build

## UI Self-check

After any UI change, all five must return no lines:

```bash
grep -rEn "text-\[(9|10|11)px\]" src/app
grep -rEn "label-text|input-bordered|select-bordered|textarea-bordered|form-control|card-compact" src/app
grep -rn "bg-gray-|bg-red-100|bg-yellow-200|text-blue-700" src/app
grep -rn "uppercase" src/app --include="*.html" | grep -v tracking
grep -rEn "var\(--b[123]\)|var\(--bc\)|var\(--p\)|--rounded-box" src/
```

## Known Documentation Notes

- `docs/PLAN.md` content title uses `PLAN.APPENDIX`; treat this file as the implementation-reference appendix
- Some historical docs still show `npm` command examples; preferred baseline is `pnpm` per `docs/CONSTRUCTION.md`
