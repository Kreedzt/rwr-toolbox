# rwr-toolbox Development Guidelines

Regenerated from `docs/` authoritative sources. Last updated: 2026-08-13

## Source of Truth

- Primary authority: `docs/` (Documentation-Driven Development)
- Required reading order for new contributors/agents:
    1. `docs/STATUS.md`
    2. `docs/UI.md`
    3. `docs/PLAN.md`
    4. `docs/CONSTRUCTION.md`
    5. `docs/AI_BOOTSTRAP_PROMPT.md`

## Project Snapshot

- Product: Desktop toolbox for Running With Rifles players/modders
- App type: Angular + Tauri desktop application (not web/mobile-first)
- Current app version: `0.4.0`
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
    - `form-control`, `label-text`, `input-bordered`, `select-bordered`, `textarea-bordered`, `card-compact`, `tabs-boxed`, `stats-sm`, `timeline-sm`, bare `active` on menu items
    - Check any suspect class with `grep -rl "<class>" node_modules/daisyui/` — no hit means no-op
    - These were removed in v5 and are silent no-ops

## Project Structure

```text
src/
  styles.css            # daisyUI themes + @theme tokens + the four global component classes
  index.html            # pre-boot skeleton (mirrors the themes via prefers-color-scheme)
  app/
    core/               # app-shell only, not reused
      components/ services/ utils/ workers/
    shared/             # reused across features
      components/       # 7 presentational components (barrel: index.ts)
      adapters/ constants/ guards/ icons/ interfaces/ models/ pipes/ services/ utils/
    features/
      dashboard/ servers/ players/ hotkeys/ settings/ about/
      data/             # local (tabs) + items + weapons
      mods/             # mods-layout + install + bundle + assets
      shared/services/  # cross-feature services only
src-tauri/
docs/                   # STATUS · UI · PLAN · CONSTRUCTION · AI_BOOTSTRAP_PROMPT
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

- Service-layer state exposes signals directly to components; derived state uses `computed()`. `BehaviorSubject` and `toSignal()` are at zero occurrences — do not reintroduce them. The only `toObservable()` left adapts signals to Angular CDK's Observable API in `shared/adapters/virtual-scroll.adapter.ts`
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
- Completed: data management (scanning, filtering, detail panels) per `docs/STATUS.md`
- Deferred: merging the items/weapons virtual-scroll tables into one generic data-table. The two pages still duplicate the CDK double-table header-sync implementation; the merge needs a scroll-performance comparison against real game data, which only runs in the Tauri desktop build

## UI Self-check

After any UI change, all seven must return no lines (kept in sync with `docs/UI.md`):

```bash
grep -rEn 'text-\[[0-9.]+(px|rem|em)\]' src/app
grep -rEn "label-text|input-bordered|select-bordered|textarea-bordered|form-control|card-compact|tabs-boxed|stats-sm|timeline-sm" src/app
grep -rEn '(bg|text|border|fill|stroke|ring|divide|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|950|[1-9]00)' src/app
grep -rnE '\[class\.active\]|class="([^"]*[[:space:]])?active([[:space:]][^"]*)?"' src/app --include="*.html"
grep -rn "uppercase" src/app --include="*.html" | grep -v tracking
grep -rEn "var\(--b[123]\)|var\(--bc\)|var\(--p\)|--rounded-box" src/
grep -rn "<svg" src/app --include="*.html" --include="*.ts"
```

## Known Technical Debt

- `features/shared/` and `app/shared/` coexist with overlapping names. `features/shared/` holds only cross-feature services; put new shared code in `app/shared/`.
