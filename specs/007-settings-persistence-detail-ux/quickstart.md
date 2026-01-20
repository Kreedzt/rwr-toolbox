# Quickstart: Settings Persistence and Detail View UX

**Feature**: [spec.md](../spec.md) | **Date**: 2025-01-19 | **Phase**: 1 (Design)

## Overview

This guide provides step-by-step instructions for implementing the three user stories:
1. **Settings persistence** for scan directories (P1 - MVP)
2. **Non-modal detail view** for weapons and items (P2)
3. **Missing translation key** for hotkeys (P3)

**Implementation Time**: ~2-3 hours for all three stories

**Prerequisites**:
- Angular v20.3.15 project with Tauri 2.x backend
- Tauri plugin-store already configured (check `src-tauri/Cargo.toml`)
- Existing `DirectoryService`, `WeaponsComponent`, and `ItemsComponent`

---

## Part 1: Settings Persistence (P1 - MVP)

**Goal**: Scan directories persist across application restarts

**Files Modified**: 3
- `src/app/features/settings/services/directory.service.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`

### Step 1: Modify DirectoryService.initialize()

**File**: `src/app/features/settings/services/directory.service.ts`
**Line**: ~93-99

**Find**:
```typescript
async initialize(): Promise<void> {
    const directories = this.settingsService.getScanDirectories();
    this.directoriesState.set(directories);
    this.revalidateAll();
}
```

**Replace with**:
```typescript
async initialize(): Promise<void> {
    // Load from plugin-store first (persisted settings)
    await this.loadDirectories();

    // Revalidate all directories to update status
    this.revalidateAll();
}
```

### Step 2: Modify DirectoryService.addDirectory()

**File**: `src/app/features/settings/services/directory.service.ts`
**Line**: ~153

**Find** (after `this.directoriesState.set(updated);`):
```typescript
const updated = [...this.directoriesState(), newDirectory];
this.directoriesState.set(updated);
// <-- ADD CODE HERE
```

**Add after**:
```typescript
// Persist to plugin-store
await this.saveScanDirs(updated);
```

**Note**: `removeDirectory()` already calls `saveScanDirs()` (line ~171), so no change needed there.

### Step 3: Add Error Handling

**File**: `src/app/features/settings/services/directory.service.ts`

**Find** the `loadDirectories()` method and wrap the body in try-catch:

```typescript
async loadDirectories(): Promise<void> {
    try {
        if (!this.store) {
            this.store = await Store.load('settings.json');
        }
        const dirs = await this.store.get<string[]>(SCAN_DIRECTORIES_KEY);
        // ... existing code ...
    } catch (error) {
        console.error('Failed to load scan directories:', error);
        // Graceful fallback - use empty array on corrupted settings
        this.directoriesState.set(DEFAULT_SCAN_DIRECTORIES);
    }
}
```

### Step 4: Test Persistence

1. Add scan directories in Settings page
2. Close the application completely
3. Reopen the application
4. Navigate to Settings page
5. ✅ Verify directories are still present

---

## Part 2: Non-Modal Detail View (P2)

**Goal**: Replace modal dialogs with side panel for efficient browsing

**Files Modified**: 6
- `src/app/features/data/weapons/weapons.component.ts`
- `src/app/features/data/weapons/weapons.component.html`
- `src/app/features/data/weapons/weapons.component.scss` (NEW)
- `src/app/features/data/items/items.component.ts`
- `src/app/features/data/items/items.component.html`
- `src/app/features/data/items/items.component.scss` (NEW)

### Step 1: Add Detail View State to WeaponsComponent

**File**: `src/app/features/data/weapons/weapons.component.ts`

**Add to component class** (after existing signals):
```typescript
// NEW: Detail view state
readonly selectedWeapon = signal<Weapon | null>(null);
readonly isDetailPanelOpen = signal<boolean>(false);
readonly detailPanelPosition = signal<'normal' | 'overlay'>('normal');
```

### Step 2: Add Selection and Navigation Methods

**File**: `src/app/features/data/weapons/weapons.component.ts`

**Add methods**:
```typescript
/** Select a weapon and display in detail panel */
selectWeapon(weapon: Weapon): void {
    this.selectedWeapon.set(weapon);
    this.isDetailPanelOpen.set(true);
}

/** Close the detail panel and clear selection */
closeDetailPanel(): void {
    this.isDetailPanelOpen.set(false);
    this.selectedWeapon.set(null);
}

/** Select the next weapon in the list (keyboard navigation) */
selectNext(): void {
    const current = this.selectedWeapon();
    if (!current) return;

    const weapons = this.paginatedWeapons();
    const index = weapons.findIndex(w => w.key === current.key);
    if (index < weapons.length - 1) {
        this.selectWeapon(weapons[index + 1]);
    }
}

/** Select the previous weapon in the list (keyboard navigation) */
selectPrevious(): void {
    const current = this.selectedWeapon();
    if (!current) return;

    const weapons = this.paginatedWeapons();
    const index = weapons.findIndex(w => w.key === current.key);
    if (index > 0) {
        this.selectWeapon(weapons[index - 1]);
    }
}
```

### Step 3: Create Side Panel Styles (NEW FILE)

**File**: `src/app/features/data/weapons/weapons.component.scss` (create new)

**Add content**:
```scss
// Detail Side Panel
.detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 75%;        // FR-012: 3/4 width for spacious detail view
    min-width: 400px;  // FR-012: Minimum width constraint
    height: 100vh;
    background: oklch(var(--b2));  // FR-013: Solid theme-aware background
    border-left: 1px solid oklch(var(--b3));
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    z-index: 50;
    display: flex;
    flex-direction: column;

    &.overlay {
        width: 100%;
        max-width: 60%;
        background: oklch(var(--b2));
        border-left: none;
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid oklch(var(--b3));
    }

    .detail-content {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;

        // File path cell with word break for long paths
        .file-path-cell {
            word-break: break-all;  // Break long paths at any character
            max-width: 100%;        // Constrain to panel width
            font-family: ui-monospace, monospace;
            font-size: 0.75rem;     // text-xs for high information density
            color: oklch(var(--bc) / 0.7);  // FR-014: Theme-aware secondary text
            line-height: 1.4;       // Readable line spacing
        }
    }
}

// Highlight selected row in table
table {
    tr.active {
        background-color: hsl(var(--p) / 0.1);
    }
}
```

### Step 4: Update Template - Replace Modal with Side Panel

**File**: `src/app/features/data/weapons/weapons.component.html`

**Remove**: The entire `<dialog>` modal structure (typically around lines 616-880)

**Add** (after the closing `</table>` tag, before the component's closing tags):
```html
<!-- Detail Side Panel -->
@if (isDetailPanelOpen() && selectedWeapon()) {
    <aside class="detail-panel" [class.overlay]="detailPanelPosition() === 'overlay'">
        <div class="detail-header">
            <h3 class="font-bold text-lg">{{ selectedWeapon()!.name }}</h3>
            <button class="btn btn-sm btn-circle btn-ghost" (click)="closeDetailPanel()">
                <lucide-icon name="X"></lucide-icon>
            </button>
        </div>

        <div class="detail-content overflow-y-auto">
            <!-- Specifications table -->
            <table class="table table-sm">
                <tbody>
                    <tr>
                        <td class="w-1/3">{{ 'weapons.columns.key' | transloco }}</td>
                        <td class="font-mono text-sm">{{ selectedWeapon()!.key || '-' }}</td>
                    </tr>
                    <tr>
                        <td>{{ 'weapons.columns.category' | transloco }}</td>
                        <td>{{ selectedWeapon()!.category || '-' }}</td>
                    </tr>
                    <tr>
                        <td>{{ 'weapons.detail.file_path' | transloco }}</td>
                        <td>
                            <div class="file-path-cell">{{ selectedWeapon()!.filePath }}</div>
                        </td>
                    </tr>
                    <!-- Add more weapon-specific fields here -->
                </tbody>
            </table>
        </div>
    </aside>
}
```

### Step 5: Update Table Row Click Handler

**File**: `src/app/features/data/weapons/weapons.component.html`

**Find** the table row definition (typically `<tr *ngFor="let weapon of ...`)

**Update** to include active class and new click handler:
```html
<tr
    class="cursor-pointer hover:bg-base-200"
    [class.active]="selectedWeapon()?.key === weapon.key"
    (click)="selectWeapon(weapon)"
    (keydown.arrowDown)="selectNext()"
    (keydown.arrowUp)="selectPrevious()"
    (keydown.escape)="closeDetailPanel()"
>
```

### Step 6: Repeat for Items Component

Repeat Steps 1-5 for:
- `src/app/features/data/items/items.component.ts`
- `src/app/features/data/items/items.component.html`
- `src/app/features/data/items/items.component.scss` (create new)

**Key differences for Items**:
- Use `selectedItem` instead of `selectedWeapon`
- Use `selectItem(item: Item)` instead of `selectWeapon`
- Use `paginatedItems()` instead of `paginatedWeapons()`

---

## Part 3: Translation Key (P3)

**Goal**: Add missing `hotkeys.game_path` translation key

**Files Modified**: 2
- `src/assets/i18n/en.json`
- `src/assets/i18n/zh.json`

### Step 1: Add English Translation

**File**: `src/assets/i18n/en.json`

**Find** the `hotkeys` section (around line 286)

**Add** the new key:
```json
{
    "hotkeys": {
        "game_path": "Game Path",
        "no_game_path": "Game Path Not Configured",
        // ... existing keys ...
    }
}
```

### Step 2: Add Chinese Translation

**File**: `src/assets/i18n/zh.json`

**Find** the `hotkeys` section (around line 286)

**Add** the new key:
```json
{
    "hotkeys": {
        "game_path": "游戏路径",
        "no_game_path": "未配置游戏路径",
        // ... existing keys ...
    }
}
```

---

## Build and Test

### Build Commands

```bash
# Build Rust backend (no changes expected)
cargo build

# Build Angular frontend
pnpm build

# Or run dev server
pnpm tauri dev
```

### Testing Checklist

#### Settings Persistence (US1)
- [ ] Configure directories → restart app → directories persist
- [ ] Add directory → check file system → settings.json updated
- [ ] Remove directory → check file system → settings.json updated
- [ ] Corrupt settings.json → restart app → app starts with empty list
- [ ] Verify no console errors related to plugin-store

#### Detail View (US2)
- [ ] Click weapon row → detail panel appears at 75% width
- [ ] Click different weapon row → panel updates content (no close/open)
- [ ] Click X button → panel closes
- [ ] Press Escape → panel closes
- [ ] Press Arrow Down → selects next weapon, panel updates
- [ ] Press Arrow Up → selects previous weapon, panel updates
- [ ] Long file path → wraps without horizontal scrollbar
- [ ] Switch theme (light/dark) → panel background updates immediately

#### Translation (US3)
- [ ] Switch to English → hotkeys page shows "Game Path"
- [ ] Switch to Chinese → hotkeys page shows "游戏路径"
- [ ] No missing key errors in console

---

## Common Issues and Solutions

### Issue: Detail panel not showing

**Symptoms**: Clicking rows doesn't show panel

**Troubleshooting**:
1. Check browser console for errors
2. Verify `isDetailPanelOpen()` signal is being set to `true`
3. Check `z-index` of `.detail-panel` (should be `50` or higher)
4. Verify SCSS file is being loaded (check component `styleUrls`)

**Fix**: Ensure component has `styleUrls: ['./weapons.component.scss']` decorator

---

### Issue: File paths cause horizontal scroll

**Symptoms**: Long file paths create horizontal scrollbar in panel

**Fix**: Add `.file-path-cell` class with `word-break: break-all`

```scss
.file-path-cell {
    word-break: break-all;
    max-width: 100%;
}
```

---

### Issue: Settings not persisting

**Symptoms**: Directories disappear after restart

**Troubleshooting**:
1. Check if `saveScanDirs()` is being called in `addDirectory()`
2. Verify `await store.save()` is called after `store.set()`
3. Check file system for `settings.json` in platform-specific app data directory
4. Check browser console for plugin-store errors

**Fix**: Ensure async/await is used correctly:
```typescript
await this.saveScanDirs(updated);  // Must await!
```

---

### Issue: Panel background transparent

**Symptoms**: Panel looks transparent, text overlaps with table

**Fix**: Use solid background color:
```scss
.detail-panel {
    background: oklch(var(--b2));  // Solid, not transparent
}
```

---

### Issue: Theme switching not working

**Symptoms**: Panel stays same color when switching light/dark theme

**Fix**: Use theme-aware CSS variables:
```scss
.detail-panel {
    background: oklch(var(--b2));  // Automatically adapts
}
```

---

## Summary

**What was changed**:
1. ✅ `DirectoryService`: Wired up persistence methods
2. ✅ `WeaponsComponent`/`ItemsComponent`: Added detail panel state and navigation
3. ✅ HTML templates: Replaced modal with side panel markup
4. ✅ SCSS files: Added side panel styles (75% width, solid background, theme-aware)
5. ✅ i18n files: Added `hotkeys.game_path` translation

**What was NOT changed**:
- ❌ No new Tauri commands (uses existing plugin-store)
- ❌ No new data models (uses existing `Weapon`, `Item`, `ScanDirectory`)
- ❌ No backend Rust code changes

**Ready for**: Manual testing and deployment
