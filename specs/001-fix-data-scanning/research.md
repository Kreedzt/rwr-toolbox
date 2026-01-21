# Research: Fix Data Scanning Errors and UX Improvements

**Feature**: 001-fix-data-scanning
**Date**: 2025-01-21

## Research Topics

### 1. Rust Parallel File Scanning with rayon

**Question**: How to implement parallel XML file parsing for weapon/item scanning?

**Decision**: Use `rayon` with `walkdir::IntoIter::par_bridge()`

**Rationale**:
- XML parsing is CPU-bound, not I/O-bound
- `rayon` provides work-stealing thread pool for efficient CPU utilization
- `par_bridge()` converts walkdir iterator to parallel iterator
- Simpler than tokio for this use case (no async overhead)
- Automatically utilizes all available CPU cores

**Alternatives Considered**:
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| tokio::fs async | Good for I/O | Overhead for CPU-bound task | Rejected |
| Sequential scan | Simple | Too slow for 1000+ files | Rejected |
| Manual thread pool | Full control | Complex implementation | Rejected |

**Implementation Pattern**:
```rust
use rayon::prelude::*;

// Parallel file discovery and parsing
let (weapons, errors): (Vec<_>, Vec<_>) = WalkDir::new(input_path)
    .into_iter()
    .par_bridge()
    .filter_map(|e| e.ok())
    .filter(|e| e.path().extension().is_some_and(|ext| ext == "weapon"))
    .map(|e| parse_weapon_file(e.path(), input_path))
    .partition_result();

// partition_result is from itertools
```

---

### 2. Template Resolution Path Handling

**Question**: How to correctly resolve relative template file paths in weapon/item XML?

**Decision**: Resolve templates relative to the parent directory of the file being parsed

**Root Cause**: Current code at [weapons.rs:468](../../../../src-tauri/src/weapons.rs#L468) joins template path with `input_path` (packages root):
```rust
// BROKEN: Always joins with packages root
let template_path = input_path.join(template_file);
```

This fails for templates in subdirectories because:
- Weapon at `packages/vanilla/weapons/ak47.weapon`
- Template reference: `@file="../templates/base.weapon"`
- Expected: `packages/vanilla/templates/base.weapon`
- Actual (broken): `packages/../templates/base.weapon` → invalid

**Solution**:
```rust
// FIXED: Joins with weapon file's parent directory
let weapon_parent = weapon_path
    .parent()
    .ok_or_else(|| anyhow::anyhow!("Cannot get parent directory"))?;
let template_path = weapon_parent.join(template_file);
```

**Alternatives Considered**:
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Use packages root | Simple | Fails for subdirs | Rejected |
| Canonicalize all paths | Robust | Performance overhead | Rejected |
| Store absolute paths | No resolution needed | Game data format fixed | Rejected |

**Impact**: Affects both `weapons.rs` and `items.rs`, requires changing `resolve_template()` signature.

---

### 3. Angular Route Guard Timing for Auto-Scan

**Question**: Why does /data route show empty state even when directories are configured?

**Root Cause**: `hasNoDirectories()` in [local.component.ts:31](../../../../src/app/features/data/local/local.component.ts#L31) only checks directory count:
```typescript
hasNoDirectories(): boolean {
    return this.directoryService.directoriesSig().length === 0;
}
```

This returns `true` during initial load because `DirectoryService.initialize()` loads from storage asynchronously.

**Solution**: Also check scan progress state:
```typescript
hasNoDirectories(): boolean {
    const dirs = this.directoryService.directoriesSig();
    const progress = this.directoryService.scanProgressSig();
    return dirs.length === 0 && progress.state === 'idle';
}
```

**Alternatives Considered**:
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Route resolver | Clean separation | More complex | Rejected |
| Add loading state | Clear UX | Duplicate of scan progress | Rejected |
| Check scan state | Simple, reuses existing | None | **Selected** |

---

### 4. Multi-Directory Active State Pattern

**Question**: How to implement selective scanning of configured directories?

**Decision**: Add `active: boolean` field to `ScanDirectory` entity with toggle UI

**Pattern**:
- Default: `active: true` for new directories
- Scan: Filter `directoriesSig()` by `active === true`
- UI: Toggle switch in settings (radio button replacement)
- Storage: Persist to plugin-store

**Data Flow**:
```
User clicks toggle → DirectoryService.toggleActive(id) →
Update signal → Persist to store → Next scan uses filtered list
```

**Alternatives Considered**:
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Separate list | Clean separation | Duplicate data | Rejected |
| Selected ID (current) | Already exists | Only supports one | Rejected |
| Active boolean | Simple, supports multi | New field | **Selected** |

---

### 5. Package Count Display

**Question**: How to show number of packages instead of items in settings?

**Current Issue**: `itemCount` is never populated correctly, displays "0 items"

**Solution Backend**: Count package subdirectories during validation:
```rust
let package_count = WalkDir::new(&packages_dir)
    .min_depth(1)
    .max_depth(1)
    .into_iter()
    .filter_map(|e| e.ok())
    .filter(|e| e.path().is_dir())
    .count();
```

**Solution Frontend**: Display `packageCount` in template:
```html
<span>{{ 'settings.packageCount' | transloco: { count: dir.packageCount } }}</span>
```

**i18n Keys**:
```json
{
  "settings": {
    "packageCount": "{count} packages",
    "packageCount_one": "{count} package"
  }
}
```

---

## Performance Considerations

### Parallel Scanning Performance

Expected improvement with rayon:
- 4-core CPU: ~3-4x faster for XML parsing
- 8-core CPU: ~6-7x faster for XML parsing
- Scan time reduction: 50%+ (per SC-006)

### Memory Usage

- Sequential: ~50MB for 1000 files
- Parallel: ~200MB for 1000 files (4 threads)
- Still within acceptable bounds for desktop application

---

## Security Considerations

### Path Traversal Protection

Template resolution must prevent escaping packages directory:
```rust
let template_path = weapon_parent.join(template_file);
let canonical = template_path.canonicalize()?;

// Verify result is within packages directory
if !canonical.starts_with(input_path.canonicalize()?) {
    return Err(anyhow::anyhow!("Template path outside packages directory"));
}
```

---

## Dependencies

### New Dependencies

```toml
# Cargo.toml
[dependencies]
rayon = "1.10"  # For parallel file scanning
```

### Existing Dependencies (Confirmed)

```toml
quick-xml = "0.37"  # XML parsing - confirmed working
walkdir = "2.5"     # Directory traversal - confirmed working
serde = "1"         # Serialization - confirmed working
```
