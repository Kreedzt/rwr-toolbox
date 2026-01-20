# Feature Specification: Full Carry Items Parsing with Extended Attributes

**Feature Branch**: `006-carry-items-full-parsing`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "见 @docs-ai/rwr/vest2.carry_item , 我们对于 carry_item 的解析存在一个文件定义多个 carry_item 项, 这里的 `<carry_items>` 标签会存在包含多个的情况, 解析时要一并解析, 并且我们的 modifier, commonness, capacity, 这些标签属性都很重要, 都需要渲染在前端表格中,"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Items from Multi-Item Files (Priority: P1)

A game data analyst is reviewing the Items table and wants to see all carry items defined in the game, including those from files that contain multiple item definitions. Currently, some items are missing because only the first item from each file is being parsed.

**Why this priority**: This is critical for data completeness. Users cannot get accurate inventory statistics or find specific items if a significant portion of items are not being displayed. This directly impacts the core value proposition of the toolbox - providing complete visibility into game data.

**Independent Test**: Can be tested by scanning the game directory and verifying that all items from the `vest2.carry_item` file (which contains 15+ item definitions) appear in the Items table. The file path should remain the same for all items from the same file, but each item should have its unique key and name displayed.

**Acceptance Scenarios**:

1. **Given** the user has scanned a game directory that includes files with multiple carry_item definitions, **When** the Items table is displayed, **Then** all items from each file should be listed as separate rows with unique keys
2. **Given** a file like `vest2.carry_item` containing 15 item definitions, **When** scanned, **Then** 15 separate items should appear in the Items table, each with its own key (e.g., "Health, 150%", "Health, 140%", etc.)
3. **Given** multiple items from the same file, **When** viewing their file paths, **Then** all items from the same file should show identical file_path values

---

### User Story 2 - View Item Capacity and Commonness Details (Priority: P2)

A game modder wants to understand item spawning behavior and inventory requirements. They need to see the capacity requirements (rank needed to spawn) and commonness values (spawn rate, stock availability, respawability) for each item directly in the Items table without opening individual item details.

**Why this priority**: Important for game balance analysis and modding workflow. While not blocking initial functionality, this information is frequently referenced and should be readily available in the table view to improve productivity.

**Independent Test**: Can be tested by scanning items and verifying that new columns for capacity value/source and commonness attributes are visible and populated correctly in the Items table.

**Acceptance Scenarios**:

1. **Given** the Items table is displayed, **When** the user views the columns, **Then** capacity value and source should be displayed as separate columns
2. **Given** an item with commonness data, **When** displayed in the table, **Then** the commonness value, in_stock status, and can_respawn_with status should be shown
3. **Given** an item without capacity or commonness data (e.g., visual_item), **When** displayed, **Then** these columns should show empty/hyphen values without breaking the layout

---

### User Story 3 - View Item Modifiers in Table (Priority: P3)

A game designer is analyzing how items affect player character states and wants to see item modifiers (state changes, hit probability adjustments) directly in the table view. This helps quickly identify items that provide specific gameplay effects without opening each item's details.

**Why this priority**: Useful for advanced analysis but less critical than basic item visibility. The modifier information is complex and may require special display handling (e.g., expandable rows or compact representation), making it lower priority for initial implementation.

**Independent Test**: Can be tested by verifying that item modifiers are displayed in a user-friendly format within the table, either as a comma-separated list, badge tags, or through a detail expansion mechanism.

**Acceptance Scenarios**:

1. **Given** an item with modifiers (e.g., vest items), **When** displayed in the table, **Then** modifier information should be visible in a compact format
2. **Given** an item with multiple modifiers, **When** displayed, **Then** all modifiers should be represented (either fully displayed or with a count indicator)
3. **Given** items without modifiers, **When** displayed, **Then** the modifier column should show empty/hyphen without breaking layout

---

### Edge Cases

- What happens when a carry_item file is empty (no items defined)?
- What happens when an item has duplicate keys within the same file?
- How does the system handle items with missing optional attributes (no capacity, no modifiers)?
- What happens when modifier values contain special characters or are very long?
- How does the table display handle items with an unusually large number of modifiers (10+)?
- What happens when the file path is extremely long - does it break the table layout?
- What happens when `transform_on_consume` references a non-existent item key?
- How should the system handle items with invalid `time_to_live_out_in_the_open` values (negative numbers, text)?
- What is the default display when `draggable` attribute is missing from the XML? (defaults to false/not draggable)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST parse ALL `<carry_item>` elements from a single `.carry_item` file, not just the first one
- **FR-002**: The system MUST preserve the file path for all items parsed from the same file (multiple items can share the same source file)
- **FR-003**: The system MUST extract and store capacity attributes: `value`, `source`, and `source_value` for each item
- **FR-004**: The system MUST extract and store commonness attributes: `value`, `in_stock`, and `can_respawn_with` for each item
- **FR-005**: The system MUST extract and store all modifier elements for each item, including: `modifier_class`, `value`, `input_character_state`, `output_character_state`, and `consumes_item`
- **FR-006**: The system MUST extract and store additional carry item attributes: `transform_on_consume`, `time_to_live_out_in_the_open`, and `draggable` for each item
- **FR-007**: The Items table MUST display capacity value and source as separate columns
- **FR-008**: The Items table MUST display commonness value, in_stock status, and can_respawn_with status
- **FR-009**: The Items table MUST display modifier information in a user-friendly format
- **FR-010**: The Items table MUST support configurable columns for `transform_on_consume`, `time_to_live_out_in_the_open`, and `draggable` (user can toggle visibility)
- **FR-011**: The system MUST handle items without capacity/commonness/modifiers/additional attributes gracefully (display as empty/hyphen)
- **FR-012**: When duplicate keys are detected across items from the same file, the system MUST flag them in the scan errors
- **FR-013**: The item detail modal MUST display capacity attributes (value, source) in a table format
- **FR-014**: The item detail modal MUST display commonness attributes (value, in_stock, can_respawn_with) in a table format with badge-styled boolean states
- **FR-015**: The item detail modal MUST list each modifier as a separate row showing modifier_class, value, and state transitions
- **FR-016**: The item detail modal MUST display additional carry item attributes (transform_on_consume, time_to_live_out_in_the_open, draggable) in the specifications section

### Key Entities

- **Carry Item**: Represents a single carryable game item with key attributes (name, slot, type, encumbrance, price), capacity information (rank requirement, source), commonness data (spawn rate, availability), gameplay modifiers (state changes, probability adjustments), and additional behavioral attributes (transform_on_consume: what item/state this transforms to when consumed, time_to_live_out_in_the_open: survival time in seconds after being dropped, draggable: whether the item can be dragged by players)
- **Item Modifier**: Represents a gameplay effect modifier with class type, optional numeric value, state transitions (input/output), and consumption flag
- **Item Capacity**: Represents spawning rank requirements including the numeric capacity value, the source (e.g., "rank"), and source value
- **Item Commonness**: Represents spawn frequency settings including the spawn probability value, whether the item is in stock, and whether it can be respawned with

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When scanning a directory, 100% of items defined in multi-item files are correctly parsed and displayed in the Items table
- **SC-002**: Users can view all extended attributes (capacity, commonness, modifiers) directly in the table without opening item details
- **SC-003**: Items from the same source file are correctly identified by matching file_path values
- **SC-004**: Table rendering performance remains acceptable (< 2 seconds) when displaying 500+ items with extended attributes
- **SC-005**: Zero data loss - no items are omitted from the results due to multi-item file parsing limitations
- **SC-006**: 100% of additional carry item attributes (transform_on_consume, time_to_live_out_in_the_open, draggable) are correctly parsed and stored
- **SC-007**: Configurable columns for transform_on_consume, time_to_live_out_in_the_open, and draggable are toggleable via column selector
- **SC-008**: Items with missing additional attributes display gracefully (empty/hyphen) without breaking the table layout

## Assumptions

1. The current XML parsing structure (`RawCarryItemsRoot` with `Vec<RawCarryItem>`) already supports multiple items but the parsing logic only uses the first item
2. Items that share a file path should all be scanned and indexed separately by their unique keys
3. The modifier display format in the table should be compact - either a summary (count + first few) or expandable detail view
4. Capacity, commonness, and modifiers are optional attributes - not all items will have them
5. The current Items table column visibility feature should extend to the new columns

## Out of Scope

- Editing or modifying carry_item files
- Visual item parsing enhancements (this feature focuses on carry_item)
- Advanced filtering/search on the new attributes (basic display only)
- Export/import of item data with extended attributes
- Performance optimization beyond acceptable table rendering times

---

## Clarifications

### Session 2025-01-19

- **Q**: How should item modifiers be displayed in the item detail modal (similar to weapon details)? → **A**: List each modifier as a separate row with badge-styled states, showing modifier_class, value, and state transitions in a detailed table format (following the weapon detail modal pattern)
- **Q**: How should additional carry item attributes (transform_on_consume, time_to_live_out_in_the_open, draggable) be handled? → **A**: Parse and store all 3 attributes; add them as configurable columns (user can toggle visibility via column selector). These attributes represent: item transformation on consumption (e.g., "Health, 130%"), survival time after being dropped in seconds, and whether the item can be dragged by players.
- **Q**: What edge cases should be documented for the new attributes? → **A**: Add edge cases for: transform_on_consume referencing non-existent keys, invalid time_to_live_out_in_the_open values, and missing draggable defaulting to false
- **Q**: Should success criteria be added for the new attributes? → **A**: Yes - add SC-006 (100% parsing accuracy), SC-007 (configurable columns working), SC-008 (graceful handling of missing values)
