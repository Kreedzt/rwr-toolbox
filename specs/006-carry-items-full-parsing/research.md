# Research: Full Carry Items Parsing with Extended Attributes

**Feature**: 006-carry-items-full-parsing
**Date**: 2025-01-19
**Status**: Complete

## Overview

This research document captures technical decisions made for implementing full carry_items parsing with extended attributes (capacity, commonness, modifiers). All clarifications from Technical Context have been resolved through codebase analysis and constitutional review.

## Technical Decisions

### Decision 1: Multi-Item File Parsing Approach

**Problem**: Files like `vest2.carry_item` contain 15+ `<carry_item>` elements under `<carry_items>` root, but current parser only extracts the first item using `.first()`.

**Research Findings**:
- Current `items.rs` has `RawCarryItemsRoot` struct with `items: Vec<RawCarryItem>` - already supports multiple items
- The `parse_carry_item()` function returns `Result<Item, String>` and calls `raw_root.items.first()`
- Need to change signature to return `Vec<Item>` and iterate over all items

**Decision**: Refactor `parse_carry_item()` to return `Vec<Item>` instead of single `Item`, processing all items in the vector.

**Rationale**:
- Maintains existing XML structure (no changes to quick-xml parsing)
- Minimal code changes - just iterate instead of calling `.first()`
- Each item gets parsed with same file_path, package_name, source_file
- Aligns with how `parse_visual_item()` already works (single item per file)

**Alternatives Considered**:
- Create separate function for multi-item parsing: Rejected because adds duplication
- Change Item to contain sub-items: Rejected because breaks existing table model (each row = one item)

### Decision 2: Extended Attribute Data Structure

**Problem**: Need to add capacity, commonness (full), and modifier (full) data to GenericItem interface.

**Research Findings**:
- Current `items.rs` already extracts partial commonness (`can_respawn_with`, `in_stock`) and modifiers (as `ItemModifier` struct)
- Current `RawCapacity` and `RawCommonness` structs exist but only partial fields are used
- Current `ItemModifier` struct has all fields but needs to be kept in final Item

**Decision**: Extend `Item` struct in Rust and `GenericItem` interface in TypeScript to include:
- Full `ItemCapacity` struct (value, source, source_value)
- Full `ItemCommonness` struct (value, in_stock, can_respawn_with)
- Keep existing `modifiers: Option<Vec<ItemModifier>>`

**Rationale**:
- Reuses existing `RawCapacity`, `RawCommonness`, and `ItemModifier` structs
- Maintains parity between Rust backend and TypeScript frontend
- Option types handle missing data gracefully (some items have no capacity/commonness)

**Alternatives Considered**:
- Flatten fields into Item struct: Rejected because loses semantic grouping
- Create separate DTO for extended attributes: Rejected because adds unnecessary complexity

### Decision 3: Modifier Display Format in Table

**Problem**: Modifiers are complex (5+ fields each) and items can have 10+ modifiers. How to display in table?

**Research Findings**:
- Existing Items table uses simple text rendering for string fields
- Weapons table doesn't have a comparable complex field (stances are in detail modal, not table)
- DaisyUI table classes support truncation and badges

**Decision**: Display modifiers as a compact string summary: "count × (class1, class2, ...)" with tooltip showing full details. For example:
- Table cell: "5 × (projectile_blast_result, projectile_hit_result, ...)"
- Tooltip: Full list with all modifier details (class, value, states)

**Rationale**:
- Provides visibility without overwhelming table layout
- Follows pattern of other complex data (stances in weapons use modal details)
- Counts help users quickly scan item complexity
- Truncation with ellipsis prevents long modifier names from breaking layout

**Alternatives Considered**:
- Show all modifiers inline: Rejected because 10+ modifiers would break table layout
- Badge tags for each modifier: Rejected because too much visual noise, badges better for categories
- Expandable rows: Rejected because adds significant complexity to table component

### Decision 4: Column Layout for New Attributes

**Problem**: 5-10 new columns need to fit in 800×600 minimum resolution with horizontal scroll.

**Research Findings**:
- Current Items table has: key, name, itemType, slot, encumbrance, price, filePath (7 columns)
- New attributes needed: capacityValue, capacitySource, commonnessValue, inStock, canRespawnWith, modifiers (6 columns)
- Existing pattern: weapons table uses sticky left columns (image, key, name) with scrollable middle columns

**Decision**:
- Keep existing sticky columns: image, key, name (3 columns, ~300px total)
- Add new columns to scrollable area with widths:
  - capacityValue: 80px (small numeric)
  - capacitySource: 80px (short enum)
  - commonnessValue: 100px (numeric)
  - inStock: 60px (boolean/icon)
  - canRespawnWith: 80px (boolean/icon)
  - modifiers: 200px+ (flex, can grow)
- Users can toggle column visibility (existing feature)

**Rationale**:
- Follows established pattern from weapons table
- Horizontal scroll is acceptable for data-heavy tables at 800×600
- Column visibility feature allows users to hide columns they don't need
- Smaller columns for numeric/boolean data, larger for text content

**Alternatives Considered**:
- Combine capacity value+source into one column: Rejected because loses sortability
- Use icons for boolean fields: Rejected because adds new icons, text is clearer
- Remove existing columns to fit new ones: Rejected because existing data is important

## Dependencies

### Internal Dependencies
- `items.rs` module structure (already exists)
- `GenericItem` interface in items.models.ts (already exists)
- Items table component with column visibility feature (already exists)
- i18n keys structure in en.json/zh.json (already exists)

### External Dependencies
- quick-xml 0.37: Already used, no version change needed
- serde 1: Already used, no version change needed
- Angular Signals v20: Already used, no version change needed
- Transloco: Already used, no version change needed

## Best Practices Applied

### Rust Backend
1. **Iterator Pattern**: Use `iter()` and `map()` for transforming all items in a file
2. **Option Types**: Use `Option<T>` for nullable fields (capacity, commonness, modifiers)
3. **Error Handling**: Collect parse errors per-item without failing entire file scan
4. **serde Rename**: Use `#[serde(rename = "...")]` for camelCase JSON serialization

### Angular Frontend
1. **Signals Pattern**: Store extended attributes in signals, not BehaviorSubject
2. **Column Visibility**: Add new columns to existing toggle feature
3. **i18n First**: All new labels use translation keys, no hardcoded text
4. **Type Safety**: Extend `GenericItem` interface, don't use `any` type

### Performance
1. **Lazy Parsing**: Only parse extended attributes when needed (deferred)
2. **Memoization**: Use Angular `computed()` for derived display values
3. **Virtual Scrolling**: Leverage existing CDK virtual scroll (if applicable to items)

## Open Questions (All Resolved)

**Q1: Should we parse visual_item files for multi-item definitions?**
- **Answer**: No, out of scope per spec. visual_item files typically have one item per file.
- **Rationale**: Focus on carry_item which has confirmed multi-item files (vest2.carry_item)

**Q2: How to handle duplicate keys from the same file?**
- **Answer**: Flag as warning in scan errors, still include all items in results
- **Rationale**: Existing duplicate detection for items across files, extend to within-file duplicates

**Q3: Should modifiers be filterable/searchable?**
- **Answer**: No, basic display only. Advanced filtering is out of scope per spec.
- **Rationale**: Keep initial implementation simple, add filtering in future if needed

## Summary

All technical clarifications resolved. The implementation follows existing patterns in the codebase and complies with all constitutional requirements. No new dependencies or architectural changes needed.
