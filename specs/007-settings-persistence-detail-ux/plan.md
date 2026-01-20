# Bug Fix Plan: Scan Directory Loading State Issues

**Branch**: `007-settings-persistence-detail-ux` | **Date**: 2025-01-20 | **Spec**: [spec.md](./spec.md)
**Bug Report**: "设置页面中的扫描目录列表内容每次启动时一直在 loading, 并且在 weapons 和 items 页面切换时也会重复 loading"

## Summary

Fix two related loading state bugs:
1. **Settings page loading state stuck** - Scan directories remain in "validating" status indefinitely on app startup
2. **Repeated loading on page switch** - Switching between weapons and items pages triggers unnecessary revalidation

**Root Cause Analysis**:
- `SettingsComponent.ngOnInit()` calls `loadDirectories()` without `await` - async operation runs in background without waiting
- `DirectoryService.initialize()` is **never called** - method exists but not invoked anywhere in the app
- `loadingSig` is never set to `true` during `loadDirectories()` - UI shows loading but never clears it
- Weapons/Items components call `loadWeapons()` immediately in `ngOnInit()` before directories are validated

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Angular 20.3.15), Rust edition 2021 (Tauri 2.x)
**Primary Dependencies**: Angular Signals, Tauri plugin-store
**Storage**: Tauri plugin-store (settings.json)
**Project Type**: Tauri desktop application

## Root Cause Details

### Issue 1: Settings Component Initialization
```typescript
// src/app/features/settings/settings.component.ts:62-65
ngOnInit(): void {
    // Load scan directories from Tauri store
    this.directoryService.loadDirectories();  // ❌ Not awaited!
}
```

### Issue 2: DirectoryService.initialize() Never Called
```typescript
// src/app/features/settings/services/directory.service.ts:93-111
async initialize(): Promise<void> {
    await this.loadDirectories();  // Loads from plugin-store
    await this.revalidateAll();    // Updates directory status
    if (hasAnyDirectories) {
        this.scanAllDirectories(); // Auto-scan on startup
    }
}
```
**Problem**: This method exists but is never invoked.

### Issue 3: Loading State Not Managed
```typescript
// src/app/features/settings/services/directory.service.ts:407-434
async loadDirectories(): Promise<void> {
    // ❌ loadingState.set(true);  // Missing!
    try {
        // ... load from store
        this.directoriesState.set(scanDirs);
    } finally {
        // ❌ loadingState.set(false);  // Missing!
    }
}
```

### Issue 4: Weapons/Items Components Load Too Early
```typescript
// src/app/features/data/weapons/weapons.component.ts:185-188
ngOnInit(): void {
    // Load weapons on component init
    this.loadWeapons();  // ❌ Runs before directories are validated
}
```

## Constitution Check

*GATE: Must pass before implementation*

- [✓] **Constitution Principle I (Minimal Intervention)**: Bug fix only, no new features
- [✓] **Constitution Principle II (No Breaking Changes)**: Existing API contracts preserved
- [✓] **Constitution Principle III (Theme Consistency)**: No visual changes
- [✓] **Constitution Principle VI (Code Quality)**: Follows existing patterns

## Solution Design

### Approach 1: Fix Settings Component (RECOMMENDED)

**Change 1**: Await `loadDirectories()` in SettingsComponent
```diff
// src/app/features/settings/settings.component.ts
ngOnInit(): void {
-   this.directoryService.loadDirectories();
+   this.directoryService.loadDirectories().then(() => {
+       this.directoryService.revalidateAll();
+   });
}
```

**Change 2**: Add loading state management to `loadDirectories()`
```diff
// src/app/features/settings/services/directory.service.ts
async loadDirectories(): Promise<void> {
+   this.loadingState.set(true);
    try {
        // ... existing code
    } finally {
+       this.loadingState.set(false);
    }
}
```

**Change 3**: Prevent Weapons/Items from loading before validation
```diff
// src/app/features/data/weapons/weapons.component.ts
async loadWeapons(): Promise<void> {
    const directory = this.directoryService.getSelectedDirectory() ||
        this.directoryService.getFirstValidDirectory();

    if (!directory) {
+       // Don't set error if directories are still being validated
+       const isAnyValidating = this.directoryService.isAnyValidatingSig();
+       if (isAnyValidating) {
+           console.log('Weapons: Directories being validated, waiting...');
+           return;
+       }
        const errorMsg = this.transloco.translate('weapons.errors.noGamePath');
        this.weaponService['error'].set(errorMsg);
        return;
    }
    // ... rest of method
}
```

### Approach 2: Use APP_INITIALIZER (ALTERNATIVE)

Add proper app-level initialization using Angular's `APP_INITIALIZER`:

```typescript
// src/app/app.config.ts
export function initializeDirectoryService(directoryService: DirectoryService) {
  return () => directoryService.initialize();
}

providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: initializeDirectoryService,
    deps: [DirectoryService],
    multi: true
  }
]
```

**Decision**: Approach 1 recommended - minimal changes, follows existing patterns.

## Implementation Tasks

- [x] T-BUG1 Add loading state management to `DirectoryService.loadDirectories()`
- [x] T-BUG2 Fix `SettingsComponent.ngOnInit()` to await load and trigger revalidation
- [x] T-BUG3 Add validation check to `WeaponsComponent.loadWeapons()`
- [x] T-BUG4 Add validation check to `ItemsComponent.loadItems()`
- [ ] T-BUG5 Manual testing: Verify settings page loads correctly on startup
- [ ] T-BUG6 Manual testing: Verify no repeated loading when switching pages

## Files Modified

1. `src/app/features/settings/services/directory.service.ts` - Add loading state
2. `src/app/features/settings/settings.component.ts` - Await loadDirectories()
3. `src/app/features/data/weapons/weapons.component.ts` - Check validation state
4. `src/app/features/data/items/items.component.ts` - Check validation state

## Testing Checklist

- [ ] Settings page shows directories correctly on fresh app start
- [ ] Settings page doesn't show perpetual "validating" state
- [ ] Switching from Settings → Weapons doesn't trigger revalidation
- [ ] Switching from Weapons → Items doesn't trigger revalidation
- [ ] Adding new directory works correctly
- [ ] Removing directory works correctly
