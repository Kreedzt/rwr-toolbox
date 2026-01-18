# Research: Tag Column Rename and Data Reading Fix

**Feature**: 005-tag-column-fix
**Date**: 2026-01-18

## Problem Statement

Weapon tag values (e.g., "assault", "smg", "sniper") are not displaying correctly in the Weapons table. The user also finds the "Class Tag" label confusing alongside the separate "Class" numeric column.

## Root Cause Analysis

### Field Name Mismatch

**Rust Backend** (`src-tauri/src/weapons.rs`):
```rust
#[serde(rename = "tag")]
pub tag: String,
```
- Serializes to JSON as `"tag": "assault"`

**TypeScript Frontend** (`src/app/shared/models/weapons.models.ts`):
```typescript
classTag: string;
```
- Expects JSON field `"classTag": "assault"`

**Result**: Data loss - the `tag` field from Rust is ignored by TypeScript deserialization, so the `classTag` field remains `undefined`.

### Why This Happened

In Feature 004, the column was split into two:
- "Class Tag" - for weapon category (assault, smg, etc.)
- "Class" - for numeric class value (0, 1, 2, etc.)

The TypeScript field was named `classTag` to distinguish from `class`, but this didn't account for the existing Rust serialization.

## Decision: Align TypeScript with Rust

### Chosen Approach

Rename `Weapon.classTag` to `Weapon.tag` in TypeScript to match Rust serialization.

**Rationale**:
1. **Semantic correctness**: The XML element is `<tag name="..."/>`, so `tag` is the correct name
2. **Simplicity**: Single field rename vs. changing Rust serialization + XML parsing
3. **User request**: User explicitly wants "Tag" not "Class Tag" label
4. **No Rust changes**: Rust code is already correct

### Alternatives Considered

| Alternative | Why Rejected |
|------------|--------------|
| Change Rust to serialize as `classTag` | XML element is `<tag/>`, so `classTag` is semantically incorrect |
| Add alias mapping in TypeScript | Adds unnecessary complexity for a simple field rename |
| Use `@JsonProperty` decorator | Angular/TypeScript doesn't use Jackson annotations |

## Migration Strategy

### localStorage Column Visibility

Users who have customized column visibility have saved preferences with key `classTag`. We need to migrate these to `tag`.

**Implementation** (in `weapons.component.ts` constructor):
```typescript
// Load and migrate column visibility
const saved = this.weaponService.getColumnVisibility();
const migrated = saved.map(col => {
  if (col.columnId === 'classTag') {
    return { ...col, columnId: 'tag' };
  }
  return col;
});
this.weaponService.setColumnVisibility(migrated);
```

### i18n Key Migration

Old key: `weapons.columns.classTag`
New key: `weapons.columns.tag`

Both need to be added to maintain backwards compatibility temporarily, or we do a clean break since this is a bug fix.

**Decision**: Clean break - rename the key. Users who haven't customized columns won't notice. Users who have will get migrated preferences.

## Implementation Order

1. Update TypeScript models (weapons.models.ts) - foundational
2. Update column configuration (weapon-columns.ts) - depends on models
3. Update component logic (weapons.component.ts) - includes migration
4. Update HTML template (weapons.component.html) - UI bindings
5. Update i18n files (en.json, zh.json) - final step for labels

## Testing Considerations

- **Data accuracy**: Verify tag values display correctly after fix
- **Migration**: Verify existing column visibility preferences are preserved
- **Filtering**: Verify tag filter in advanced search still works
- **Sorting**: Verify column sorting works correctly

## Conclusion

This is a straightforward bug fix with clear solution path. The field name mismatch is the sole cause of data display issues, and the fix aligns TypeScript with Rust's already-correct serialization.
