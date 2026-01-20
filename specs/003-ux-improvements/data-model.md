# Data Model: UX Improvements

**Feature**: [spec.md](./spec.md) | **Date**: 2026-01-17

---

## Entities

### Entity: ThemePreference

Represents user's visual theme preference for the application.

**Fields**:
- `themeType`: "light" | "dark" | "auto" - The selected theme ("auto" for OS detection)
- `isAutoDetect`: boolean - Whether to auto-detect from OS theme (derived from themeType)
- `lastUpdated`: timestamp - When the preference was last changed
- `autoDetectedTheme`: "light" | "dark" | null - Actual OS theme when themeType="auto"

**Relationships**:
- One ThemePreference per user application instance
- Stored in Tauri plugin-store

**Validation Rules**:
- themeType must be either "light", "dark", or "auto"
- isAutoDetect must be boolean
- autoDetectedTheme is only set when themeType="auto"

**State Transitions**:
- **Initial**: themeType="auto", autoDetectedTheme=<OS theme>
- **User Selects Manual**: themeType=selected_value, autoDetectedTheme=null
- **User Resets to Auto**: themeType="auto", triggers OS detection

---

### Entity: SystemTheme

Represents the operating system's current theme preference.

**Fields**:
- `themeType`: "light" | "dark" | null - OS-detected theme
- `detectedAt`: timestamp - When detection was performed
- `platform`: "macos" | "windows" | "linux" | "unknown" - OS platform

**Relationships**:
- Used to initialize ThemePreference when themeType="auto"
- Queried once on application startup via Tauri command

**Validation Rules**:
- themeType must be either "light" or "dark" or null
- platform must be a valid OS identifier

**Notes**:
- Query happens once during app initialization
- Fallback to "light" if detection fails

---

### Entity: Weapon (UPDATED 2026-01-17)

Represents a weapon from the game's weapon XML file.

**Fields**:
- `key`: string - Weapon identifier (e.g., "ak47.weapon")
- `name`: string - Display name (e.g., "AK47")
- `tag`: string - Weapon type tag from `<tag name="..."/>` (e.g., "assault", "smg")
- `class`: number - Weapon class from `<specification class="..."/>` (e.g., 0, 1, 2)
- `hudIcon`: string | null - Icon filename from `<hud_icon filename="..."/>` (e.g., "hud_ak47.png")
- `filePath`: string - Full path to weapon XML file
- `sourceFile`: string - Alias for filePath (used in some components)

**Relationships**:
- Many Weapons belong to one ScanDirectory
- Weapons are displayed in Weapons table with virtual scrolling

**Validation Rules**:
- key is required and unique
- name is required
- tag is optional (defaults to empty string)
- class is optional (defaults to 0)
- hudIcon is optional (defaults to null)
- filePath is required

**Critical Note**: `tag` and `class` are **SEPARATE FIELDS**
- `tag` comes from `<tag name="xxx"/>` element
- `class` comes from `<specification class="0"/>` attribute
- DO NOT map tag to class
- Both fields must be displayed in the UI

**Icon Path Resolution**:
- `hudIcon` contains only the filename (e.g., "hud_ak47.png")
- Icon is located in `textures/` folder (sibling to `weapons/` folder)
- Frontend resolves path: `../textures/${hudIcon}` relative to weapon file

**Example XML**:
```xml
<weapon file="base_primary.weapon" key="ak47.weapon">
    <tag name="assault" />
    <specification class="0" name="AK47" ... />
    <hud_icon filename="hud_ak47.png" />
</weapon>
```

**Corresponding TypeScript**:
```typescript
interface Weapon {
    key: string;           // "ak47.weapon"
    name: string;          // "AK47"
    tag: string;           // "assault" (from <tag>)
    class: number;         // 0 (from specification class)
    hudIcon?: string;      // "hud_ak47.png" (from <hud_icon>)
    filePath: string;      // "/path/to/weapons/ak47.weapon"
}
```

---

### Entity: GenericItem (UPDATED 2026-01-17)

Represents an inventory item from the game's item XML file.

**Fields**:
- `key`: string - Item identifier (e.g., "ak47.weapon")
- `name`: string - Display name
- `itemType`: string - Item type (e.g., "weapon", "ammo", "grenade")
- `hudIcon`: string | null - Icon filename from `<hud_icon filename="..."/>`
- `filePath`: string - Full path to item XML file

**Relationships**:
- Many Items belong to one ScanDirectory
- Items are displayed in Items table with virtual scrolling

**Validation Rules**:
- key is required
- name is required
- itemType is required
- hudIcon is optional (defaults to null)
- filePath is required

---

### Entity: VirtualScrollViewport

Configuration for CDK virtual scrolling viewport.

**Fields**:
- `itemSize`: number - Fixed height of each row in pixels (default: 50)
- `bufferSize`: number - Number of extra rows to render outside viewport (default: 10)
- `minBufferPx`: number - Minimum buffer size in pixels (default: 100)
- `maxBufferPx`: number - Maximum buffer size in pixels (default: 1000)

**Validation Rules**:
- itemSize must be positive number
- bufferSize must be positive number

**Notes**:
- Larger buffer = smoother scrolling but higher memory usage
- Tune based on typical row height and viewport size

---

## Data Flow

### Theme Initialization Flow

```
App Startup
    ↓
AppComponent.ngOnInit()
    ↓
ThemeService.initialize()
    ↓
1. Check store for saved ThemePreference
2. If exists, apply it
3. If not, detect OS theme via Tauri command
4. Save as ThemePreference with themeType="auto"
5. Apply theme to document.documentElement
```

### Weapon Data Flow with Icon Resolution

```
User selects scan directory
    ↓
WeaponsService.scanWeapons(directoryPath)
    ↓
Tauri: scan_weapons_command()
    ↓
Rust parser:
1. Walk weapons/ directory
2. Parse each .weapon XML file
3. Extract: key, name, tag, class, hudIcon, filePath
4. Return Weapon[]
    ↓
Frontend:
1. Store in Signal<Weapon[]>
2. For display, resolve icon path:
   - iconPath = `${weaponDir}/../textures/${weapon.hudIcon}`
   - Convert to file:// URL for <img> src
```

### Virtual Scrolling Data Flow

```
Signal<Weapon[]> (weaponsService.filteredWeapons)
    ↓
toObservable(weaponsSignal)
    ↓
Observable<Weapon[]>
    ↓
CDK DataSource (via CdkTable)
    ↓
cdk-virtual-scroll-viewport
    ↓
Only render visible rows + buffer
```
