# DirectoryService Contract

**Feature**: 001-multi-directory-support
**Component**: Frontend Service (Angular)
**Language**: TypeScript

## Overview

This contract defines the interface for `DirectoryService`, which manages scan directory configuration, validation, and scanning state.

---

## Service Interface

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ScanDirectory,
    DirectoryStatus,
    ValidationResult,
    ScanProgress,
} from '../../shared/models/directory.models';

/**
 * Service for managing game/workshop scan directories
 * Follows Signal pattern for state management (Principle IX)
 */
@Injectable({ providedIn: 'root' })
export interface IDirectoryService {
    // === Readonly State Signals ===

    /** Array of configured scan directories */
    readonly directoriesSig: Signal<ScanDirectory[]>;

    /** Map of directory path → validation status */
    readonly validatingSig: Signal<Record<string, boolean>>;

    /** Current scan progress */
    readonly scanProgressSig: Signal<ScanProgress>;

    /** Loading state for directory operations */
    readonly loadingSig: Signal<boolean>;

    /** Error state */
    readonly errorSig: Signal<string | null>;

    // === Directory Management Methods ===

    /**
     * Add a new directory to the configuration
     * @param path Full file system path to the directory
     * @returns Observable of ValidationResult
     * @throws If directory is duplicate or validation fails
     */
    addDirectory(path: string): Observable<ValidationResult>;

    /**
     * Remove a directory from the configuration
     * @param directoryId ID of the directory to remove
     * @returns Promise that resolves when removed
     */
    removeDirectory(directoryId: string): Promise<void>;

    /**
     * Validate a directory path without adding it
     * @param path Full file system path to validate
     * @returns Observable of ValidationResult
     */
    validateDirectory(path: string): Observable<ValidationResult>;

    /**
     * Re-validate an existing directory
     * @param directoryId ID of the directory to re-validate
     * @returns Observable of ValidationResult
     */
    revalidateDirectory(directoryId: string): Observable<ValidationResult>;

    // === Scan Methods ===

    /**
     * Scan all configured directories for game data
     * @returns Observable that emits when scan completes
     */
    scanAllDirectories(): Observable<ScanProgress>;

    /**
     * Scan a single directory
     * @param directoryId ID of the directory to scan
     * @returns Observable that emits scan progress
     */
    scanDirectory(directoryId: string): Observable<ScanProgress>;

    /**
     * Cancel ongoing scan operation
     */
    cancelScan(): void;

    // === Query Methods ===

    /**
     * Get a directory by ID
     * @param directoryId ID of the directory
     * @returns Directory or undefined if not found
     */
    getDirectory(directoryId: string): ScanDirectory | undefined;

    /**
     * Check if a directory path is already configured
     * @param path Full file system path to check
     * @returns True if path is already in the directory list
     */
    hasDirectory(path: string): boolean;

    /**
     * Get all valid directories
     * @returns Array of directories with status 'valid'
     */
    getValidDirectories(): ScanDirectory[];

    /**
     * Get count of items across all directories
     * @returns Total item count from all successful scans
     */
    getTotalItemCount(): number;

    /**
     * Get count of weapons across all directories
     * @returns Total weapon count from all successful scans
     */
    getTotalWeaponCount(): number;
}
```

---

## Method Contracts

### addDirectory()

**Preconditions**:
- Path is a non-empty string
- Path is not already in the directory list

**Postconditions**:
- If validation passes: Directory added to `directoriesSig` with status 'valid'
- If validation fails: Error returned, `directoriesSig` unchanged

**Validation Flow**:
```
User Input
    ↓
Check for duplicate
    ↓
Call validate_directory Tauri command
    ↓
Update validDirectories status
    ↓
Persist to SettingsService
    ↓
Update directoriesSig
```

**Error Handling**:
| Scenario | ErrorCode | Action |
|----------|-----------|--------|
| Path is empty | - | Return error immediately |
| Path is duplicate | duplicate_directory | Return ValidationResult with error |
| Validation fails | (from Tauri) | Return ValidationResult with error |
| Storage fails | - | Log error, throw to caller |

---

### removeDirectory()

**Preconditions**:
- directoryId exists in `directoriesSig`

**Postconditions**:
- Directory removed from `directoriesSig`
- Changes persisted to SettingsService

**Behavior**:
```typescript
async removeDirectory(directoryId: string): Promise<void> {
    const current = this.directoriesState();
    const updated = current.filter(d => d.id !== directoryId);
    this.directoriesState.set(updated);
    await this.settingsService.updateSettings({
        scanDirectories: updated
    });
}
```

---

### validateDirectory()

**Preconditions**:
- Path is a non-empty string

**Postconditions**:
- Returns ValidationResult with appropriate error code
- `directoriesSig` unchanged (validation without adding)

**Tauri Integration**:
```typescript
validateDirectory(path: string): Observable<ValidationResult> {
    return from(invoke<ValidationResult>('validate_directory', { path }));
}
```

---

### scanAllDirectories()

**Preconditions**:
- At least one directory with status 'valid' exists
- No scan is currently in progress

**Postconditions**:
- All valid directories are scanned
- `scanProgressSig` updates with progress
- Scan results cached in CacheService
- Directory `lastScannedAt`, `itemCount`, `weaponCount` updated

**Scan Flow**:
```
Get valid directories
    ↓
Initialize scanProgress (total=N, completed=0)
    ↓
For each directory:
    1. Update scanProgress (currentPath=dir, state=scanning)
    2. Call scan_weapons Tauri command with directory path
    3. Call scan_items Tauri command with directory path
    4. Tag results with sourceDirectory
    5. Merge into CacheService
    6. Update directory scan metadata
    7. Increment scanProgress.completed
    ↓
Update scanProgress (state=completed)
```

**Error Handling**:
- If one directory fails: Continue with others, record error in `scanProgress.errors`
- If all fail: `scanProgress.state = 'partial'`
- If all succeed: `scanProgress.state = 'completed'`

---

## Signal Contracts

### directoriesSig

**Type**: `Signal<ScanDirectory[]>`

**Updates**:
- `addDirectory()`: Emits with new directory appended
- `removeDirectory()`: Emits with directory removed
- `scanDirectory()`: Emits with updated `lastScannedAt` and counts

**Initial Value**: `[]` (empty array)

### validatingSig

**Type**: `Signal<Record<string, boolean>>`

**Updates**:
- `validateDirectory()`: Emits with `{[path]: true}` on start
- Validation completes: Emits with `{[path]: false}`

**Purpose**: Show loading indicator per directory in UI

### scanProgressSig

**Type**: `Signal<ScanProgress>`

**Updates**:
- `scanAllDirectories()`: Updates continuously during scan
- `scanDirectory()`: Updates during single directory scan
- `cancelScan()`: Resets to idle state

**Initial Value**:
```typescript
{
    total: 0,
    completed: 0,
    currentPath: null,
    state: 'idle',
    errors: {}
}
```

---

## Error Contract

All errors follow this pattern:

```typescript
interface ServiceError {
    code: string;
    message: string;
    context?: unknown;
}
```

**Error Codes**:
| Code | Scenario |
|------|----------|
| `DUPLICATE_DIRECTORY` | addDirectory() called with existing path |
| `VALIDATION_FAILED` | validate_directory Tauri command failed |
| `NO_VALID_DIRECTORIES` | scanAllDirectories() called with no valid directories |
| `SCAN_IN_PROGRESS` | scanAllDirectories() called while scanning |
| `STORAGE_ERROR` | SettingsService.updateSettings() failed |
| `TAURI_COMMAND_ERROR` | Tauri invoke threw an exception |

---

## Usage Example

```typescript
// In a component
@Component({...})
export class SettingsComponent {
    private directoryService = inject(DirectoryService);

    readonly directories = this.directoryService.directoriesSig;
    readonly validating = this.directoryService.validatingSig;

    async onAddDirectory(path: string) {
        this.directoryService.addDirectory(path).subscribe({
            next: (result) => {
                if (result.valid) {
                    console.log('Directory added successfully');
                } else {
                    console.error('Validation failed:', result.message);
                }
            },
            error: (err) => {
                console.error('Failed to add directory:', err);
            }
        });
    }

    onRemoveDirectory(directoryId: string) {
        this.directoryService.removeDirectory(directoryId);
    }

    onScanAll() {
        this.directoryService.scanAllDirectories().subscribe(progress => {
            console.log(`Scanning: ${progress.completed}/${progress.total}`);
            if (progress.state === 'completed') {
                console.log('All directories scanned!');
            }
        });
    }
}
```

---

## Implementation Notes

1. **Initialization**: Service should load directories from SettingsService on construction
2. **Idempotency**: `addDirectory()` should be idotent (calling twice with same path returns error, not duplicate)
3. **Cancellation**: `cancelScan()` should stop current scan but not remove already-cached results
4. **Persistence**: Always persist to SettingsService after any directory list change
5. **Signal updates**: Always update private state signals via `.set()`, never `.update()` for arrays

---

## Testing Strategy

### Unit Tests

- `addDirectory()` with valid path
- `addDirectory()` with duplicate path
- `addDirectory()` with invalid path (no media subdirectory)
- `removeDirectory()` removes from list and persists
- `validateDirectory()` returns correct error codes
- `scanAllDirectories()` updates progress correctly
- `scanAllDirectories()` handles partial failures

### Integration Tests

- DirectoryService → SettingsService persistence
- DirectoryService → Tauri command integration
- DirectoryService → CacheService scan result storage

### E2E Tests

- User adds directory → appears in list
- User removes directory → disappears from list
- User scans directories → results appear in data page
