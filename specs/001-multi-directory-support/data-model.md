# Data Model: Multi-Directory Scan Support

**Feature**: 001-multi-directory-support
**Date**: 2026-01-15
**Status**: Draft

## Overview

This document defines the data entities and their relationships for the multi-directory scan support feature.

---

## Core Entities

### 1. ScanDirectory

Represents a user-configured directory for scanning game data.

**Location**: `src/app/shared/models/directory.models.ts`

```typescript
interface ScanDirectory {
    /** Unique identifier for this directory configuration */
    id: string;

    /** Full file system path to the directory */
    path: string;

    /** Current validation status */
    status: DirectoryStatus;

    /** Display name (extracted from path or user-provided) */
    displayName: string;

    /** Timestamp when this directory was added */
    addedAt: number;

    /** Timestamp of last successful scan (0 if never scanned) */
    lastScannedAt: number;

    /** Number of items found in last scan */
    itemCount?: number;

    /** Number of weapons found in last scan */
    weaponCount?: number;

    /** Optional: Type classification (game/workshop/other) */
    type?: 'game' | 'workshop' | 'other';
}

/** Validation status of a directory */
type DirectoryStatus =
    | 'valid'       // Directory exists and contains media subdirectory
    | 'invalid'     // Directory failed validation
    | 'pending';    // Validation in progress
```

**Validation Rules**:
- `id`: Required, unique, generated from path + timestamp
- `path`: Required, non-empty string, must be absolute path
- `status`: Required, defaults to 'pending' on creation
- `displayName`: Required, defaults to basename of path
- `addedAt`: Required, timestamp in milliseconds
- `lastScannedAt`: Required, defaults to 0 (never scanned)

**State Transitions**:
```
pending → valid    (validation passed)
pending → invalid  (validation failed)
valid → invalid    (directory removed/moved externally)
invalid → valid    (user re-adds fixed directory)
```

---

### 2. ValidationResult

Result of directory validation from backend.

**Location**: `src/app/shared/models/directory.models.ts`

```typescript
interface ValidationResult {
    /** Whether the directory is valid for scanning */
    valid: boolean;

    /** Error code if validation failed */
    errorCode: DirectoryErrorCode | null;

    /** Localized error message for display */
    message: string;

    /** Optional: Additional context */
    details?: {
        /** Whether the path exists */
        pathExists: boolean;
        /** Whether the path is a directory */
        isDirectory: boolean;
        /** Whether the path is readable */
        isReadable: boolean;
        /** Whether media subdirectory exists */
        hasMediaSubdirectory: boolean;
    };
}

/** Error codes for directory validation */
type DirectoryErrorCode =
    | 'path_not_found'           // Path does not exist on filesystem
    | 'not_a_directory'          // Path exists but is not a directory
    | 'access_denied'            // Directory exists but cannot be read
    | 'missing_media_subdirectory'  // Directory exists but lacks media subdirectory
    | 'duplicate_directory';     // Directory already in configured list
```

**Validation Rules**:
- `valid`: Required, boolean
- `errorCode`: Optional, null if valid is true
- `message`: Required, localized string
- `details`: Optional, present only for detailed validation results

---

### 3. Extended Models (Existing)

#### Weapon (Extended)

**Location**: `src/app/shared/models/weapons.models.ts`

**Changes**: Add `sourceDirectory` field

```typescript
// Existing Weapon interface with new field added
interface Weapon {
    // ... existing fields ...
    /** NEW: Directory path where this weapon was found */
    sourceDirectory: string;
}
```

#### Item (Extended)

**Location**: `src/app/shared/models/items.models.ts`

**Changes**: Add `sourceDirectory` field

```typescript
// Existing Item interface with new field added
interface Item {
    // ... existing fields ...
    /** NEW: Directory path where this item was found */
    sourceDirectory: string;
}
```

---

### 4. ScanProgress

Progress tracking for multi-directory scanning.

**Location**: `src/app/shared/models/directory.models.ts`

```typescript
interface ScanProgress {
    /** Total number of directories to scan */
    total: number;

    /** Number of directories completed */
    completed: number;

    /** Currently scanning directory path */
    currentPath: string | null;

    /** Scan state */
    state: ScanState;

    /** Errors encountered during scan (path → error message) */
    errors: Record<string, string>;
}

type ScanState =
    | 'idle'       // Not scanning
    | 'scanning'   // Currently scanning directories
    | 'completed'  // All directories scanned
    | 'partial';   // Some directories failed, others succeeded
```

### 5. Menu Items (Restored)

The navigation structure is updated to restore essential features while keeping the new "Data" consolidation.

| Menu Item | Path | Purpose |
|-----------|------|---------|
| Dashboard | `/dashboard` | System overview and statistics |
| Servers | `/servers` | Game server browser |
| Players | `/players` | Player tracking and statistics |
| Data | `/data` | Consolidated multi-directory scan results (Weapons/Items) |
| Mods | `/mods` | Mod management (Install/Bundle) |
| Hotkeys | `/hotkeys` | Shortcut configuration |
| Settings | `/settings` | Application and directory management |
| About | `/about` | Project information |

---

## Data Relationships

```
ScanDirectory (1) -----< (0..n) Weapon
                 |         (via sourceDirectory path match)
                 |
                 -----< (0..n) Item
                           (via sourceDirectory path match)

ScanDirectory (1) ----> (1) ValidationResult
                      (from validate_directory command)

ScanProgress (1) ----> (0..n) ScanDirectory
                     (tracks scanning state of multiple directories)
```

---

## Storage Model

### AppSettings Extension

**Location**: `src/app/shared/models/common.models.ts`

```typescript
// Extend existing AppSettings interface
interface AppSettings {
    // ... existing fields ...

    /** NEW: Configured scan directories */
    scanDirectories: ScanDirectory[];
}
```

**Storage**:
- Backend: Tauri Store (`settings.json`)
- Fallback: localStorage key `app_settings`
- Persistence: Automatic on any directory change (add/remove/scan)

---

## Collection Semantics

### ScanDirectory List

- **Unordered**: Directories have no inherent order (may be displayed in added order for UX)
- **Unique**: No duplicate paths allowed (validated before add)
- **Bounded**: Max 10+ directories (per SC-003), no hard limit in code
- **Nullable**: Empty list is valid (shows empty state)

### Weapon/Item Collections

- **Merged**: Results from all directories combined into single list
- **Tagged**: Each item tagged with `sourceDirectory` internally for identification and deduplication
- **Deduplicated**: Same item from different directories appears multiple times (distinguished by sourceDirectory internally)
- **UI Display**: The "Source" column is hidden as the file path already provides sufficient context.

---

## Indexing & Lookups

### Primary Lookups

1. **Directory by ID**: O(n) linear search in array
   - Consider Map for O(1) if performance needed

2. **Directory by Path**: O(n) linear search for duplicate check
   - Done on add operation, not performance-critical

3. **Weapons/Items by Source**: Filter operation on display
   - O(n) filter on array, acceptable for <10k items

### Caching Strategy

- **ScanDirectory list**: Cached in memory (Signal state)
- **Validation results**: Cached in ScanDirectory.status
- **Scan results**: Cached in existing CacheService
- **Progress state**: Ephemeral (Signal state, not persisted)

---

## Lifecycle

### ScanDirectory Lifecycle

```
[User adds path]
        ↓
[validate_directory command]
        ↓
   ┌────┴────┐
 valid   invalid
   ↓         ↓
[Add to   [Show error,
 settings] do not add]
   ↓
[Scan directory]
   ↓
[Update lastScannedAt,
 itemCount, weaponCount]
   ↓
[Display in data list]
   ↓
[User removes] OR [External change detected]
        ↓
   [Remove from
    settings]
```

### ValidationResult Lifecycle

```
[Request validation]
        ↓
[Tauri command executes]
        ↓
   ┌────┴────┐
 success   failure
   ↓         ↓
[Return    [Return with
 valid=true] errorCode + message]
        ↓
[Display result to user]
        ↓
[Discard] (not persisted)
```

---

## Migration Notes

### Existing Data Migration

When this feature is deployed:

1. **Single directory migration**: Existing `gamePath` in settings should be migrated to `scanDirectories` array
   - If `gamePath` is set and valid, create ScanDirectory entry
   - Clear `gamePath` after migration (or keep as fallback)

2. **Model migration**: Existing Weapon/Item items will have `sourceDirectory` set to empty string
   - Display as "未知来源" (Unknown source) for migrated items
   - New items will always have sourceDirectory populated

3. **UI migration**: Update filters to include source directory filter
   - Add "来源目录" (Source Directory) dropdown to data pages

---

## Validation Summary

| Entity | Key Validations | Storage |
|--------|----------------|---------|
| ScanDirectory | path required, unique, status enum | settings.json / localStorage |
| ValidationResult | valid boolean, errorCode enum | Not persisted |
| Weapon (extended) | sourceDirectory required | CacheService |
| Item (extended) | sourceDirectory required | CacheService |
| ScanProgress | total >= completed, state enum | Not persisted (ephemeral) |

---

## TypeScript Interfaces Summary

```typescript
// Complete export structure
export interface ScanDirectory { /* ... */ }
export type DirectoryStatus = 'valid' | 'invalid' | 'pending';
export interface ValidationResult { /* ... */ }
export type DirectoryErrorCode = /* ... */;
export interface ScanProgress { /* ... */ }
export type ScanState = 'idle' | 'scanning' | 'completed' | 'partial';
```

---

## Dependencies on Existing Models

| Existing Model | Dependency Type |
|----------------|-----------------|
| AppSettings | Extended with scanDirectories field |
| Weapon | Extended with sourceDirectory field |
| Item | Extended with sourceDirectory field |
| CacheService | Stores scan results (no changes needed) |
| SettingsService | Stores directory configuration (extended) |
