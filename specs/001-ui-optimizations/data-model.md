# Data Model: UI Optimizations

**Feature**: 001-ui-optimizations
**Date**: 2026-01-16
**Status**: Draft

## Overview

This feature introduces persistent user preferences for scan directories and scrolling mode. The data model focuses on user configuration state that is stored via Tauri plugin-store.

---

## Entity: Scan Directory

**Purpose**: Represents a directory path that the application scans for game data (weapons, items, etc.)

**Type**: Configuration entity (user-managed)

**Attributes**:

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| path | string | Absolute file system path to the directory | Must be valid file system path |
| valid | boolean | Indicates if the path currently exists and is accessible | Computed at runtime, not stored |
| lastAccessed | timestamp | Last time the directory was accessed by the application | Optional, for UX purposes |

**Relationships**:
- **User Settings** (1-to-many): A user can configure multiple scan directories
- **Game Data** (many-to-many): Directories contain game data files (weapons, items, etc.)

**Storage**:
- Stored in Tauri plugin-store under key `"scan_directories"`
- Format: Array of strings (paths): `["/path/to/dir1", "/path/to/dir2"]`

**State Transitions**:

| From | To | Trigger | Notes |
|------|----|---------|-------|
| None | Added | User adds directory via settings UI | Path is validated before storage |
| Valid | Invalid | Directory deleted/moved externally | Displayed in UI with warning icon |
| Invalid | Valid | Directory recreated/moved back | Automatic validation on next access |
| Added | Removed | User removes directory via settings UI | Deleted from storage |

---

## Entity: Scrolling Mode Preference

**Purpose**: Represents the user's preferred scrolling behavior for data tables (table-only vs full-page)

**Type**: User preference entity

**Attributes**:

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| mode | enum | Current scrolling mode: 'table-only' or 'full-page' | Must be one of the two valid values |
| lastUpdated | timestamp | When the preference was last modified | Set automatically on each update |

**Storage**:
- Stored in Tauri plugin-store under key `"scrolling_mode"`
- Format: String: `"table-only"` or `"full-page"`
- Default: `"table-only"` (applied if no saved preference exists)

**State Transitions**:

| From | To | Trigger | Notes |
|------|----|---------|-------|
| table-only | full-page | User clicks toggle button | Persists immediately |
| full-page | table-only | User clicks toggle button | Persists immediately |

---

## Entity: Component Scroll State

**Purpose**: Runtime state for individual data table components (tracks scroll position, not persisted)

**Type**: Runtime entity (transient)

**Attributes**:

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| componentId | string | Unique identifier for the component (e.g., 'weapons', 'items') | Fixed value |
| scrollTop | number | Current vertical scroll position in pixels | Must be non-negative integer |
| scrollHeight | number | Total scrollable height in pixels | Computed from DOM |
| clientHeight | number | Visible viewport height in pixels | Computed from DOM |

**Storage**:
- NOT persisted (runtime only)
- Stored in component instance variables
- Reset when user navigates away or switches scrolling modes

---

## Data Flow Diagrams

### Scan Directory Persistence Flow

```
User Action (Add/Remove Directory)
    ↓
Angular Component (SettingsComponent)
    ↓
DirectoryService (Angular Signal: scanDirectories)
    ↓
Tauri Command (save_scan_directories)
    ↓
Plugin-Store (File System: .config/store.json)
    ↓
Persisted Across Sessions
```

### Scrolling Mode Persistence Flow

```
User Action (Toggle Scroll Mode)
    ↓
Angular Component (Weapons/Items/Players/Servers)
    ↓
ScrollingModeService (Angular Signal: mode)
    ↓
Tauri Command (save_scrolling_mode)
    ↓
Plugin-Store (File System: .config/store.json)
    ↓
Persisted Across Sessions
```

### Scrolling Mode Restoration Flow

```
Application Startup
    ↓
ScrollingModeService.loadMode()
    ↓
Tauri Command (get_scrolling_mode)
    ↓
Plugin-Store (File System: .config/store.json)
    ↓
Angular Signal: mode.set(savedMode || 'table-only')
    ↓
All Table Components Updated via Computed Signals
```

---

## Type Definitions (TypeScript)

```typescript
// src/app/features/shared/models/scan-directory.model.ts

export interface ScanDirectory {
  path: string;
  valid: boolean;
  lastAccessed?: number; // Unix timestamp
}

// Storage format (simplified)
export type ScanDirectoryStorage = string[];

// Validation function
export function validateScanDirectory(path: string): boolean {
  // Check if path is valid absolute path
  // Check if directory exists (runtime check via Tauri)
  return true; // Placeholder - actual validation in Rust backend
}

// Validation error type
export interface DirectoryValidationError {
  path: string;
  reason: 'invalid_path' | 'not_accessible' | 'not_directory';
}

// src/app/features/shared/models/scrolling-mode.model.ts

export type ScrollingMode = 'table-only' | 'full-page';

export interface ScrollingModePreference {
  mode: ScrollingMode;
  lastUpdated: number; // Unix timestamp
}

// Storage format (simplified)
export type ScrollingModeStorage = ScrollingMode;

// src/app/features/shared/models/component-scroll-state.model.ts

export interface ComponentScrollState {
  componentId: string;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

// Component identifiers
export type TableComponentId = 'weapons' | 'items' | 'players' | 'servers';
```

---

## Service Layer Models (Angular Signals)

```typescript
// src/app/features/shared/services/scrolling-mode.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollingModeService {
  // Primary signal for scrolling mode preference
  readonly mode = signal<ScrollingMode>('table-only');

  // Computed signal for UI convenience
  readonly isTableOnlyMode = computed(() => this.mode() === 'table-only');

  // Computed signal for toggle button label
  readonly toggleLabel = computed(() =>
    this.isTableOnlyMode() ? 'scrolling.fullPage' : 'scrolling.tableOnly'
  );
}

// src/app/features/settings/services/directory.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  // Primary signal for scan directories
  readonly directories = signal<string[]>([]);

  // Computed signal for directory count
  readonly count = computed(() => this.directories().length);

  // Computed signal for empty state
  readonly isEmpty = computed(() => this.directories().length === 0);

  // Runtime validation state (not persisted)
  readonly validationResults = signal<Record<string, boolean>>({});

  // Computed signal for all valid directories
  readonly validDirectories = computed(() =>
    this.directories().filter(path => this.validationResults()[path] !== false)
  );

  // Computed signal for invalid directories
  readonly invalidDirectories = computed(() =>
    this.directories().filter(path => this.validationResults()[path] === false)
  );
}
```

---

## Storage Schema (Tauri Plugin-Store)

### Key-Value Structure

```json
{
  "scan_directories": [
    "/Users/username/Documents/RWR/mods/data",
    "/path/to/another/directory"
  ],
  "scrolling_mode": "table-only"
}
```

### Key Naming Convention

- Use snake_case for Tauri store keys (Rust convention)
- Keys are descriptive and indicate the type of data stored
- No versioning in keys (assume schema evolution via code changes)

### Migration Strategy

If the storage schema changes in the future:
1. Check for old keys on application startup
2. Migrate data to new keys
3. Remove old keys
4. Example migration code in Rust backend:

```rust
// Migration: scan_directories -> scan_directories (no change needed)
// Migration: scrollingMode -> scrolling_mode (camelCase to snake_case)
fn migrate_store(store: &Store) {
    if let Some(old_mode) = store.get::<String>("scrollingMode") {
        store.set("scrolling_mode", old_mode);
        store.delete("scrollingMode");
    }
}
```

---

## Validation Rules

### Scan Directory Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| PATH_001 | Path must be absolute (not relative) | "Path must be absolute" |
| PATH_002 | Path must exist on file system | "Directory does not exist" |
| PATH_003 | Path must be a directory (not a file) | "Path is not a directory" |
| PATH_004 | Path must be accessible (read permissions) | "Directory is not accessible" |

### Scrolling Mode Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| MODE_001 | Mode must be 'table-only' or 'full-page' | "Invalid scrolling mode" |

---

## Performance Considerations

### Scan Directory Performance
- Validation is performed on-demand when directories are added
- No real-time monitoring of directory status
- Large directory lists (100+) may impact UI performance - consider virtualization

### Scrolling Mode Performance
- Scrolling mode preference is loaded once on application startup
- Toggle is instant (no network calls, local Tauri command)
- Computed signals ensure UI updates are efficient (no unnecessary re-renders)

---

## Security Considerations

### Scan Directory Security
- Path traversal attacks: Validate all user-provided paths
- Symbolic links: Follow symlinks but detect circular references
- Permission checks: Ensure application has read access to directories
- Sensitive directories: Prevent accessing system directories (optional)

### Storage Security
- Plugin-Store files are located in application config directory (platform-appropriate)
- No encryption for this feature (data is non-sensitive)
- Backup/restore: Users can copy `.config/store.json` manually if needed

---

## Testing Considerations

### Unit Tests
- Test directory validation logic with various path formats
- Test scrolling mode state transitions
- Test computed signal logic (isTableOnlyMode, toggleLabel)
- Test validation error handling

### Integration Tests
- Test persistence across application restarts
- Test Tauri command invocation
- Test concurrent writes to scan directories (edge case)

### UI Tests
- Test toggle button behavior
- Test table scrolling in both modes
- Test empty states (no directories, no data)
- Test invalid directory display
