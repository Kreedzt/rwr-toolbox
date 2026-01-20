# Quickstart: UI Optimizations Implementation

**Feature**: 001-ui-optimizations
**Date**: 2026-01-16

---

## Overview

This quickstart guide provides a step-by-step approach to implementing the UI optimizations feature, including search bar layout fixes, scan directory persistence, table scrolling modes, and navigation menu width adjustments.

---

## Prerequisites

### Tools Required
- Node.js + pnpm (package manager)
- Angular CLI v20.3.13
- Rust 1.75+ (edition 2021)
- Tauri 2.x
- Git (for version control)

### Setup Commands

```bash
# Install dependencies (if not already installed)
pnpm install

# Verify Tauri setup
pnpm tauri info

# Start development server
pnpm tauri dev
```

---

## Implementation Roadmap

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Navigation menu width fix | 30 minutes |
| **Phase 2** | Search bar layout consistency | 1 hour |
| **Phase 3** | Tauri commands (Rust backend) | 2 hours |
| **Phase 4** | Directory service (Angular) | 2 hours |
| **Phase 5** | Scrolling mode service (Angular) | 1.5 hours |
| **Phase 6** | Table scrolling implementation | 2 hours |
| **Phase 7** | Toggle button and UI | 1 hour |
| **Phase 8** | i18n translations | 30 minutes |
| **Phase 9** | Testing and validation | 1 hour |

**Total Estimated Time**: ~11.5 hours

---

## Phase 1: Navigation Menu Width Fix

**Goal**: Ensure navigation menu items fill the full 200px width of the navigation container.

### Step 1.1: Locate Navigation Menu Component

The navigation menu is located in `src/app/app.component.html`. Look for the class `menu grow p-2 gap-0.5 overflow-y-auto`.

### Step 1.2: Add Width Utility

Add the `w-full` Tailwind utility class to the menu container:

```html
<!-- Before -->
<div class="menu grow p-2 gap-0.5 overflow-y-auto">

<!-- After -->
<div class="menu grow p-2 gap-0.5 overflow-y-auto w-full">
```

### Step 1.3: Verify Fix

Run `pnpm tauri dev` and verify that:
- Menu items now span the full width of the navigation container
- No excessive empty space within the menu
- Layout remains responsive at 800×600 resolution

---

## Phase 2: Search Bar Layout Consistency

**Goal**: Apply vertical layout to search bars on all pages with search functionality (players, servers, etc.).

### Step 2.1: Identify Search Components

Search for search-related components in:
- `src/app/features/players/players.component.html`
- `src/app/features/servers/servers.component.html`
- Any other components with search functionality

### Step 2.2: Apply Vertical Flex Layout

Wrap search input and button in a flex container with `flex-col`:

```html
<!-- Example pattern to apply -->
<div class="flex flex-col gap-2">
  <input
    type="text"
    class="input input-bordered input-sm w-full"
    [placeholder]="'common.search' | transloco"
    [(ngModel)]="searchText"
  />
  <button class="btn btn-primary btn-sm">
    {{ 'common.search' | transloco }}
  </button>
</div>
```

### Step 2.3: Test Across Pages

Verify that all search bars now use vertical layout consistently.

---

## Phase 3: Tauri Commands (Rust Backend)

**Goal**: Implement Rust commands for persisting scan directories and scrolling mode.

### Step 3.1: Open Rust Project

Navigate to `src-tauri/` and open `src/lib.rs`.

### Step 3.2: Add Dependencies

Ensure `Cargo.toml` includes necessary dependencies:

```toml
[dependencies]
tauri = { version = "2.x", features = ["shell-open"] }
tauri-plugin-store = "2.x"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Step 3.3: Implement Commands

Add the following commands to `lib.rs` (see `contracts/tauri-commands.md` for full implementation):

```rust
#[tauri::command]
async fn get_scan_directories(
    store: tauri_plugin_store::Store<tauri::State>,
) -> Result<Vec<String>, String> {
    store.get("scan_directories").unwrap_or_default()
}

#[tauri::command]
async fn save_scan_directories(
    directories: Vec<String>,
    store: tauri_plugin_store::Store<tauri::State>,
) -> Result<(), String> {
    store.set("scan_directories", directories);
    Ok(())
}

#[tauri::command]
async fn get_scrolling_mode(
    store: tauri_plugin_store::Store<tauri::State>,
) -> Result<Option<String>, String> {
    Ok(store.get("scrolling_mode"))
}

#[tauri::command]
async fn save_scrolling_mode(
    mode: String,
    store: tauri_plugin_store::Store<tauri::State>,
) -> Result<(), String> {
    if mode != "table-only" && mode != "full-page" {
        return Err("Invalid scrolling mode".to_string());
    }
    store.set("scrolling_mode", mode);
    Ok(())
}
```

### Step 3.4: Register Commands

In `main.rs`, register the commands:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_scan_directories,
            save_scan_directories,
            get_scrolling_mode,
            save_scrolling_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 3.5: Test Commands

Run `pnpm tauri dev` and test commands using the browser console:

```javascript
await invoke('get_scan_directories');
await invoke('save_scan_directories', { directories: ['/path/to/dir'] });
await invoke('get_scrolling_mode');
await invoke('save_scrolling_mode', { mode: 'table-only' });
```

---

## Phase 4: Directory Service (Angular)

**Goal**: Create Angular service for managing scan directories with persistence.

### Step 4.1: Create Service

Create `src/app/features/settings/services/directory.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  readonly directories = signal<string[]>([]);
  readonly count = computed(() => this.directories().length);
  readonly isEmpty = computed(() => this.directories().length === 0);

  async loadDirectories(): Promise<void> {
    try {
      const dirs = await invoke<string[]>('get_scan_directories');
      this.directories.set(dirs);
    } catch (error) {
      console.error('Failed to load scan directories:', error);
    }
  }

  async saveDirectories(directories: string[]): Promise<void> {
    try {
      await invoke('save_scan_directories', { directories });
      this.directories.set(directories);
    } catch (error) {
      console.error('Failed to save scan directories:', error);
      throw error;
    }
  }

  addDirectory(path: string): void {
    const updated = [...this.directories(), path];
    this.saveDirectories(updated);
  }

  removeDirectory(path: string): void {
    const updated = this.directories().filter(dir => dir !== path);
    this.saveDirectories(updated);
  }
}
```

### Step 4.2: Integrate with Settings Component

Update `src/app/features/settings/settings.component.ts`:

```typescript
export class SettingsComponent implements OnInit {
  constructor(private directoryService: DirectoryService) {}

  ngOnInit(): void {
    this.directoryService.loadDirectories();
  }

  get directories() {
    return this.directoryService.directories;
  }

  addDirectory(path: string): void {
    this.directoryService.addDirectory(path);
  }

  removeDirectory(path: string): void {
    this.directoryService.removeDirectory(path);
  }
}
```

### Step 4.3: Test Persistence

1. Add directories in settings
2. Restart application
3. Verify directories are restored

---

## Phase 5: Scrolling Mode Service (Angular)

**Goal**: Create service for managing scrolling mode preference with Angular Signals.

### Step 5.1: Create Service

Create `src/app/features/shared/services/scrolling-mode.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

export type ScrollingMode = 'table-only' | 'full-page';

@Injectable({ providedIn: 'root' })
export class ScrollingModeService {
  readonly mode = signal<ScrollingMode>('table-only');
  readonly isTableOnlyMode = computed(() => this.mode() === 'table-only');

  async loadMode(): Promise<void> {
    try {
      const saved = await invoke<ScrollingMode | null>('get_scrolling_mode');
      this.mode.set(saved || 'table-only');
    } catch (error) {
      console.error('Failed to load scrolling mode:', error);
      this.mode.set('table-only');
    }
  }

  async setMode(mode: ScrollingMode): Promise<void> {
    try {
      await invoke('save_scrolling_mode', { mode });
      this.mode.set(mode);
    } catch (error) {
      console.error('Failed to save scrolling mode:', error);
      throw error;
    }
  }
}
```

### Step 5.2: Initialize on App Startup

In `src/app/app.component.ts`:

```typescript
export class AppComponent implements OnInit {
  constructor(private scrollingModeService: ScrollingModeService) {}

  ngOnInit(): void {
    this.scrollingModeService.loadMode();
  }
}
```

---

## Phase 6: Table Scrolling Implementation

**Goal**: Implement table-only scrolling mode with toggle for all data tables.

### Step 6.1: Update Table Components

For each table component (weapons, items, players, servers):

1. Add scrolling mode service injection:

```typescript
constructor(private scrollingModeService: ScrollingModeService) {}
```

2. Create computed signal for scrolling mode:

```typescript
isTableOnlyMode = computed(() => this.scrollingModeService.isTableOnlyMode());
```

3. Update template with conditional scrolling:

```html
<!-- Wrap table with conditional height and overflow -->
<div
  [class]="
    isTableOnlyMode()
      ? 'h-[600px] overflow-y-auto'
      : 'overflow-y-auto'
  "
>
  <table class="table table-compact w-full">
    <thead class="sticky top-0 z-10 bg-base-200">
      <!-- Table headers -->
    </thead>
    <tbody>
      <!-- Table rows -->
    </tbody>
  </table>
</div>
```

### Step 6.2: Test Scrolling Modes

1. Toggle between modes
2. Verify table-only mode: only table content scrolls
3. Verify full-page mode: entire page scrolls

---

## Phase 7: Toggle Button and UI

**Goal**: Add toggle button to switch between scrolling modes.

### Step 7.1: Add Toggle Button

In each table component template:

```html
<button
  (click)="toggleScrollingMode()"
  class="btn btn-sm btn-ghost"
  [title]="'scrolling.toggleTooltip' | transloco"
>
  <lucide-icon
    [name]="isTableOnlyMode() ? 'arrow-down-to-line' : 'maximize-2'"
  ></lucide-icon>
  <span class="ml-2">
    {{ 'scrolling.' + (isTableOnlyMode() ? 'tableOnly' : 'fullPage') | transloco }}
  </span>
</button>
```

### Step 7.2: Add Toggle Method

In component:

```typescript
toggleScrollingMode(): void {
  const newMode = this.isTableOnlyMode() ? 'full-page' : 'table-only';
  this.scrollingModeService.setMode(newMode);
}
```

---

## Phase 8: i18n Translations

**Goal**: Add English and Chinese translations for new UI text.

### Step 8.1: Update English Translations

Edit `src/assets/i18n/en.json`:

```json
{
  "scrolling": {
    "tableOnly": "Table Scroll",
    "fullPage": "Full Page Scroll",
    "toggleTooltip": "Toggle scrolling mode"
  }
}
```

### Step 8.2: Update Chinese Translations

Edit `src/assets/i18n/zh.json`:

```json
{
  "scrolling": {
    "tableOnly": "表格滚动",
    "fullPage": "整页滚动",
    "toggleTooltip": "切换滚动模式"
  }
}
```

---

## Phase 9: Testing and Validation

**Goal**: Comprehensive testing of all features.

### Test Checklist

#### Navigation Menu
- [ ] Menu items fill full 200px width
- [ ] No excessive empty space
- [ ] Works at 800×600 resolution

#### Search Bar Layout
- [ ] All search bars use vertical layout
- [ ] Layout is consistent across pages
- [ ] Search functionality still works

#### Scan Directory Persistence
- [ ] Directories save correctly
- [ ] Directories restore on restart
- [ ] Empty list handled correctly
- [ ] Invalid directories handled gracefully

#### Scrolling Mode
- [ ] Default is table-only mode
- [ ] Toggle switches modes correctly
- [ ] Modes persist across restarts
- [ ] Table-only: only table scrolls
- [ ] Full-page: entire page scrolls
- [ ] Toggle button labels update correctly

#### i18n
- [ ] English translations display correctly
- [ ] Chinese translations display correctly
- [ ] Language switching works runtime

#### Theme Compatibility
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] No fixed color values in CSS

---

## Constitution Compliance Checklist

Before merging, verify:

- [ ] ✅ **Desktop-First UI Design**: 800×600 minimum resolution maintained
- [ ] ✅ **Internationalization**: All new UI text uses Transloco (en.json + zh.json)
- [ ] ✅ **Theme Adaptability**: All styling uses DaisyUI CSS variables
- [ ] ✅ **Signal-Based State Management**: No BehaviorSubjects, only Signals used
- [ ] ✅ **Documentation-Driven Development**: Update `docs-ai/PROGRESS.md` on completion

---

## Common Issues and Solutions

### Issue: Menu items still not filling width

**Solution**: Check if parent container has explicit width. If not, add `w-full` to parent as well.

### Issue: Persistence not working

**Solution**:
1. Check Tauri commands are registered in `main.rs`
2. Check plugin-store is initialized in `main.rs`
3. Check browser console for errors

### Issue: Scrolling mode not persisting

**Solution**: Verify `scrollingModeService.loadMode()` is called in `app.component.ts` on application startup.

### Issue: Table scrolling broken in full-page mode

**Solution**: Remove fixed height (`h-[600px]`) when not in table-only mode.

---

## Next Steps After Implementation

1. **Run Linting and Type Checking**:
   ```bash
   pnpm lint
   pnpm build  # TypeScript compilation check
   cargo clippy
   cargo fmt
   ```

2. **Create Pull Request**:
   - Commit changes with clear messages
   - Reference this feature: `001-ui-optimizations`
   - Include before/after screenshots if applicable

3. **Update Documentation**:
   - Edit `docs-ai/PROGRESS.md` with completion details
   - Update `docs-ai/STATUS.md` if necessary

4. **Merge**: After review and approval, merge to main branch

---

## Support

For questions or issues during implementation:
- Review the specification: `specs/001-ui-optimizations/spec.md`
- Review the research: `specs/001-ui-optimizations/research.md`
- Review the data model: `specs/001-ui-optimizations/data-model.md`
- Review the Tauri contracts: `specs/001-ui-optimizations/contracts/tauri-commands.md`
