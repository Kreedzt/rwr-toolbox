# Quick Start: UX Improvements

**Feature**: [spec.md](./spec.md) | **Date**: 2026-01-16

---

## Feature Overview

This feature implements 4 UX improvements for the RWR Toolbox desktop application:

1. **Fix Search Bar Layout Consistency** (P1) - Players page search layout now matches other pages
2. **Add Item Images** (P2) - Weapons and Items tables display images in first column
3. **Scan Directory Persistence** (P1) - User-configured directories persist across sessions (enhance existing)
4. **Theme Switching** (P2) - Light/dark theme toggle with auto-detection
5. **Remove Game Path Setting** (P1) - Obsolete single directory setting removed, migrated to multi-directory system

**Breaking Change**: GamePath is completely removed (not just hidden). One-time migration converts existing gamePath to first scan directory.

---

## Prerequisites

- ✅ Angular v20.3.15 with Signals pattern
- ✅ Tailwind CSS v4.1.18 + DaisyUI v5.5.14
- ✅ Transloco v8.x for i18n
- ✅ Tauri plugin-store for settings
- ✅ DirectoryService already implemented (multi-directory support)
- ✅ Existing scan directories UI in Settings

---

## Getting Started

### 1. Run Development Server

```bash
# Start Tauri dev server (includes Angular dev server)
pnpm tauri dev
```

### 2. Navigate to Settings Page

1. Open application in your browser
2. Click "Settings" in left sidebar menu
3. Observe scan directories section (should show existing directories)
4. Observe game path section (should be removed after implementation)

### 3. Verify Scan Directory Persistence

1. Add a new directory using "Add Directory" button
2. Verify directory appears in list
3. Close application and restart
4. Navigate back to Settings page
5. Verify directory is still present ✅

### 4. Verify Theme Switching (After Implementation)

1. Navigate to Settings page
2. Find theme dropdown (new component after implementation)
3. Toggle between light/dark themes
4. Navigate to different pages (Players, Servers, Data)
5. Verify theme is applied consistently
6. Close and restart application
7. Verify theme preference is restored ✅

### 5. Verify Search Layout Consistency

1. Navigate to Players page
2. Observe search bar:
   - Search label and input field should be on same line
   - Search button should be on line below
3. Compare with Servers, Weapons, Items pages (should match)

### 6. Verify Item Images (After Implementation)

1. Navigate to Data page
2. Switch to Items tab
3. Observe items table:
   - First column should display images
   - Images should be properly aligned
   - Other columns should maintain their position

---

## Data Flow

### Scan Directory Persistence Flow

```
User Action                      System Response
-----------                      --------------
Add Directory                  DirectoryService.addDirectory()
                              → saveScanDirs() to Tauri store
                              → Update directoriesSig signal
                              → UI updates

Restart App                    SettingsService.initialize()
                              → loadDirectories() from Tauri store
                              → Update directoriesSig signal
                              → DirectoryService.revalidateAll()
                              → UI shows persisted directories
```

### Theme Switching Flow

```
User Action                      System Response
-----------                      --------------
Toggle Theme                    ThemeService.setTheme(theme)
                              → setThemePreference() to Tauri store
                              → Update themeSig signal
                              → Apply CSS classes to document root
                              → All components react to theme change

Restart App                     SettingsService.initialize()
                              → getThemePreference() from Tauri store
                              → If isAutoDetect=true:
                                  → get_system_theme() Tauri command
                                  → Set theme based on OS
                              → Update themeSig signal
                              → Apply CSS classes
                              → UI starts with correct theme
```

### GamePath Migration Flow

```
App Startup                     SettingsService.initialize()
                                → getGamePath() from Tauri store
                                → IF gamePath exists AND no scanDirectories:
                                    → migrateGamePathToScanDirectory()
                                    → setScanDirectories([migratedDirectory])
                                    → clearGamePath() from Tauri store
                                → DirectoryService.loadDirectories()
                                → UI shows migrated directory
```

---

## Integration Points

### ThemeService Integration

- **Where**: `/src/app/shared/services/theme.service.ts` (NEW)
- **What to do**:
  1. Create `themeSig` signal for current theme
  2. Create `setTheme(theme: 'light' | 'dark')` method
  3. Create `getTheme()` method to read from Tauri store
  4. Create `detectSystemTheme()` method to query OS theme
  5. Apply CSS classes to `<body>` element

- **Tauri Commands** (if needed for OS theme detection):
  ```rust
  #[tauri::command]
  pub async fn get_system_theme() -> Result<String, String> {
      // Detect OS theme (light/dark)
  }
  ```

### SettingsComponent Integration

- **What to do**:
  1. Remove game path HTML elements (input field, validation button)
  2. Add theme dropdown component
  3. Wire theme selection to ThemeService
  4. Ensure scan directories section uses DirectoryService for persistence

- **Template Changes**:
  ```html
  <!-- REMOVE: Game path input and validation button -->
  <!-- ADD: Theme dropdown -->
  <div class="form-control">
    <label class="label">Theme</label>
    <select class="select select-bordered" (change)="onThemeChange($event)">
      <option value="auto" [selected]="isAutoTheme()">
        Auto (System)
      </option>
      <option value="light" [selected]="theme === 'light'">
        Light
      </option>
      <option value="dark" [selected]="theme === 'dark'">
        Dark
      </option>
    </select>
  </div>
  ```

### Data Pages Integration

- **What to do**:
  1. Add image column to Weapons and Items column definitions
  2. Update table templates to display image in first column
  3. Add `<img>` tags with fallback handling

- **Column Definitions**:
  ```typescript
  // Add to weapons.columns.ts and items.columns.ts
  export const IMAGE_COLUMN: WeaponColumn = {
    key: 'image',
    label: 'weapons.column.image',
    alwaysVisible: true,
    order: 0
  };
  ```

- **Template Changes**:
  ```html
  <!-- Before: Key column first -->
  @if (isColumnVisible('key')) {
    <th class="sticky">Key</th>
  }

  <!-- After: Image column first -->
  @if (isColumnVisible('image')) {
    <th class="sticky">Image</th>
  }
  @if (isColumnVisible('key')) {
    <th class="sticky">Key</th>
  }

  <!-- Table body -->
  <td>
    @if (item.imagePath) {
      <img [src]="getImagePath(item)" [alt]="item.name" class="w-8 h-8 object-cover">
    } @else {
      <div class="w-8 h-8 bg-base-200 rounded flex items-center justify-center text-xs opacity-50">
        <i-lucide name="package" class="w-4 h-4"></i-lucide>
      </div>
    }
  </td>
  ```

### PlayersComponent Integration

- **What to do**: Fix search bar layout to match other pages
- **Issue**: Currently, search label and input are on different lines
- **Solution**: Use same layout pattern as Servers, Weapons, Items

- **Expected Layout**:
  ```html
  <div class="join flex-col gap-2 mb-4">
    <input type="text" placeholder="Search username" class="input input-bordered" />
    <button class="btn btn-primary">Search</button>
  </div>
  ```

---

## Testing Checklist

### Manual Testing

- [ ] Search bar layout is consistent across all pages
- [ ] Scan directories persist after app restart
- [ ] GamePath is migrated to first directory
- [ ] GamePath UI is completely removed
- [ ] Theme switching works smoothly
- [ ] Theme preference persists after restart
- [ ] Auto-detect uses system theme on first launch
- [ ] Images display in Items and Weapons tables
- [ ] Images handle loading failures gracefully
- [ ] All pages apply theme consistently
- [ ] No hardcoded English or Chinese text (all via Transloco)
- [ ] Signal-based state used (no BehaviorSubject)

### Automated Testing

```bash
# Run Angular tests
pnpm test

# Run TypeScript compiler
pnpm tsc --noEmit

# Run Prettier formatter
pnpm format:check

# Run Cargo linter for Rust changes
cd src-tauri && cargo clippy

# Format Rust code
cd src-tauri && cargo fmt
```

---

## Common Issues & Solutions

### Issue: Theme doesn't apply to all components

**Symptoms**: Some components keep old theme colors after switching

**Solution**:
1. Ensure theme CSS class is applied to `<body>` element, not individual components
2. Use DaisyUI CSS variables (`oklch(var(--b2))`) everywhere
3. Restart dev server after theme changes to clear CSS cache

### Issue: Images don't load

**Symptoms**: Broken image icons in Items/Weapons tables

**Solution**:
1. Check image path construction in template
2. Ensure Tauri asset protocol is used: `tauri://` or correct relative path
3. Verify fallback placeholder displays when image path is null

### Issue: GamePath not migrated

**Symptoms**: Existing users lose their configured directory

**Solution**:
1. Check SettingsService.initialize() method
2. Ensure migration logic runs before DirectoryService.initialize()
3. Verify migration runs only once (check if scanDirectories already exists)

---

## Notes

- **Breaking Change**: GamePath is fully removed. Existing users will have their directory migrated automatically on first startup.
- **Bold Refactoring**: Remove all gamePath-related code from SettingsService, WeaponsComponent, ItemsComponent, and SettingsComponent.
- **No Backend Changes**: Theme and directory persistence use existing Tauri plugin-store. No new Rust commands needed (maybe OS theme detection).
- **Progressive Enhancement**: Item images use fallback placeholders if images don't exist, so table rendering is not blocked.
