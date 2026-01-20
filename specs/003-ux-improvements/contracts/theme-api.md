# ThemeService API Contract

**Feature**: 003-ux-improvements | **Date**: 2026-01-16

---

## Overview

This document defines the API contract for the enhanced `ThemeService` that manages theme preferences with automatic OS theme detection support.

---

## Service Interface

### Class: ThemeService

**Location**: `src/app/shared/services/theme.service.ts`

**Dependencies**:
- `@angular/core`: `Injectable`, `signal`, `computed`
- `@tauri-apps/api/core`: `invoke`

---

## Public API

### Properties (Signals)

#### `readonly theme: Signal<ThemePreference>`

**Description**: Read-only signal containing the current theme preference state.

**Type**:
```typescript
interface ThemePreference {
    themeType: 'light' | 'dark' | 'auto';
    isAutoDetect: boolean;
    lastUpdated: number;
    autoDetectedTheme?: 'light' | 'dark' | null;
}
```

**Reactive**: Yes - Components using this signal will update when theme changes

**Example Usage**:
```typescript
// In component
readonly theme = this.themeService.theme;
readonly isDark = computed(() => this.theme().themeType === 'dark');
```

---

#### `readonly isDarkTheme: Signal<boolean>`

**Description**: Computed signal that returns `true` if current theme is dark (including auto-detected dark theme).

**Type**: `Signal<boolean>`

**Computation Logic**:
```typescript
computed(() => {
    const pref = this.theme();
    if (pref.themeType === 'dark') return true;
    if (pref.themeType === 'auto' && pref.autoDetectedTheme === 'dark') return true;
    return false;
})
```

---

### Methods

#### `async initialize(): Promise<void>`

**Description**: Initialize theme service on application startup. Loads persisted preference or detects system theme.

**Behavior**:
1. Attempt to load `ThemePreference` from Tauri store via `get_theme_preference` command
2. If found:
   - Update `themeSig` with loaded preference
   - Apply theme to DOM
3. If not found:
   - Call `detectAndApplySystemTheme()`
   - Set as initial preference with `isAutoDetect: true`

**Throws**: None (errors logged to console, defaults to light theme)

**Example Usage**:
```typescript
// In app.component.ts
ngOnInit() {
    await this.themeService.initialize();
}
```

---

#### `async setTheme(themeType: 'light' | 'dark' | 'auto'): Promise<void>`

**Description**: Set the theme preference.

**Parameters**:
- `themeType`: The theme to apply

**Behavior**:
- If `themeType === 'auto'`:
  - Detect system theme via `get_system_theme` command
  - Create `ThemePreference` with `isAutoDetect: true`
  - Store detected theme in `autoDetectedTheme`
- If `themeType === 'light' | 'dark'`:
  - Create `ThemePreference` with `isAutoDetect: false`
  - Apply specified theme directly
- Update `themeSig` signal
- Persist to Tauri store via `set_theme_preference` command
- Apply theme to DOM via `applyTheme()`

**Example Usage**:
```typescript
// User selects "Auto" from dropdown
await this.themeService.setTheme('auto');

// User selects "Dark" from dropdown
await this.themeService.setTheme('dark');
```

---

### Private Methods (Implementation Details)

#### `private async detectAndApplySystemTheme(): Promise<void>`

**Description**: Detect OS theme and apply it as current theme.

**Behavior**:
1. Call `get_system_theme` Tauri command
2. Create `ThemePreference` with detected theme
3. Update `themeSig` signal
4. Persist to store
5. Apply to DOM
6. If detection fails, default to `light` theme

---

#### `private applyTheme(themeType: 'light' | 'dark'): void`

**Description**: Apply theme to DOM.

**Behavior**:
- If `themeType === 'dark'`:
  - Set `data-theme="dark"` attribute on `document.documentElement`
- If `themeType === 'light'`:
  - Remove `data-theme` attribute from `document.documentElement`

**DaisyUI Integration**:
- DaisyUI reads `data-theme` attribute to switch themes
- All components using DaisyUI CSS variables will automatically update

---

## Tauri Commands (Rust Backend)

### Command: `get_theme_preference`

**Signature**:
```rust
#[tauri::command]
async fn get_theme_preference(store: Store<'_>) -> Result<ThemePreference, String>
```

**Returns**: `ThemePreference` object or `null` if not found

**Store Key**: `theme_preference`

---

### Command: `set_theme_preference`

**Signature**:
```rust
#[tauri::command]
async fn set_theme_preference(store: Store<'_>, preference: ThemePreference) -> Result<(), String>
```

**Parameters**:
- `preference`: `ThemePreference` object to persist

**Store Key**: `theme_preference`

---

### Command: `get_system_theme`

**Signature**:
```rust
#[tauri::command]
async fn get_system_theme() -> Result<SystemTheme, String>
```

**Returns**:
```rust
struct SystemTheme {
    theme_type: Option<String>, // "light" or "dark" or null
    detected_at: u64,           // Unix timestamp
    platform: String,           // "macos", "windows", "linux", or "unknown"
}
```

**Platform-Specific Implementation**:

**macOS**:
```rust
use std::process::Command;

let output = Command::new("defaults")
    .args(&["read", "-g", "AppleInterfaceStyle"])
    .output();

match output {
    Ok(out) if out.stdout.contains(b"Dark") => Some("dark".to_string()),
    _ => Some("light".to_string()),
}
```

**Windows**:
```rust
// Read registry key
// HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize
// AppsUseLightTheme: 0 = dark, 1 = light
// (Use windows-rs crate)
```

**Linux (GNOME)**:
```rust
use std::process::Command;

let output = Command::new("gsettings")
    .args(&["get", "org.gnome.desktop.interface", "gtk-theme"])
    .output();

// Parse output for "dark" in theme name
```

**Fallback**: Return `light` theme if detection fails

---

## Data Structures

### ThemePreference (TypeScript)

```typescript
export interface ThemePreference {
    /** User's selected theme: 'light', 'dark', or 'auto' for OS detection */
    themeType: 'light' | 'dark' | 'auto';

    /** Whether theme was auto-detected from OS */
    isAutoDetect: boolean;

    /** Unix timestamp of last update */
    lastUpdated: number;

    /** Actual detected OS theme (only set when themeType='auto') */
    autoDetectedTheme?: 'light' | 'dark' | null;
}
```

### SystemTheme (Rust/TypeScript)

```typescript
export interface SystemTheme {
    /** Detected OS theme: 'light', 'dark', or null if detection failed */
    themeType: 'light' | 'dark' | null;

    /** Unix timestamp when detection was performed */
    detectedAt: number;

    /** Platform where theme was detected */
    platform: 'macos' | 'windows' | 'linux' | 'unknown';
}
```

---

## Usage Examples

### In Component (Settings)

```typescript
export class SettingsComponent {
    private themeService = inject(ThemeService);

    readonly theme = this.themeService.theme;
    readonly isDark = this.themeService.isDarkTheme;

    async onThemeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const newTheme = select.value as 'light' | 'dark' | 'auto';
        await this.themeService.setTheme(newTheme);
    }

    get currentTheme(): 'light' | 'dark' | 'auto' {
        return this.theme().themeType;
    }
}
```

### In Component Template

```html
<select (change)="onThemeChange($event)">
    <option value="auto" [selected]="currentTheme === 'auto'">
        {{ 'settings.themeAuto' | transloco }}
    </option>
    <option value="light" [selected]="currentTheme === 'light'">
        {{ 'settings.themeLight' | transloco }}
    </option>
    <option value="dark" [selected]="currentTheme === 'dark'">
        {{ 'settings.themeDark' | transloco }}
    </option>
</select>
```

### In App Initialization

```typescript
export class AppComponent implements OnInit {
    private themeService = inject(ThemeService);

    async ngOnInit() {
        // Initialize theme on startup
        await this.themeService.initialize();
    }
}
```

---

## Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Tauri store not accessible | Log error; default to `light` theme |
| `get_system_theme` command fails | Log error; default to `light` theme |
| Invalid theme preference loaded | Log warning; reset to `auto` with system detection |
| DOM manipulation fails | Log error; theme may not apply visually |

---

## Testing Considerations

### Unit Tests

- Mock Tauri `invoke` function
- Test `setTheme()` with each theme type
- Test `initialize()` with/without stored preference
- Test `isDarkTheme` computed signal logic

### Integration Tests

- Test theme switching in actual Tauri environment
- Test persistence across app restarts
- Test OS theme detection on each platform

### Manual Tests

- Verify theme applies to all components
- Verify theme persists across restarts
- Verify auto-detection works on macOS/Windows/Linux
- Verify no layout shifts when switching themes

---

## Migration Notes

### From Existing ThemeService

The existing `ThemeService` already has:
- ✅ Signal-based state (`themeSig`)
- ✅ `setTheme()` method
- ✅ `initialize()` method
- ✅ Integration with Tauri commands
- ✅ `applyTheme()` DOM manipulation

**Required Changes**:
1. Update `ThemePreference` interface to include `'auto'` option
2. Update `setTheme()` to handle `'auto'` parameter
3. Add `get_system_theme` command to Rust backend
4. Add `autoDetectedTheme` property to track OS detection result

---

## References

- [Constitution](../../../.specify/memory/constitution.md) - Principle III: Theme Adaptability
- [Data Model](./data-model.md) - ThemePreference entity definition
- [Research](./research.md) - Decision 2: OS Theme Detection Approach
