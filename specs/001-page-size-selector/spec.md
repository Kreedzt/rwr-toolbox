# Feature Specification: Page Size Selector for Data Tables

**Feature Branch**: `001-page-size-selector`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "我们期望在 data 页面中展示每页数量的切换操作, 交互与 players 页面一致"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Page Size Selection (Priority: P1)

As a user browsing the Weapons or Items data tables, I want to control how many items are displayed per page so that I can optimize my viewing experience based on my screen size and preferences.

**Why this priority**: This is the core functionality requested - the ability to change page size. It provides immediate user value by allowing users to customize their data viewing experience. Without this, users are stuck with the default 100 items per page regardless of their needs.

**Independent Test**: Navigate to Data > Weapons or Data > Items page, locate the page size dropdown selector, change the selection from one option to another, and verify the table updates to show the new number of items per page.

**Acceptance Scenarios**:

1. **Given** I am on the Weapons or Items page with data loaded, **When** I select a different page size from the dropdown, **Then** the table immediately updates to display the selected number of items per page
2. **Given** I have filtered the data (e.g., by search or category), **When** I change the page size, **Then** the filtered results are re-paginated according to the new page size
3. **Given** I am on page 3 of a multi-page result set, **When** I change to a larger page size that reduces total pages below 3, **Then** I am automatically redirected to the last available page
4. **Given** I change the page size setting, **When** I navigate away and return to the same data page, **Then** my page size preference is remembered

---

### User Story 2 - Consistent UX Across Pages (Priority: P1)

As a user, I want the page size selector to look and behave the same way across Players, Weapons, and Items pages so that I don't have to learn different interaction patterns.

**Why this priority**: Consistency is critical for user experience. The Players page already has this feature implemented; this story ensures the same visual design and interaction pattern is applied to Weapons and Items pages.

**Independent Test**: Open Players, Weapons, and Items pages in separate tabs, verify that the page size selector appears in the same relative position, uses the same visual style (dropdown), and responds to user interactions identically across all three pages.

**Acceptance Scenarios**:

1. **Given** I am viewing any of the three data pages (Players, Weapons, Items), **When** I look for the page size control, **Then** it appears in the same location relative to other controls (search, filters)
2. **Given** I interact with the page size dropdown on any page, **When** I open the dropdown, **Then** I see the same set of page size options available
3. **Given** I change the page size on one page, **When** I navigate to another data page, **Then** that page remembers its own page size setting independently

---

### User Story 3 - Appropriate Page Size Options (Priority: P2)

As a user, I want reasonable page size options that balance performance and usability so that I can choose between seeing more items at once versus faster page loads.

**Why this priority**: While important, the specific options offered are less critical than having the selector itself. The default options from Players page can be reused as a reasonable starting point.

**Independent Test**: Click the page size dropdown and verify that the options provided are sensible (e.g., 25, 50, 100, 200) and that each option works correctly when selected.

**Acceptance Scenarios**:

1. **Given** I open the page size dropdown, **When** I view the available options, **Then** I see at least 3 different page size choices
2. **Given** I select a small page size (e.g., 25), **When** the table renders, **Then** I see exactly that many items per page
3. **Given** I select a large page size (e.g., 200), **When** the table renders, **Then** the page still loads and renders without noticeable delay

---

### Edge Cases

- What happens when the selected page size is larger than the total number of items? (All items should be displayed on page 1)
- What happens when changing page size results in the current page number exceeding the new total pages? (Redirect to last valid page)
- What happens when there are no items to display? (Page size selector should still be visible but may be disabled or show 0 pages)
- What happens when page size is changed while data is still loading? (Change should be queued or applied once loading completes)
- What happens when the browser is resized to mobile view? (Selector should remain accessible and usable)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a page size selector dropdown on the Weapons data page
- **FR-002**: System MUST provide a page size selector dropdown on the Items data page
- **FR-003**: System MUST display page size selector in the same visual style and location as Players page (in the controls area above the table)
- **FR-004**: System MUST offer multiple page size options (default: 25, 50, 100, 200 items per page)
- **FR-005**: System MUST immediately re-render the table when user selects a different page size
- **FR-006**: System MUST automatically adjust page number when new page size causes current page to exceed total pages
- **FR-007**: System MUST persist page size preference per data page (Weapons, Items each remember their own setting)
- **FR-008**: System MUST maintain selected page size when applying filters or search
- **FR-009**: System MUST display localized labels for page size options (English and Chinese)
- **FR-010**: System MUST show pagination controls only when there are items to display

### Key Entities

- **Page Size Preference**: Stores the user's selected items per page for each data table (Weapons, Items)
  - Attributes: page size value (number), data page identifier (Weapons/Items)
- **Pagination State**: Tracks current page, page size, and total items for rendering the table
  - Attributes: current page number, items per page, total filtered items

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can change page size with a single click/tap on the dropdown selector
- **SC-002**: Table updates to reflect new page size within 100 milliseconds after selection
- **SC-003**: Page size preference is remembered across page navigation (browser refresh, tab switching)
- **SC-004**: Visual appearance and interaction pattern matches Players page implementation (100% consistency)
- **SC-005**: Page size change does not break or reset active filters or search terms
- **SC-006**: All page size options (25, 50, 100, 200) render correctly without performance degradation
- **SC-007**: Feature works correctly on both Weapons and Items pages independently

## Assumptions

1. Players page already has a working page size selector that serves as the reference implementation
2. Page size options (25, 50, 100, 200) from Players page are appropriate for Weapons and Items pages
3. Users expect each data page to remember its own page size setting independently
4. The existing pagination infrastructure in Weapons/Items components supports variable page sizes
5. Localization (i18n) for page size labels follows the same pattern as other UI elements

## Dependencies

- Existing Players component page size selector implementation (reference)
- Current pagination implementation in Weapons and Items components
- Transloco i18n service for localization
- Signals-based state management (Angular v20 pattern)
