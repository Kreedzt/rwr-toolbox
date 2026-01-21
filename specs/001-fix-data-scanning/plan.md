# Implementation Plan: Fix Data Scanning Errors and UX Improvements

**Branch**: `001-fix-data-scanning` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-data-scanning/spec.md`

## Summary

Fix critical template resolution bug causing "No such file or directory" errors during weapon/item scanning, add multi-directory active state management, improve auto-scan UX, display package counts in settings, and reorganize detail drawer image layout. Implement parallel scanning using Rust's rayon for improved performance.

## Technical Context

**Language/Version**: Rust edition 2021 (backend), TypeScript 5.8.3 (frontend)
**Primary Dependencies**: quick-xml 0.37, walkdir 2.5, serde 1, rayon 1.10 (NEW), Angular v20.3.15, Tauri 2.x
**Storage**: Tauri plugin-store (settings.json), localStorage (UI preferences)
**Testing**: cargo test, cargo clippy, Angular test bed
**Target Platform**: Desktop (macOS, Linux, Windows) via Tauri
**Project Type**: Desktop application with Rust backend and Angular frontend
**Performance Goals**: Scans complete 50% faster with parallel processing; template resolution errors reduced to zero
**Constraints**: 800×600 minimum resolution, Signal-based state management (Angular v20), Lucide icons only
**Scale/Scope**: 1-5 scan directories, 1000+ weapon/item files per directory, 10+ package subdirectories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|-------------|-------|
| I. Desktop-First UI Design | ✅ PASS | Drawer image layout changes maintain 800×600 usability |
| II. Internationalization (i18n) | ✅ PASS | All new UI text will use Transloco keys |
| III. Theme Adaptability | ✅ PASS | Using DaisyUI components and CSS variables |
| IV. Signal-Based State Management | ✅ PASS | DirectoryService uses Signals for state |
| V. Documentation-Driven Development | ✅ PASS | Updates docs/STATUS.md, spec, plan artifacts |
| VI. Icon Management | ✅ PASS | Use lucide-angular via centralized registry |
| VII. Tailwind-First Styling | ✅ PASS | Use Tailwind utilities, no custom CSS classes |

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-data-scanning/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── tauri-commands.yaml  # Tauri command signatures
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src-tauri/
├── src/
│   ├── weapons.rs       # MODIFIED: Fix template resolution, add parallel scanning
│   ├── items.rs         # MODIFIED: Fix template resolution, add parallel scanning
│   ├── directories.rs   # MODIFIED: Add package_count to validation result
│   └── lib.rs           # MODIFIED: Export new commands
└── Cargo.toml           # MODIFIED: Add rayon dependency

src/app/
├── shared/
│   ├── models/
│   │   └── directory.models.ts     # MODIFIED: Add active, packageCount fields
│   └── icons/
│       └── index.ts                # MODIFIED: Register ToggleLeft icon
├── features/
│   ├── settings/
│   │   ├── services/
│   │   │   └── directory.service.ts       # MODIFIED: Add active state management
│   │   └── settings.component.html        # MODIFIED: Add active toggle, package count display
│   └── data/
│       ├── local/
│       │   └── local.component.ts         # MODIFIED: Fix auto-scan trigger logic
│       ├── weapons/
│       │   └── weapons.component.html     # MODIFIED: Move image to content area
│       └── items/
│           └── items.component.html       # MODIFIED: Move image to content area
└── assets/
    └── i18n/
        ├── en.json          # MODIFIED: Add new i18n keys
        └── zh.json          # MODIFIED: Add new i18n keys
```

**Structure Decision**: Hybrid desktop application with Rust backend and Angular frontend. Changes span both layers for template resolution bug fix and UX improvements.

## Complexity Tracking

> **No violations to justify** - All changes align with constitution principles.

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **Rust Parallel File Scanning**: Evaluate rayon vs tokio for parallel XML file parsing
2. **Template Resolution Path Handling**: Determine correct path joining strategy for relative template paths
3. **Angular Route Guard Timing**: Research best practices for triggering async operations on route entry

### Research Findings

#### 1. Rust Parallel File Scanning

**Decision**: Use `rayon` for parallel file scanning with `par_bridge()` on walkdir iterator

**Rationale**:
- `rayon` provides data-parallelism with work-stealing, ideal for CPU-bound XML parsing
- Simpler API than tokio for this use case (no async overhead needed)
- `walkdir::IntoIter::par_bridge()` converts directory iterator to parallel iterator
- Avoids blocking the main thread while utilizing all CPU cores

**Alternatives Considered**:
- `tokio::fs` with async file I/O: Rejected because XML parsing is CPU-bound, not I/O-bound
- Sequential scanning: Rejected - baseline performance is too slow for large mod collections
- Thread pool with channels: Rejected - more complex than rayon for this pattern

**Implementation Notes**:
```rust
use rayon::prelude::*;
use walkdir::WalkDir;

// Parallel file discovery and parsing
let results: Vec<Result<Weapon, ScanError>> = WalkDir::new(input_path)
    .into_iter()
    .par_bridge()  // Convert to parallel iterator
    .filter_map(|e| e.ok())
    .filter(|e| e.path().extension().is_some_and(|ext| ext == "weapon"))
    .map(|e| parse_weapon_file(e.path(), input_path)
        .map_err(|err| ScanError { file: e.path().display().to_string(), error: err.to_string(), severity: "error" }))
    .collect();
```

#### 2. Template Resolution Path Handling

**Decision**: Resolve template paths relative to the parent directory of the weapon/item file being parsed

**Rationale**:
- Template `@file` attributes use relative path syntax (e.g., `../templates/base.weapon`)
- The current code incorrectly joins with `input_path` (packages root), failing for templates in subdirectories
- Correct approach: Get weapon file's parent directory, then join with template path

**Alternatives Considered**:
- Use packages root as base: Rejected - fails for templates in package subdirectories
- Canonicalize all paths: Rejected - adds overhead, relative resolution is sufficient
- Store absolute template paths in XML: Rejected - game data format is fixed

**Implementation Notes**:
```rust
// Current (broken) code:
let template_path = input_path.join(template_file);

// Fixed code:
let weapon_parent = weapon_path
    .parent()
    .ok_or_else(|| anyhow::anyhow!("Cannot get parent directory"))?;
let template_path = weapon_parent.join(template_file);
```

#### 3. Angular Route Guard Timing

**Decision**: Check `directoriesSig().length > 0` AND scan state for determining empty state

**Rationale**:
- `DirectoryService.initialize()` loads directories from storage asynchronously
- `hasNoDirectories()` returns true during initial load, causing incorrect empty state
- Solution: Also check if scan is in progress or has completed

**Alternatives Considered**:
- Use route resolver: Rejected - adds complexity, component-level check is sufficient
- Add a "loading" state: Rejected - existing scan progress signal covers this
- Always show tabs, scan in background: Accepted as the final approach

**Implementation Notes**:
```typescript
// Current (broken) code:
hasNoDirectories(): boolean {
    return this.directoryService.directoriesSig().length === 0;
}

// Fixed code:
hasNoDirectories(): boolean {
    const dirs = this.directoryService.directoriesSig();
    const progress = this.directoryService.scanProgressSig();
    return dirs.length === 0 && progress.state === 'idle';
}
```

## Phase 1: Design & Contracts

### Data Model

#### ScanDirectory Entity

```typescript
export interface ScanDirectory {
    id: string;
    path: string;
    status: DirectoryStatus;
    displayName: string;
    addedAt: number;
    lastScannedAt: number;
    itemCount?: number;          // Existing: Total items found
    weaponCount?: number;         // Existing: Total weapons found
    active?: boolean;             // NEW: Include in scans (default: true)
    packageCount?: number;        // NEW: Package subdirectory count
    lastError?: ValidationResult;
}
```

#### ValidationResult Entity (Backend)

```rust
#[derive(Debug, Serialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub weapons_path: String,
    pub package_count: usize,     // NEW: Count of package subdirectories
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,  // NEW: Error code for i18n
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,     // NEW: Error message
}
```

#### Weapon/Item Template Resolution Context

**Conceptual Entity**: The file path context (weapon/item file location) from which relative template paths are resolved.

**Implementation**: Passed as parameter to `resolve_template()` function:
```rust
fn resolve_template(
    base_dir: &Path,  // NEW: Parent directory of the file being parsed
    template_file: &str,
    visited: &mut HashSet<PathBuf>,
) -> Result<RawWeapon, anyhow::Error>
```

### API Contracts

#### Tauri Commands

```yaml
# contracts/tauri-commands.yaml

commands:
  # Existing command - MODIFIED to return package_count
  validate_game_path:
    inputs:
      game_path: string
    outputs:
      valid: boolean
      weapons_path: string
      package_count: number        # NEW
      error_code?: string          # NEW
      message?: string             # NEW

  # Existing command - MODIFIED for parallel scanning
  scan_weapons:
    inputs:
      game_path: string
      directory?: string           # Specific packages directory
    outputs:
      weapons: Weapon[]
      errors: ScanError[]
      duplicate_keys: string[]
      scan_time: number

  # Existing command - MODIFIED for parallel scanning
  scan_items:
    inputs:
      game_path: string
      directory?: string
    outputs:
      items: Item[]
      errors: ScanError[]
      duplicate_keys: string[]
      scan_time: number

types:
  ScanError:
    file: string
    error: string
    severity: string

  Weapon:
    key?: string
    name: string
    tag: string
    class: number
    magazine_size: number
    kill_probability: number
    retrigger_time: number
    # ... (other fields)

  Item:
    key?: string
    name: string
    item_type: string
    # ... (other fields)
```

### Quickstart Guide

#### Backend Development

```bash
# Add rayon dependency
cd src-tauri
cargo add rayon

# Run tests
cargo test

# Check for issues
cargo clippy

# Build
cargo build
```

#### Frontend Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm start

# Run Tauri dev
pnpm tauri dev
```

#### Testing Template Resolution Fix

```bash
# Create test file structure
mkdir -p /tmp/test_packages/vanilla/templates
mkdir -p /tmp/test_packages/vanilla/weapons

# Create template file
cat > /tmp/test_packages/vanilla/templates/base.weapon << 'EOF'
<weapon name="Base Weapon" />
EOF

# Create weapon file with template reference
cat > /tmp/test_packages/vanilla/weapons/test.weapon << 'EOF'
<weapon name="Test Weapon" file="../templates/base.weapon" />
EOF

# Run scan (should resolve template correctly)
```

## Implementation Tasks Overview

### Backend (Rust)

1. **Fix template resolution in `weapons.rs`**:
   - Modify `resolve_template()` to accept `base_dir: &Path` parameter
   - Change `parse_weapon_file()` to pass weapon file's parent directory
   - Update all call sites

2. **Fix template resolution in `items.rs`**:
   - Same changes as weapons.rs for carry items

3. **Add parallel scanning with rayon**:
   - Add `rayon` dependency to Cargo.toml
   - Convert `discover_weapons()` to use `par_bridge()`
   - Convert item scanning to parallel iteration
   - Ensure thread-safe error collection

4. **Add package_count to validation**:
   - Modify `ValidationResult` struct to include `package_count`
   - Update `validate_game_path()` to count package subdirectories
   - Return count in validation response

### Frontend (Angular)

5. **Update directory models**:
   - Add `active?: boolean` to `ScanDirectory` interface
   - Add `packageCount?: number` to `ScanDirectory` interface
   - Update `ValidationResult` to include `packageCount`

6. **Implement active state management**:
   - Add `toggleActive()` method to `DirectoryService`
   - Filter `getValidDirectories()` by active state
   - Update `scanAllDirectories()` to only scan active directories
   - Persist active state to plugin-store

7. **Fix auto-scan trigger**:
   - Update `hasNoDirectories()` in `LocalComponent`
   - Check scan progress state in addition to directory count
   - Ensure tabs display when scan is in progress

8. **Update settings UI**:
   - Add toggle switch for active/inactive state
   - Replace itemCount display with packageCount
   - Add i18n keys for "packages" display

9. **Reorganize drawer layout**:
   - Move image section from top of panel to first row of content area
   - Reduce image size (w-48 → w-24 or smaller)
   - Position image inline with basic info

10. **Add i18n translations**:
    - Add keys for "packages", "activeDirectory", "inactiveDirectory"
    - Add Chinese translations for all new keys

11. **Register Lucide icon**:
    - Add `ToggleLeft` to centralized icon registry
