# Quickstart: Tag Column Rename Implementation

**Feature**: 005-tag-column-fix
**Date**: 2026-01-18

## Overview

This guide provides step-by-step instructions for implementing the tag column rename and data reading fix.

## Prerequisites

- Branch: `005-tag-column-fix` (already created)
- All plan artifacts approved (research.md, data-model.md)

## Implementation Steps

### Step 1: Update TypeScript Models

**File**: `src/app/shared/models/weapons.models.ts`

```typescript
// 1. Rename field in Weapon interface (line ~25)
export interface Weapon {
    key?: string;
    name: string;
    tag: string;  // ← renamed from 'classTag'
    class?: number;
    // ... rest of fields
}

// 2. Update WeaponColumnKey type (line ~133)
export type WeaponColumnKey =
    | 'image'
    | 'key'
    | 'name'
    | 'tag'  // ← renamed from 'classTag'
    | 'class'
    | 'magazineSize'
    // ...

// 3. Update AdvancedFilters interface (line ~125)
export interface AdvancedFilters {
    // ...
    tag?: string;  // ← renamed from 'classTag'
    // ...
}
```

### Step 2: Update Column Configuration

**File**: `src/app/features/data/weapons/weapon-columns.ts`

```typescript
// Update the column definition (line ~36)
{
    key: 'tag',           // ← renamed from 'classTag'
    field: 'tag' as keyof Weapon,  // ← renamed from 'classTag'
    label: 'Tag',
    i18nKey: 'weapons.columns.tag',  // ← renamed from 'weapons.columns.classTag'
    alignment: 'left',
    alwaysVisible: false,
},
```

### Step 3: Update Component Logic

**File**: `src/app/features/data/weapons/weapons.component.ts`

```typescript
// 1. Rename signal (line ~38)
readonly selectedTag = signal<string | undefined>(undefined);  // ← renamed from 'selectedClassTag'

// 2. Rename computed (line ~64)
readonly availableTags = computed(() => {  // ← renamed from 'availableClassTags'
    const tags = new Set<string>();
    this.weaponService.weaponsSig().forEach((w) => {
        if (w.tag) tags.add(w.tag);  // ← changed from w.classTag
    });
    return Array.from(tags).sort();
});

// 3. Rename method (line ~160)
onTagFilter(tag: string): void {  // ← renamed from 'onClassTagFilter'
    this.selectedTag.set(tag || undefined);  // ← changed from this.selectedClassTag
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.updateAdvancedFilters();
}

// 4. Update updateAdvancedFilters method (line ~168)
private updateAdvancedFilters(): void {
    const filters: AdvancedFilters = {
        ...this.advancedFilters(),
        tag: this.selectedTag(),  // ← changed from classTag: this.selectedClassTag()
    };
    this.advancedFilters.set(filters);
    this.weaponService.setAdvancedFilters(filters);
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
}

// 5. Add migration in constructor (line ~91)
constructor() {
    // Migrate localStorage preferences from 'classTag' to 'tag'
    const saved = this.weaponService.getColumnVisibility();
    const migrated = saved.map(col => {
        if (col.columnId === 'classTag') {
            return { ...col, columnId: 'tag' };
        }
        return col;
    });
    this.weaponService.setColumnVisibility(migrated);

    // ... rest of constructor
}

// 6. Update onClearFilters (line ~237)
onClearFilters(): void {
    this.searchTerm.set('');
    this.selectedTag.set(undefined);  // ← changed from this.selectedClassTag
    this.advancedFilters.set({});
    this.weaponService.clearFilters();
}
```

### Step 4: Update HTML Template

**File**: `src/app/features/data/weapons/weapons.component.html`

```html
<!-- Update the filter dropdown binding (search for "selectedClassTag") -->
<select
    (change)="onTagFilter($any($event.target).value)"
    [value]="selectedTag()"
    class="select select-bordered select-sm w-full"
>
    <!-- options unchanged -->
</select>
```

### Step 5: Update i18n Files

**File**: `src/assets/i18n/en.json`

```json
{
    "weapons": {
        "columns": {
            "tag": "Tag"  // ← renamed from "classTag"
        }
    }
}
```

**File**: `src/assets/i18n/zh.json`

```json
{
    "weapons": {
        "columns": {
            "tag": "标签"  // ← renamed from "classTag"
        }
    }
}
```

### Step 6: Build and Test

```bash
# Run Angular build to check for compilation errors
pnpm build

# If build succeeds, run dev server for manual testing
pnpm tauri dev
```

**Manual Testing Checklist**:
- [ ] Open Weapons page
- [ ] Verify Tag column shows "Tag" header (not "Class Tag")
- [ ] Verify tag values display (assault, smg, sniper, etc.)
- [ ] Test tag filter in advanced search
- [ ] Test column visibility toggle
- [ ] Verify existing column visibility preferences migrated
- [ ] Test language switching (EN/ZH)

### Step 7: Update Documentation

**File**: `docs-ai/PROGRESS.md`

Add entry at top of file documenting the feature completion.

## Verification

After implementation, verify:

1. **Build Status**: `pnpm build` succeeds without errors
2. **Data Display**: Tag column shows correct weapon categories
3. **Migration**: Existing user preferences preserved
4. **i18n**: Labels correct in both English and Chinese

## Rollback Plan

If issues arise, revert changes:
```bash
git checkout master
git branch -D 005-tag-column-fix
```

## Next Steps

After implementation, run `/speckit.implement` to execute the tasks, or manually implement following the steps above.
