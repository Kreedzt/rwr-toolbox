# Quickstart: Multi-Directory Scan Support

**Feature**: 001-multi-directory-support
**Branch**: `001-multi-directory-support`
**Last Updated**: 2026-01-15

## Overview

This guide helps developers quickly understand and implement the multi-directory scan support feature.

---

## Feature Summary

Users can configure multiple game/workshop directories for scanning. Each directory is validated by checking for a `media` subdirectory. The navigation is updated to include a consolidated "Data" menu item for merged scan results, while restoring original menu items (Dashboard, Servers, Players).

**Key Changes**:
1. Multiple directory configuration in Settings
2. Directory validation (`media` subdirectory check)
3. Merged scan results from all directories with source tracking
4. Navigation restoration (Dashboard, Servers, Players restored to sidebar)
5. Consolidated "Data" view (merged Weapons/Items)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Angular)                    │
├─────────────────────────────────────────────────────────────┤
│  SettingsComponent  │  LocalComponent (Data)                │
│       ↓             │       ↓                               │
│  DirectoryService   │  WeaponService / ItemService          │
│  (Signals)          │  (extended with sourceDirectory)       │
├─────────────────────────────────────────────────────────────┤
│                    SettingsService (Persistence)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Bridge (IPC)                        │
├─────────────────────────────────────────────────────────────┤
│  validate_directory  │  scan_weapons(dir)  │  scan_items()  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Rust)                          │
├─────────────────────────────────────────────────────────────┤
│  directories.rs (NEW)  │  weapons.rs (MODIFIED)             │
│                         │  items.rs (MODIFIED)               │
└─────────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/app/shared/models/directory.models.ts` | Directory entities (ScanDirectory, ValidationResult) |
| `src/app/features/settings/services/directory.service.ts` | Directory management service |
| `src-tauri/src/directories.rs` | Rust directory validation command |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/shared/models/weapons.models.ts` | Add `sourceDirectory: string` field |
| `src/app/shared/models/items.models.ts` | Add `sourceDirectory: string` field |
| `src/app/shared/models/common.models.ts` | Add `scanDirectories: ScanDirectory[]` to AppSettings |
| `src/app/core/services/settings.service.ts` | Add directory convenience methods |
| `src-tauri/src/weapons.rs` | Modify `scan_weapons` to accept optional directory |
| `src-tauri/src/items.rs` | Modify `scan_items` to accept optional directory |
| `src-tauri/src/lib.rs` | Register `validate_directory` command |
| `src/app/app.routes.ts` | Simplify to show only Data route in nav |
| `src/assets/i18n/en.json` | Add directory-related translations |
| `src/assets/i18n/zh.json` | Add directory-related translations |

---

## Implementation Checklist

### Phase 1: Backend (Rust)

- [ ] Create `src-tauri/src/directories.rs`
  - [ ] Define `ValidationResult` and `DirectoryErrorCode` structs
  - [ ] Implement `validate_directory` command
  - [ ] Add platform-specific permission checks

- [ ] Modify `src-tauri/src/weapons.rs`
  - [ ] Add `Option<String>` parameter to `scan_weapons`
  - [ ] Use directory parameter or fallback to game_path

- [ ] Modify `src-tauri/src/items.rs`
  - [ ] Add `Option<String>` parameter to `scan_items`
  - [ ] Use directory parameter or fallback to game_path

- [ ] Update `src-tauri/src/lib.rs`
  - [ ] Add `mod directories;`
  - [ ] Register `validate_directory` in `invoke_handler`

- [ ] Test with `cargo test`

### Phase 2: Frontend Models

- [ ] Create `src/app/shared/models/directory.models.ts`
  - [ ] Export `ScanDirectory`, `DirectoryStatus`, `ValidationResult`, `DirectoryErrorCode`
  - [ ] Export `ScanProgress`, `ScanState`

- [ ] Modify `src/app/shared/models/weapons.models.ts`
  - [ ] Add `sourceDirectory: string` to `Weapon` interface

- [ ] Modify `src/app/shared/models/items.models.ts`
  - [ ] Add `sourceDirectory: string` to `Item` interface

- [ ] Modify `src/app/shared/models/common.models.ts`
  - [ ] Add `scanDirectories: ScanDirectory[]` to `AppSettings`

### Phase 3: Frontend Services

- [ ] Create `src/app/features/settings/services/directory.service.ts`
  - [ ] Implement Signal-based state management
  - [ ] Implement `addDirectory()`, `removeDirectory()`, `validateDirectory()`
  - [ ] Implement `scanAllDirectories()`, `scanDirectory()`

- [ ] Modify `src/app/core/services/settings.service.ts`
  - [ ] Add directory-related convenience methods
  - [ ] Initialize `scanDirectories` from storage

- [ ] Modify `src/app/features/data/weapons/services/weapon.service.ts`
  - [ ] Update to use `scan_weapons` with directory parameter
  - [ ] Tag results with `sourceDirectory`

- [ ] Modify `src/app/features/data/items/services/item.service.ts`
  - [ ] Update to use `scan_items` with directory parameter
  - [ ] Tag results with `sourceDirectory`

### Phase 4: UI Components

- [ ] Modify `src/app/features/settings/settings.component.ts`
  - [ ] Integrate DirectoryService
  - [ ] Add directory list UI
  - [ ] Add add/remove directory buttons
  - [ ] Show validation errors

- [ ] Modify `src/app/features/data/local/local.component.ts`
  - [ ] Show empty state when no directories configured
  - [ ] Ensure merged weapons/items are displayed

- [ ] Update navigation component
  - [ ] Ensure Dashboard, Servers, Players, Data, and Settings are visible in sidebar

### Phase 5: Routing & Navigation

- [ ] Modify `src/app/shared/constants/menu-items.ts`
  - [ ] Restore Dashboard, Servers, Players items
  - [ ] Update Data item to point to `/data`
  - [ ] Ensure correct order and icons

- [ ] Modify `src/app/app.routes.ts`
  - [ ] Ensure all routes are correctly configured
  - [ ] Set `Data` route as primary for game data

### Phase 6: Internationalization

- [ ] Update `src/assets/i18n/en.json`
  - [ ] Add directory management translations

- [ ] Update `src/assets/i18n/zh.json`
  - [ ] Add directory management translations

---

## Key Code Patterns

### DirectoryService State Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class DirectoryService {
    private settingsService = inject(SettingsService);

    // Private state signals
    private directoriesState = signal<ScanDirectory[]>([]);
    private validatingState = signal<Record<string, boolean>>({});
    private scanProgressState = signal<ScanProgress>({
        total: 0,
        completed: 0,
        currentPath: null,
        state: 'idle',
        errors: {}
    });

    // Readonly signals for components
    readonly directoriesSig = this.directoriesState.asReadonly();
    readonly validatingSig = this.validatingState.asReadonly();
    readonly scanProgressSig = this.scanProgressState.asReadonly();

    // Methods...
}
```

### Tauri Command Pattern

```typescript
// Frontend call
const result = await invoke<ValidationResult>('validate_directory', {
    path: directoryPath
});
```

```rust
// Rust command
#[tauri::command]
pub fn validate_directory(path: String) -> ValidationResult {
    // Implementation
}
```

### Signal Update Pattern

```typescript
// ❌ Don't do this (mutates array)
this.directoriesState().push(newDirectory);

// ✅ Do this (creates new array)
this.directoriesState.set([...this.directoriesState(), newDirectory]);
```

---

## Testing Commands

### Backend Tests

```bash
# Run Rust tests
cd src-tauri
cargo test

# Run specific test
cargo test validate_directory

# Check compilation
cargo check
```

### Frontend Tests

```bash
# Run Angular tests
npm test

# Run specific test file
npm test -- --include='**/directory.service.spec.ts'

# Check TypeScript compilation
npx tsc --noEmit
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run specific E2E suite
npm run e2e -- --spec="directory-management.e2e.ts"
```

---

## Common Tasks

### Add a New Validation Error

1. Add variant to `DirectoryErrorCode` enum in `directories.rs`
2. Add validation logic in `validate_directory()`
3. Add error message to i18n files

### Add a New Directory Field

1. Update `ScanDirectory` interface in `directory.models.ts`
2. Update migration logic if needed
3. Update UI to display new field

### Extend Scan Results

1. Modify Rust `scan_weapons` / `scan_items` commands
2. Update `Weapon` / `Item` models
3. Update display components

---

## Debugging Tips

### Frontend Debugging

```typescript
// Log signal changes
effect((onCleanup) => {
    const directories = this.directoryService.directoriesSig();
    console.log('Directories changed:', directories);
    onCleanup(() => { /* cleanup */ });
});
```

### Backend Debugging

```rust
// Add debug logging
println!("Validating directory: {}", path);

// Use dbg! macro for quick debugging
let result = dbg!(validate_directory(path.clone()));
```

### Tauri DevTools

```bash
# Run Tauri in development mode with verbose logging
npm run tauri dev -- --log-level debug
```

---

## Migration Notes

### For Existing Users

When the feature is deployed:

1. Existing `gamePath` setting is migrated to first entry in `scanDirectories`
2. Existing weapon/item items will have `sourceDirectory = ""` (unknown)
3. After first scan with new code, all items will have proper `sourceDirectory`

### Rollback Plan

If the feature needs rollback:

1. Revert to single `gamePath` in AppSettings
2. Frontend: Use first entry of `scanDirectories` as `gamePath`
3. Backend: Use `None` for directory parameter (fallback to global path)

---

## Performance Considerations

- **Directory validation**: < 100ms per directory (local filesystem)
- **Scanning**: Depends on directory size, typically 1-5 seconds
- **Signal updates**: Efficient Angular reactivity (no RxJS overhead)
- **Memory**: ~10MB for 10k items across 10 directories

---

## Security Notes

1. **Path validation**: Always validate paths before scanning
2. **Permissions**: Check read access before attempting scan
3. **Symlinks**: Be aware of potential symlink attacks
4. **Resource limits**: Consider max files/depth limits

---

## Related Documentation

- [Data Model](./data-model.md) - Entity definitions
- [Research](./research.md) - Technical decisions
- [Contracts](./contracts/) - Service and command contracts
- [Feature Spec](./spec.md) - User-facing requirements

---

## Questions?

Contact the development team or create an issue in the project repository.
