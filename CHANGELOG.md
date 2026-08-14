# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-08-14

### Changed

- **New Look**: The whole app moves to a purpose-built military theme — warm olive greys, olive-drab green as the primary colour, amber as the accent, and tighter corners throughout. Light and dark are both hand-tuned rather than borrowed from a stock theme, and every colour pairing meets WCAG AA contrast (4.61:1 at the tightest).
- **Readable Text**: Raised the minimum font size to 12px. Roughly a hundred places were previously set at 9–11px, including table cells, badges and detail-panel labels, which made dense pages hard to read on smaller screens.
- **Calmer Pages**: Section titles, empty states, pagination and toolbars now look the same everywhere instead of drifting page by page. Removed the rule under each page title and the doubled borders around cards, so pages read with less visual noise.
- **Chinese Text Rendering**: Added a proper CJK font stack (PingFang SC / Microsoft YaHei / Noto Sans CJK), so Chinese text no longer falls back to whatever the system picks.

### Fixed

- **Dark Theme**: Several elements were unreadable or lost their styling in dark mode — the sidebar's selected item used a fixed purple that ignored the theme, server capacity badges and search highlighting used fixed light-mode colours, and the changelog, markdown blocks, table row selection and custom scrollbars had silently stopped picking up any theme colour at all. All of these now follow the active theme.
- **Mod Format Hint**: The filename pattern on the mod install page was grey text on a blue panel and effectively invisible (1.7:1 contrast). It now sits on a soft panel in a monospace face at full strength.
- **Tab Strips**: Tab bars on the local mods, hotkeys and mods pages had lost their background and rendered as plain text.
- **Startup Screen**: The pre-launch loading screen now matches the app's theme and follows your system's light/dark setting instead of always showing dark.

### Internal

- Introduced a shared component layer (page header, section title, empty state, pagination, label/value pair, stat card, filter toolbar) plus a search-highlight pipe, replacing markup that had been hand-written on every page.
- Only the two custom themes are bundled now instead of all 35 daisyUI themes.
- Completed the daisyUI v5 migration: removed class names and CSS variables that had silently stopped working, and dropped an unreferenced stylesheet.
- Finished the signals migration — `BehaviorSubject` and `toSignal()` bridges are gone from the app.
- Removed three scaffold pages that shipped as placeholder text.

## [0.3.0] - 2026-06-29

### Added

- **Update Notifications**: The app now alerts you when a new version is available.
  - A red dot badge appears on the "About" menu item in the sidebar when an update is detected.
  - The About page shows a prominent banner with a "Download from GitHub Releases" button to get the latest version.

- **Game Log Access**: Quickly open the `rwr_game.log` file location from the Settings page with a single click — useful for troubleshooting or sharing logs.

## [0.2.1] - 2026-06-25

### Added

- **Localized Name Display & Search**: Weapons and items now show their localized name (from RWR's bundled `misc_text*.xml` translation files) below the English name.
  - New Rust `localization` module with a `get_game_translations` Tauri command that parses RWR's localization files.
  - New frontend `GameTranslationService` exposing a reactive translation map.
  - Weapon and item search now matches against localized names, so users can find entries by their translated names.

### Changed

- **About Page**: The version history is now split into per-version cards with left-aligned layout, each version shown with a version badge and date.

## [0.2.0] - 2026-04-30

### Added

- **Mod Archive (Assets)**: New tab for managing archived mod packages.
  - Automatically saves a copy of installed mod zips to a configurable directory after successful installation.
  - Archive deduplication via MD5 hash comparison (skips identical content, renames different content with timestamp).
  - Browse archived mods with metadata (title, version, game version, authors).
  - Re-install archived mods through the full Install wizard (Step 2 → Step 3 with file selection).
  - Delete archived packages with confirmation dialog.
  - New Tauri commands: `archive_mod`, `list_mod_archives`, `delete_mod_archive`.
- **Selective File Installation**: Install mods with granular file-level control.
  - File selection modal in Install Step 2, showing path and size per file.
  - `.txt` files are unchecked by default; all other files are checked by default.
  - Select All / Invert Selection quick actions.
  - Real-time estimated installation size display.
  - Rust `extract_zip` now supports `selected_files` filtering; `read_info` returns `file_entries` with size metadata.
- **Launch Loading Screen**: Pure CSS dual-ring spinner with loading dots animation, displayed before Angular bootstraps.

### Changed

- `ModInstallOptions` now includes `selectedFiles` array for filtered installation.
- `OutputConfig` (Rust) / `ModReadInfo` (TS) now includes `file_entries` with per-file size data.
- Re-install from Assets tab now navigates to the Install wizard instead of direct installation.

### Fixed

- Fixed duplicate archive creation when re-installing from Assets (introduced `skipArchive` flag).
- Fixed `selectAndReadModFile` return type to correctly expose `path` and `info`.

## [0.1.0] - 2026-01-21

### Added

- Multi-directory scanning support for weapons and items.
- Real-time server browser with favorite tracking.
- Global player statistics search across invasion and pacific databases.
- Initial mod management (installation and bundling).
- Hotkey profile management.
- Dynamic theme switching (Light/Dark).
- Search term highlighting in data tables.

### Fixed

- Fixed main thread blocking issue during directory scanning.
- Improved Windows file path handling for editor integration.

### Removed

- Obsolete "Extract" button from Dashboard.
