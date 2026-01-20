# Weapon Parser Enhancement Contract

**Feature**: 003-ux-improvements
**Date**: 2026-01-17
**Status**: Draft

---

## Overview

This contract defines the enhanced weapon XML parser requirements to fix three critical issues:
1. Extract `hud_icon` element for icon display
2. Preserve `class` attribute as separate field from `tag`
3. Maintain backward compatibility with existing weapon data

---

## Rust API Contract

### Input: Weapon XML File Path

**Type**: `String` (file path)
**Example**: `"/path/to/game/weapons/ak47.weapon`

### Output: Enhanced Weapon Object

**Type**: `Weapon` (Rust struct)

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Weapon {
    // Existing fields
    pub key: String,
    pub name: String,

    // CRITICAL FIX: tag and class are SEPARATE fields
    pub tag: String,           // From <tag name="..."/> element
    pub class: i32,            // From <specification class="..."/> attribute

    // NEW: Extract icon information
    pub hud_icon: Option<String>,  // From <hud_icon filename="..."/> element

    // Existing fields
    pub file_path: String,
    pub magazine_size: Option<i32>,
    pub damage: Option<f32>,
    pub fire_rate: Option<f32>,
    // ... other fields
}
```

### XML Parsing Requirements

#### 1. Extract Tag Element

**XPath**: `/weapon/tag/@name`

**Example XML**:
```xml
<weapon file="base_primary.weapon" key="ak47.weapon">
    <tag name="assault" />
    ...
</weapon>
```

**Expected Output**:
```rust
weapon.tag = "assault".to_string();
```

**Validation**:
- Tag is optional (default to empty string if missing)
- If multiple tag elements exist, use the first one

#### 2. Extract Class Attribute

**XPath**: `/weapon/specification/@class`

**Example XML**:
```xml
<weapon file="base_primary.weapon" key="ak47.weapon">
    <specification
        class="0"
        name="AK47"
        ... />
    ...
</weapon>
```

**Expected Output**:
```rust
weapon.class = 0;  // as i32, not i64
```

**Validation**:
- Class is optional (default to 0 if missing)
- Parse as i32 (32-bit integer)
- DO NOT map to tag - this is a separate field

#### 3. Extract HUD Icon Element

**XPath**: `/weapon/hud_icon/@filename`

**Example XML**:
```xml
<weapon file="base_primary.weapon" key="ak47.weapon">
    ...
    <hud_icon filename="hud_ak47.png" />
</weapon>
```

**Expected Output**:
```rust
weapon.hud_icon = Some("hud_ak47.png".to_string());
```

**Validation**:
- hud_icon is optional (default to None if missing)
- Store only the filename, not the full path
- Path resolution happens in frontend

---

## TypeScript Interface Contract

### Weapon Model (Frontend)

```typescript
export interface Weapon {
    // Existing fields
    key: string;
    name: string;

    // CRITICAL: Separate fields - DO NOT map tag to class
    tag: string;           // e.g., "assault", "smg", "sniper"
    class: number;         // e.g., 0, 1, 2 (numeric value)

    // NEW: Icon filename
    hudIcon?: string;      // e.g., "hud_ak47.png"

    // Existing fields
    filePath: string;
    sourceFile: string;
    magazineSize?: number;
    damage?: number;
    fireRate?: number;
    // ... other fields
}
```

### Validation Rules

1. **Tag vs Class Separation**:
   - `tag` MUST be a string value from `<tag name="..."/>`
   - `class` MUST be a numeric value from `<specification class="..."/>`
   - These are TWO DIFFERENT FIELDS
   - DO NOT map one to the other

2. **Icon Filename**:
   - `hudIcon` contains only the filename (e.g., "hud_ak47.png")
   - Does NOT include full path
   - Does NOT include "textures/" prefix
   - Frontend resolves the full path

---

## Frontend Path Resolution Contract

### Function: getIconPath

**Input**:
- `weapon`: Weapon object
- `weapon.filePath`: Full path to weapon XML file (e.g., "/game/weapons/ak47.weapon")

**Output**:
- Resolved path to icon file (e.g., "/game/textures/hud_ak47.png")

**Algorithm**:
```typescript
function getIconPath(weapon: Weapon): string {
    if (!weapon.hudIcon) return '';

    // 1. Get weapon directory from file path
    const weaponDir = weapon.filePath.split(/[\/\\]/).slice(0, -1).join('/');
    // "/game/weapons"

    // 2. Navigate to textures folder (sibling to weapons)
    const iconPath = `${weaponDir}/../textures/${weapon.hudIcon}`;
    // "/game/textures/hud_ak47.png"

    return iconPath;
}
```

---

## Tauri Command Contract

### Command: get_resource_url

**Purpose**: Convert relative file path to file:// URL for Tauri asset loading

**Input**:
```rust
pub struct ResourcePathRequest {
    pub relative_path: String,
}
```

**Output**:
```rust
pub struct ResourceUrlResponse {
    pub url: String,  // e.g., "file:///game/textures/hud_ak47.png"
}
```

**Error Handling**:
- Return error if path does not exist
- Return error if path cannot be canonicalized
- Frontend should handle errors gracefully with fallback icon

---

## Test Cases

### Test Case 1: Extract All Fields

**Input**: ak47.weapon with all fields present

**Expected Output**:
```rust
Weapon {
    key: "ak47.weapon",
    name: "AK47",
    tag: "assault",
    class: 0,
    hud_icon: Some("hud_ak47.png"),
    ...
}
```

### Test Case 2: Missing Optional Fields

**Input**: weapon with no hud_icon element

**Expected Output**:
```rust
Weapon {
    key: "some.weapon",
    name: "Some Weapon",
    tag: "",           // empty if missing
    class: 0,          // default if missing
    hud_icon: None,    // None if missing
    ...
}
```

### Test Case 3: Tag and Class Separation

**Input**: Weapon with tag="assault" and class="0"

**Expected Output**:
```rust
Weapon {
    tag: "assault",  // NOT mapped to class
    class: 0,       // Preserved as numeric value
    // Both fields present independently
}
```

---

## Migration Notes

### Breaking Changes

**Frontend**:
- `Weapon` interface now includes `hudIcon?: string`
- `Weapon` interface now requires `class: number` (was optional)
- `tag` and `class` are now confirmed as separate fields

**Backend**:
- Rust parser now extracts `hud_icon` element
- Rust parser preserves `class` attribute as i32
- No changes to existing weapon file parsing logic (additions only)

### Backward Compatibility

**Rust**:
- Existing weapon files without `hud_icon` will have `hud_icon: None`
- Existing weapon files without `class` will default to `class = 0`
- No changes to directory scanning logic

**Frontend**:
- Components must handle `hudIcon` being `undefined`
- Components must display both `tag` and `class` columns
- Existing icon display logic must be updated to use new path resolution
