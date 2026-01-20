# Research: UI Optimizations

**Feature**: 001-ui-optimizations
**Date**: 2026-01-16
**Status**: Complete

## Research Objectives

1. Determine best practices for fixing CSS layout issues in Angular + Tailwind CSS
2. Identify optimal approach for persisting user preferences with Tauri plugin-store
3. Research Angular Signals implementation patterns for scroll state management
4. Document Tailwind CSS utility classes for width utilization and layout fixes

---

## Decision 1: Navigation Menu Width Fix

**Context**: The navigation menu uses class `menu grow p-2 gap-0.5 overflow-y-auto` but doesn't inherit 100% width from its parent. Inline style `style=width:100%` resolves the issue.

**Decision**: Use Tailwind CSS utility classes instead of inline styles. Add `w-full` class to ensure the menu container uses 100% width of its parent, adjusting the current Tailwind class list from `menu grow p-2 gap-0.5 overflow-y-auto` to include width utilities.

**Rationale**:
- Inline styles violate Tailwind CSS best practices and make maintenance difficult
- `w-full` utility is the standard Tailwind way to set 100% width
- Maintains consistency with project's Tailwind-first styling approach
- Keeps styling in CSS layer (via utility classes) rather than inline in templates

**Alternatives Considered**:
1. Inline `style=width:100%` - Rejected: Violates Tailwind CSS conventions, harder to maintain
2. Custom CSS class in component stylesheet - Rejected: Adds unnecessary CSS file for a simple width utility
3. CSS module with width: 100% - Rejected: Overkill for a single property, Tailwind utilities preferred

**Implementation Approach**:
```
Current: menu grow p-2 gap-0.5 overflow-y-auto
Updated:  menu grow p-2 gap-0.5 overflow-y-auto w-full
```

---

## Decision 2: Search Bar Layout Consistency

**Context**: Search bar elements (input field + button) need vertical layout on all pages with search functionality. Currently inconsistent layout across pages.

**Decision**: Use Tailwind flexbox utilities to ensure vertical stacking of search input and button. Apply `flex-col` to the search container wrapper.

**Rationale**:
- Flexbox is Tailwind's recommended approach for layout alignment
- `flex-col` creates vertical stack direction
- Can be applied consistently across all search components
- Works with DaisyUI theme system (no fixed colors needed)
- Responsive and maintains 800×600 minimum resolution

**Alternatives Considered**:
1. Grid layout with `grid-rows-2` - Rejected: More complex than needed for simple stacking
2. Absolute positioning - Rejected: Breaks responsive design, harder to maintain
3. Custom CSS with `display: block` - Rejected: Less flexible than flexbox, not Tailwind convention

**Implementation Approach**:
```html
<!-- Search container with vertical layout -->
<div class="flex flex-col gap-2">
  <input type="text" class="..." />
  <button class="...">Search</button>
</div>
```

---

## Decision 3: Tauri Plugin-Store for Persistence

**Context**: Need to persist (1) scan directories in settings and (2) scrolling mode preferences for all data tables.

**Decision**: Use Tauri's `plugin-store` to save and load preferences. This is a lightweight key-value store that persists to the file system.

**Rationale**:
- Plugin-store is already documented in the constitution as the standard for configuration
- Simple API: `get()`, `set()`, `has()`, `delete()`, `keys()`
- Persists to file system automatically
- No need for additional Rust backend complexity
- Cross-platform (Windows, macOS, Linux)

**Alternatives Considered**:
1. Local file (JSON) - Rejected: Requires manual file I/O, error handling, parsing
2. SQLite database - Rejected: Overkill for simple key-value preferences
3. Angular localStorage - Rejected: Not available in Tauri context, less reliable
4. IndexedDB - Rejected: Browser-specific, not suitable for desktop app

**Implementation Approach**:
```rust
// Rust backend - Tauri commands
#[tauri::command]
async fn get_scan_directories(store: tauri_plugin_store::Store<tauri::State>) -> Result<Vec<String>, String> {
    store.get("scan_directories").unwrap_or_default()
}

#[tauri::command]
async fn save_scan_directories(directories: Vec<String>, store: ...) -> Result<(), String> {
    store.set("scan_directories", directories);
    Ok(())
}
```

```typescript
// Angular service
readonly scanDirectories = signal<string[]>([]);
readonly scrollingMode = signal<ScrollingMode>('table-only');

async loadPreferences() {
  const dirs = await invoke('get_scan_directories');
  this.scanDirectories.set(dirs);

  const mode = await invoke('get_scrolling_mode');
  this.scrollingMode.set(mode || 'table-only');
}

async saveScrollingMode(mode: ScrollingMode) {
  await invoke('save_scrolling_mode', { mode });
  this.scrollingMode.set(mode);
}
```

---

## Decision 4: Table-Only Scrolling Implementation

**Context**: Tables need two scrolling modes: (1) table-only scrolling (default) where only table content scrolls, and (2) full-page scrolling where entire page scrolls. Toggle button switches between modes.

**Decision**: Use Tailwind CSS utility classes combined with Angular component state to control scrolling behavior. Set fixed height on table container with `overflow-y-auto` for table-only mode.

**Rationale**:
- Tailwind's `overflow-y-auto` is the standard approach for container scrolling
- Fixed height with `h-[calc(100vh-...)]` creates scrollable area
- `sticky` positioning for headers keeps them visible during scroll
- Works seamlessly with DaisyUI table styles
- Angular Signals for state management ensures reactivity

**Alternatives Considered**:
1. Virtual scrolling (ngx-virtual-scroller) - Rejected: Overkill, tables aren't massive datasets
2. Custom scrollbar component - Rejected: Unnecessary complexity, browser scrollbars sufficient
3. iframe for table isolation - Rejected: Breaks theme consistency, accessibility issues

**Implementation Approach**:
```html
<!-- Table-only scrolling mode -->
<div [class]="isTableOnlyMode ? 'h-[600px] overflow-y-auto' : ''">
  <table class="...">
    <thead class="sticky top-0 z-10">
      <!-- Table headers remain fixed -->
    </thead>
    <tbody>
      <!-- Scrollable content -->
    </tbody>
  </table>
</div>

<!-- Toggle button -->
<button (click)="toggleScrollingMode()">
  <span *ngIf="isTableOnlyMode">Enable Full Page Scroll</span>
  <span *ngIf="!isTableOnlyMode">Enable Table Scroll</span>
</button>
```

**Component Structure**:
```typescript
export class WeaponsComponent {
  isTableOnlyMode = computed(() =>
    this.scrollingModeService.mode() === 'table-only'
  );

  toggleScrollingMode() {
    const newMode = this.isTableOnlyMode() ? 'full-page' : 'table-only';
    this.scrollingModeService.setMode(newMode);
  }
}
```

---

## Decision 5: Angular Signals for Scroll State

**Context**: Scrolling mode preference needs to be managed as shared state across multiple components (weapons, items, players, servers).

**Decision**: Create a new `ScrollingModeService` that uses Angular Signals for state management, as required by the constitution (Section IV).

**Rationale**:
- Constitution mandates Signal-based state management (not BehaviorSubject)
- Signals provide single source of truth with better performance in Tauri
- Components access signals directly without `toSignal()` wrapper
- Simple and reactive: `readonly mode = signal<ScrollingMode>('table-only')`
- Automatic change detection without Zone overhead

**Alternatives Considered**:
1. BehaviorSubject - Rejected: Violates constitution, creates dual state sources
2. Local component state - Rejected: Doesn't allow persistence or cross-component sharing
3. Redux/NgRx - Rejected: Overkill for simple toggle state

**Implementation Approach**:
```typescript
// src/app/features/shared/services/scrolling-mode.service.ts
import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

export type ScrollingMode = 'table-only' | 'full-page';

@Injectable({ providedIn: 'root' })
export class ScrollingModeService {
  readonly mode = signal<ScrollingMode>('table-only');

  async loadMode() {
    const saved = await invoke<ScrollingMode | null>('get_scrolling_mode');
    this.mode.set(saved || 'table-only');
  }

  async setMode(mode: ScrollingMode) {
    await invoke('save_scrolling_mode', { mode });
    this.mode.set(mode);
  }
}
```

---

## Decision 6: Internationalization (i18n) for New UI Text

**Context**: Toggle button labels and any new status messages need i18n support per Section II of the constitution.

**Decision**: Add translation keys to both `en.json` and `zh.json` for all new UI text. Use Transloco pipes and directives in templates.

**Rationale**:
- Constitution requires runtime translation system (Transloco)
- All user-facing text must have English and Chinese translations
- Runtime switching without application restart is required
- Hierarchical dot notation for key naming (e.g., `scrolling.toggleLabel`)

**Implementation Approach**:
```json
// src/assets/i18n/en.json
{
  "scrolling": {
    "tableOnly": "Table Scroll",
    "fullPage": "Full Page Scroll",
    "toggleTooltip": "Toggle scrolling mode"
  }
}

// src/assets/i18n/zh.json
{
  "scrolling": {
    "tableOnly": "表格滚动",
    "fullPage": "整页滚动",
    "toggleTooltip": "切换滚动模式"
  }
}
```

```html
<button [title]="'scrolling.toggleTooltip' | transloco">
  {{ 'scrolling.' + (isTableOnlyMode ? 'tableOnly' : 'fullPage') | transloco }}
</button>
```

---

## Decision 7: DaisyUI Theme Compatibility

**Context**: All CSS modifications must use DaisyUI CSS variables for color to support light/dark themes per Section III of the constitution.

**Decision**: Use DaisyUI CSS variables for any color-related styling. Avoid fixed hex colors.

**Rationale**:
- Constitution requires theme adaptability
- DaisyUI provides robust theming system
- CSS variables ensure automatic theme switching
- Backgrounds: `oklch(var(--b2))`, `oklch(var(--b3))`
- Text: `oklch(var(--bc))`
- Accents: `oklch(var(--p))`, `oklch(var(--pf))`

**Implementation Approach**:
```html
<!-- Use DaisyUI variables instead of fixed colors -->
<div class="bg-base-200 text-base-content border-base-300">
  <!-- Content automatically adapts to light/dark theme -->
</div>
```

---

## Summary of Technical Decisions

| Decision | Approach | Constitution Compliance |
|----------|----------|------------------------|
| Navigation menu width | Tailwind `w-full` utility | ✅ Desktop-first UI, Tailwind CSS |
| Search bar layout | Tailwind `flex-col` utility | ✅ Desktop-first UI, Tailwind CSS |
| Scan directory persistence | Tauri plugin-store | ✅ Tauri 2.x backend |
| Scrolling mode persistence | Tauri plugin-store | ✅ Tauri 2.x backend |
| Table scrolling behavior | Tailwind `overflow-y-auto` + fixed height | ✅ Desktop-first UI, DaisyUI theme |
| Scroll state management | Angular Signals service | ✅ Signal-based state (Section IV) |
| i18n for new text | Transloco with en.json + zh.json | ✅ Runtime i18n (Section II) |
| Theme compatibility | DaisyUI CSS variables | ✅ Theme adaptability (Section III) |

## Next Steps

1. Implement navigation menu width fix (add `w-full` utility)
2. Update all search components to use vertical flex layout
3. Create `ScrollingModeService` with Angular Signals
4. Add Tauri commands for persistence (scan directories, scrolling mode)
5. Update table components to support two scrolling modes with toggle
6. Add i18n translation keys for new UI text
7. Test with both light and dark DaisyUI themes
8. Document changes in `docs-ai/PROGRESS.md`
