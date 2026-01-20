# Tasks: Page Size Selector for Data Tables

**Input**: Design documents from `/specs/001-page-size-selector/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated tests specified in feature requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Angular project: `src/` at repository root
- i18n files: `src/assets/i18n/`
- Feature components: `src/app/features/data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Feature branch creation and verification

- [X] T001 Create feature branch `001-page-size-selector` from master
- [X] T002 Verify existing pagination infrastructure in src/app/features/data/weapons/weapons.component.ts
- [X] T003 Verify existing pagination infrastructure in src/app/features/data/items/items.component.ts

---

## Phase 2: Foundational (i18n Infrastructure)

**Purpose**: Translation keys that MUST exist before any UI implementation

**⚠️ CRITICAL**: No component work can begin until this phase is complete

- [X] T004 [P] [US1, US2, US3] Add English i18n keys to src/assets/i18n/en.json
  - Under `weapons` object: `page_size`, `page_size_25`, `page_size_50`, `page_size_100`, `page_size_200`
  - Under `items` object: `page_size`, `page_size_25`, `page_size_50`, `page_size_100`, `page_size_200`
- [X] T005 [P] [US1, US2, US3] Add Chinese i18n keys to src/assets/i18n/zh.json
  - Under `weapons` object: `page_size`, `page_size_25`, `page_size_50`, `page_size_100`, `page_size_200`
  - Under `items` object: `page_size`, `page_size_25`, `page_size_50`, `page_size_100`, `page_size_200`

**Checkpoint**: i18n ready - component implementation can now begin

---

## Phase 3: User Story 1 - Page Size Selection (Priority: P1) 🎯 MVP

**Goal**: Enable users to change page size on Weapons and Items pages

**Independent Test**: Navigate to Data > Weapons or Data > Items, change page size from dropdown, verify table updates to show new number of items per page

### Implementation for User Story 1

- [X] T006 [P] [US1] Add pageSizeOptions signal to src/app/features/data/weapons/weapons.component.ts
- [X] T007 [P] [US1] Add pageSizeOptions signal to src/app/features/data/items/items.component.ts
- [X] T008 [US1] Add constructor localStorage load logic to src/app/features/data/weapons/weapons.component.ts
  - Load from 'weapons-page-size' key, validate against pageSizeOptions, update pagination signal
- [X] T009 [US1] Add constructor localStorage load logic to src/app/features/data/items/items.component.ts
  - Load from 'items-page-size' key, validate against pageSizeOptions, update pagination signal
- [X] T010 [US1] Add onPageSizeChange method to src/app/features/data/weapons/weapons.component.ts
  - Handle change event, update pagination signal, reset to page 1, save to localStorage
- [X] T011 [US1] Add onPageSizeChange method to src/app/features/data/items/items.component.ts
  - Handle change event, update pagination signal, reset to page 1, save to localStorage
- [X] T012 [P] [US1, US2] Add page size selector HTML to src/app/features/data/weapons/weapons.component.html
  - Insert in controls row after filter dropdown, using DaisyUI select components
- [X] T013 [P] [US1, US2] Add page size selector HTML to src/app/features/data/items/items.component.html
  - Insert in controls row after filter dropdown, using DaisyUI select components

**Checkpoint**: At this point, User Story 1 should be fully functional - users can change page size on both Weapons and Items pages

---

## Phase 4: User Story 2 - Consistent UX Across Pages (Priority: P1)

**Goal**: Page size selector matches Players page visual design and interaction pattern

**Independent Test**: Open Players, Weapons, and Items pages, verify page size selector appears in same relative position with same visual style

### Implementation for User Story 2

**NOTE**: Tasks T012 and T013 from Phase 3 already implemented the UI. This phase focuses on verification and consistency validation.

- [X] T014 [US2] Visual consistency check: Compare Weapons page size selector in src/app/features/data/weapons/weapons.component.html with Players page reference
- [X] T015 [US2] Visual consistency check: Compare Items page size selector in src/app/features/data/items/items.component.html with Players page reference
- [X] T016 [US2] Verify page size selector positioning in controls row matches Players page layout

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - page size selector is functional AND visually consistent

---

## Phase 5: User Story 3 - Appropriate Page Size Options (Priority: P2)

**Goal**: Offer sensible page size options [25, 50, 100, 200] for data tables

**Independent Test**: Click page size dropdown, verify options are sensible and each works correctly

### Implementation for User Story 3

**NOTE**: Page size options [25, 50, 100, 200] are already defined in T006 and T007 from Phase 3. This phase focuses on verification.

- [X] T017 [US3] Verify pageSizeOptions array [25, 50, 100, 200] in src/app/features/data/weapons/weapons.component.ts
- [X] T018 [US3] Verify pageSizeOptions array [25, 50, 100, 200] in src/app/features/data/items/items.component.ts
- [X] T019 [US3] Test all page size options render correctly on Weapons page
- [X] T020 [US3] Test all page size options render correctly on Items page

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, formatting, and validation

- [X] T021 [P] Run code formatting: `pnpm format:all`
- [X] T022 [P] TypeScript validation: `pnpm tsc --noEmit`
- [X] T023 Build verification: `pnpm build`
- [X] T024 Manual testing per quickstart.md checklist
  - Test Weapons page with all page size options
  - Test Items page with all page size options
  - Verify localStorage persistence across page refresh
  - Verify filters/search persist when changing page size
  - Verify page resets to 1 when changing page size
- [X] T025 Update docs-ai/PROGRESS.md with implementation summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational (i18n) phase completion
  - User Story 1 and User Story 2 implementation can proceed in parallel
  - User Story 3 is verification-only (options defined in US1)
- **Polish (Phase 6)**: Depends on all implementation tasks being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - UI consistency verification, T012/T013 created in US1
- **User Story 3 (P2)**: Depends on US1 completion - Options defined in US1 tasks T006/T007

### Within Each User Story

- i18n keys (T004, T005) MUST be added before HTML templates (T012, T013)
- Component TypeScript (T006-T011) can be implemented in parallel with i18n
- HTML templates (T012, T013) depend on both i18n keys and TypeScript methods
- Verification tasks (T014-T020) after implementation complete

### Parallel Opportunities

```bash
# Phase 1: All setup tasks can run in parallel
T002: Verify Weapons pagination infrastructure
T003: Verify Items pagination infrastructure

# Phase 2: Both i18n file edits can run in parallel
T004: Add English keys to en.json
T005: Add Chinese keys to zh.json

# Phase 3: Signal additions can run in parallel
T006: Add pageSizeOptions to WeaponsComponent
T007: Add pageSizeOptions to ItemsComponent

# Phase 3: Template edits can run in parallel (after TypeScript methods complete)
T012: Add HTML to Weapons template
T013: Add HTML to Items template

# Phase 4: Consistency checks can run in parallel
T014: Verify Weapons consistency
T015: Verify Items consistency

# Phase 6: Code quality tasks can run in parallel
T021: Run formatting
T022: Run TypeScript check
T023: Run build
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (i18n) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (core page size change functionality)
4. Complete Phase 4: User Story 2 (UX consistency verification)
5. **STOP and VALIDATE**: Test both stories independently
6. Polish and deliver

### Incremental Delivery

1. Complete Setup + Foundational → i18n ready
2. Add User Story 1 → Test independently → Page size selector functional (MVP!)
3. Add User Story 2 → Verify consistency → UX matches Players page
4. Add User Story 3 → Verify options → All page sizes work correctly
5. Polish → Code quality and documentation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational (i18n) is done:
   - Developer A: Weapons component (T006, T008, T010, T012)
   - Developer B: Items component (T007, T009, T011, T013)
3. Both developers complete their components independently
4. Team converges for consistency verification (Phase 4)
5. Final polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 1 and User Story 2 are both P1 priority - implement together
- User Story 3 is P2 verification-only - can be deferred if needed
- Weapons and Items components are independent - can be worked in parallel
- No service layer changes needed - all work is component-level UI state
- localStorage persistence is component-level, not service-level
- All i18n keys must exist in BOTH en.json and zh.json
- Page size selector HTML should match Players page exactly for consistency
