# Data Model: Tag Column Rename

**Feature**: 005-tag-column-fix
**Date**: 2026-01-18

## Overview

This document describes the data model changes for renaming `classTag` to `tag` in the Weapon interface.

## Weapon Interface Changes

### Before

```typescript
export interface Weapon {
    key?: string;
    name: string;
    classTag: string;      // <-- OLD: Mismatched with Rust
    class?: number;        // Numeric class from <specification class="..."/>
    // ... other fields
}
```

### After

```typescript
export interface Weapon {
    key?: string;
    name: string;
    tag: string;           // <-- NEW: Matches Rust serialization
    class?: number;        // Numeric class from <specification class="..."/>
    // ... other fields
}
```

## Type Changes

### WeaponColumnKey

**Before**:
```typescript
export type WeaponColumnKey =
    | 'image'
    | 'key'
    | 'name'
    | 'classTag'    // <-- OLD
    | 'class'
    // ...
```

**After**:
```typescript
export type WeaponColumnKey =
    | 'image'
    | 'key'
    | 'name'
    | 'tag'         // <-- NEW
    | 'class'
    // ...
```

### AdvancedFilters

**Before**:
```typescript
export interface AdvancedFilters {
    // ...
    classTag?: string;  // <-- OLD
    // ...
}
```

**After**:
```typescript
export interface AdvancedFilters {
    // ...
    tag?: string;       // <-- NEW
    // ...
}
```

## Field Mapping

| Source | Field Name | Type | Description |
|--------|-----------|------|-------------|
| XML: `<tag name="assault"/>` | `tag` | `string` | Weapon category (assault, smg, sniper, etc.) |
| XML: `<specification class="0"/>` | `class` | `number` | Numeric class value (0, 1, 2, etc.) |

## Validation Rules

No new validation rules. The field remains:
- Required (non-optional string)
- Parsed from `<tag name="..."/>` XML element
- Used for filtering and sorting

## State Transitions

No state transitions. This is a pure field rename.

## Relationships

The `tag` field has no direct relationships to other entities. It is used in:
- Column visibility (localStorage)
- Advanced search filters
- Sorting

## Backwards Compatibility

**Breaking Change**: This is a data model breaking change, but acceptable because:
1. Current implementation is broken (data doesn't display)
2. Migration path exists for localStorage preferences
3. No external API contracts to maintain
