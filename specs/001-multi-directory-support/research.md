# Research: Multi-Directory Scan Support & Navigation Structure

**Feature**: 001-multi-directory-support
**Date**: 2026-01-15
**Status**: Complete

## Overview

This research focuses on two main areas: implementing multi-directory scanning in the Rust backend and reorganizing the application's navigation structure to balance simplification with feature accessibility.

---

## 1. Navigation Structure & Sidebar Reorganization

### Decision: Balanced Restore Approach
We will restore the "Monitoring" group (Dashboard, Servers, Players) to the main sidebar while keeping the "Data" consolidation. The "Source" column in data views is removed to minimize UI clutter.

**Rationale**: 
- User feedback indicated that removing Dashboard, Servers, and Players made the app feel incomplete.
- These features represent a distinct "Monitoring" domain, while the new "Data" feature represents "Content Management".
- A flat navigation with ~8 items is acceptable for a desktop application on 800x600 resolution (see Constitution I).
- The "Source" column is redundant because the file path already indicates the origin, and the "Open in Editor" button provides direct access.

**Proposed Menu Layout**:
1. Dashboard (Restored)
2. Servers (Restored)
3. Players (Restored)
4. Data (Consolidated: Weapons/Items merged view)
5. Mods (Existing: Install/Bundle)
6. Hotkeys (Existing)
7. Settings (Updated for Multi-Dir)
8. About

**Alternatives considered**:
| Alternative | Rejected Because |
|------------|------------------|
| Keep current simplified menu (Data only) | Negative user feedback regarding feature loss. |
| Group Dashboard/Servers/Players into "Monitoring" sub-menu | Adds extra clicks; sidebar space is sufficient for flat list. |

---

## 2. Directory Structure Reasonable Review

### Decision: Feature-Based Flat Structure
Maintain the current `src/app/features/` flat structure for top-level domains.

**Rationale**:
- Follows standard Angular and project conventions.
- `src/app/features/data` will serve as the container for all game-content-related features.
- Merge `local`, `extract`, and `workshop` logic under `data` but keep them as distinct components for modularity.

**Proposed Directory Mapping**:
- `src/app/features/dashboard`: Home/Statistics.
- `src/app/features/servers`: Server browser.
- `src/app/features/players`: Player search.
- `src/app/features/data`: 
  - `local`: Multi-directory merged view (Weapons/Items tabs).
  - `extract`: Data export tools.
  - `workshop`: Workshop explorer.
- `src/app/features/mods`: Mod management.

---

## 3. Multi-Directory Backend Scanning

### Decision: Stateless Rust Scan Commands
Modify Rust scan commands to accept an optional directory path parameter.

**Rationale**:
- Keeps the backend stateless and simple.
- Frontend manages the list of directories and orchestrates the scanning loop.
- Avoids complex state synchronization between Rust and TypeScript.

**Implementation**:
- `scan_weapons(path: Option<String>)`
- `scan_items(path: Option<String>)`
- If `path` is None, use the legacy single `gamePath` (for backward compatibility during transition).

---

## 4. Settings Persistence

### Decision: Tauri Store Array
Store the list of directories as an array of objects in the Tauri settings store.

**Rationale**:
- Built-in persistence via `tauri-plugin-store`.
- Allows storing metadata (status, last scan time, display name) alongside the path.

**Schema**:
```typescript
interface ScanDirectory {
  id: string;
  path: string;
  displayName: string;
  status: 'valid' | 'invalid' | 'pending';
  lastScannedAt: number;
}
```
