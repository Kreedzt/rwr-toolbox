# Menu Shortcuts API Contract

**Feature**: 003-ux-improvements | **Date**: 2026-01-16

---

## Overview

This document defines the contract for updating menu keyboard shortcuts to accommodate the new Hotkeys menu entry. The update follows the clarification decision to position Hotkeys between Data and Settings with Ctrl+5, shifting subsequent shortcuts.

---

## Menu Structure

### File Location

`src/app/shared/constants/menu-items.ts`

---

## Current Menu Structure (Before Update)

```typescript
export const MAIN_MENU_ITEMS: MenuItem[] = [
    {
        label: 'menu.dashboard',
        icon: 'layout-dashboard',
        link: '/dashboard',
        shortcut: 'Ctrl+1',
        description: 'menu.dashboard_desc',
    },
    {
        label: 'menu.servers',
        icon: 'server',
        link: '/servers',
        shortcut: 'Ctrl+2',
        description: 'menu.servers_desc',
    },
    {
        label: 'menu.players',
        icon: 'users',
        link: '/players',
        shortcut: 'Ctrl+3',
        description: 'menu.players_desc',
    },
    {
        label: 'menu.data',
        icon: 'database',
        link: '/data',
        shortcut: 'Ctrl+4',
        description: 'menu.data_desc',
    },
    {
        divider: true,
    },
    {
        label: 'menu.settings',
        icon: 'settings',
        link: '/settings',
        shortcut: 'Ctrl+5',      // ⚠️ WILL CHANGE
        description: 'menu.settings_desc',
    },
    {
        divider: true,
    },
    {
        label: 'menu.about',
        icon: 'info',
        link: '/about',
        shortcut: 'Ctrl+6',      // ⚠️ WILL CHANGE
        description: 'menu.about_desc',
    },
];
```

---

## Updated Menu Structure (After Implementation)

```typescript
export const MAIN_MENU_ITEMS: MenuItem[] = [
    {
        label: 'menu.dashboard',
        icon: 'layout-dashboard',
        link: '/dashboard',
        shortcut: 'Ctrl+1',      // ✅ UNCHANGED
        description: 'menu.dashboard_desc',
    },
    {
        label: 'menu.servers',
        icon: 'server',
        link: '/servers',
        shortcut: 'Ctrl+2',      // ✅ UNCHANGED
        description: 'menu.servers_desc',
    },
    {
        label: 'menu.players',
        icon: 'users',
        link: '/players',
        shortcut: 'Ctrl+3',      // ✅ UNCHANGED
        description: 'menu.players_desc',
    },
    {
        label: 'menu.data',
        icon: 'database',
        link: '/data',
        shortcut: 'Ctrl+4',      // ✅ UNCHANGED
        description: 'menu.data_desc',
    },
    {
        divider: true,
    },
    // ⭐ NEW ENTRY
    {
        label: 'menu.hotkeys',
        icon: 'keyboard',
        link: '/hotkeys',
        shortcut: 'Ctrl+5',      // ⭐ NEW
        description: 'menu.hotkeys_desc',
    },
    {
        label: 'menu.settings',
        icon: 'settings',
        link: '/settings',
        shortcut: 'Ctrl+6',      // ⚠️ CHANGED from Ctrl+5
        description: 'menu.settings_desc',
    },
    {
        divider: true,
    },
    {
        label: 'menu.about',
        icon: 'info',
        link: '/about',
        shortcut: 'Ctrl+7',      // ⚠️ CHANGED from Ctrl+6
        description: 'menu.about_desc',
    },
];
```

---

## Shortcut Mapping Table

| Menu Item | Before | After | Change |
|-----------|--------|-------|--------|
| Dashboard | Ctrl+1 | Ctrl+1 | No change |
| Servers | Ctrl+2 | Ctrl+2 | No change |
| Players | Ctrl+3 | Ctrl+3 | No change |
| Data | Ctrl+4 | Ctrl+4 | No change |
| **Hotkeys** | *(removed)* | **Ctrl+5** | **NEW** |
| Settings | Ctrl+5 | Ctrl+6 | Shifted +1 |
| About | Ctrl+6 | Ctrl+7 | Shifted +1 |

---

## Interface Definition

### MenuItem Interface

**Location**: `src/app/shared/interfaces/menu-item.interface.ts`

```typescript
export interface MenuItem {
    /** i18n key for menu label */
    label: string;

    /** Lucide icon name */
    icon: string;

    /** Router link path */
    link: string;

    /** Keyboard shortcut (e.g., 'Ctrl+1') */
    shortcut: string;

    /** i18n key for tooltip description */
    description: string;

    /** Optional divider flag */
    divider?: boolean;
}
```

---

## Keyboard Event Handler

### Implementation Location

`src/app/app.component.ts` (or similar root component)

### Expected Behavior

```typescript
@HostListener('document:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
    // Check for Ctrl+Number combinations
    if (event.ctrlKey || event.metaKey) {
        const key = event.key;
        if (key >= '1' && key <= '7') {
            event.preventDefault();

            // Find menu item with matching shortcut
            const shortcut = `Ctrl+${key}`;
            const menuItem = MAIN_MENU_ITEMS.find(item => item.shortcut === shortcut);

            if (menuItem) {
                this.router.navigate([menuItem.link]);
            }
        }
    }
}
```

---

## i18n Keys

### English (`src/assets/i18n/en.json`)

```json
{
    "menu": {
        "hotkeys": "Hotkeys",
        "hotkeys_desc": "Configure keyboard shortcuts"
    }
}
```

### Chinese (`src/assets/i18n/zh.json`)

```json
{
    "menu": {
        "hotkeys": "快捷键",
        "hotkeys_desc": "配置键盘快捷键"
    }
}
```

**Note**: These i18n keys already exist in the project. No changes required.

---

## Menu Grouping Logic

### Navigation Items (Ctrl+1 to Ctrl+4)
- Dashboard
- Servers
- Players
- Data

### Configuration Items (Ctrl+5 to Ctrl+6)
- **Hotkeys** (new)
- Settings

### Information Items (Ctrl+7)
- About

---

## Implementation Checklist

- [ ] Add Hotkeys menu item to `MAIN_MENU_ITEMS` array
- [ ] Update Settings shortcut from `Ctrl+5` to `Ctrl+6`
- [ ] Update About shortcut from `Ctrl+6` to `Ctrl+7`
- [ ] Verify keyboard event handler handles new shortcuts
- [ ] Test all shortcuts (Ctrl+1 through Ctrl+7)
- [ ] Verify Hotkeys route `/hotkeys` exists and works
- [ ] Update any documentation referencing old shortcuts

---

## Testing

### Manual Test Cases

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Hotkeys menu visible | 1. Open app<br>2. View sidebar | Hotkeys menu entry visible between Data and Settings |
| Ctrl+5 navigation | 1. Press Ctrl+5 | Navigates to /hotkeys route |
| Ctrl+6 navigation | 1. Press Ctrl+6 | Navigates to /settings route |
| Ctrl+7 navigation | 1. Press Ctrl+7 | Navigates to /about route |
| Menu click | 1. Click Hotkeys menu item | Navigates to /hotkeys route |
| Icon display | 1. View Hotkeys menu item | Shows keyboard icon |
| Shortcut display | 1. View Hotkeys menu item | Shows "Ctrl+5" in tooltip/hint |

### Keyboard Event Handler Test

```typescript
describe('Keyboard Shortcuts', () => {
    it('should navigate to hotkeys on Ctrl+5', () => {
        const event = new KeyboardEvent('keydown', {
            key: '5',
            ctrlKey: true
        });
        component.handleKeyboardEvent(event);
        expect(router.navigate).toHaveBeenCalledWith(['/hotkeys']);
    });
});
```

---

## Breaking Changes

### User Impact

**Low Risk**: This is a pre-launch project with no production users.

### Migration Notes

- No migration needed (pre-launch)
- Documentation should reflect updated shortcuts
- Any hardcoded references to Ctrl+5/Ctrl+6 must be updated

---

## Related Files

| File | Change Type |
|------|-------------|
| `src/app/shared/constants/menu-items.ts` | MODIFY - Add Hotkeys entry, update shortcuts |
| `src/app/app.routes.ts` | EXISTING - `/hotkeys` route already exists |
| `src/assets/i18n/en.json` | EXISTING - Keys already present |
| `src/assets/i18n/zh.json` | EXISTING - Keys already present |
| `src/app/features/hotkeys/*` | EXISTING - Component already exists |

---

## References

- [Feature Spec](../spec.md) - User Story 5: Restore Hotkeys Menu Entry
- [Clarifications](../spec.md#clarifications) - Q4: Hotkeys menu positioning decision
- [Data Model](../data-model.md) - N/A (menu structure, not data entity)
