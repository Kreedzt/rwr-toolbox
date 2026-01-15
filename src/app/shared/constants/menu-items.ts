import { MenuItem } from '../interfaces/menu-item.interface';

/**
 * Main navigation menu structure for RWR Toolbox
 * Labels and descriptions are keys for Transloco translation
 *
 * Feature 001: Simplified navigation - only Data and Settings visible
 * Other menu items (Dashboard, Servers, Players, Mods, Hotkeys) are removed from sidebar
 * but remain accessible via direct URL for potential future use
 */
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
        shortcut: 'Ctrl+5',
        description: 'menu.settings_desc',
    },
    {
        divider: true,
    },
    {
        label: 'menu.about',
        icon: 'info',
        link: '/about',
        shortcut: 'Ctrl+6',
        description: 'menu.about_desc',
    },
];

/**
 * Removed menu items (Feature 001 - kept for reference and potential future use):
 * - Dashboard (/dashboard) - Ctrl+1
 * - Servers (/servers) - Ctrl+2
 * - Players (/players) - Ctrl+3
 * - Data children (local_data, extract, workshop) - now consolidated into /data route
 * - Mods (/mods) with children (install, bundle)
 * - Hotkeys (/hotkeys) - Ctrl+4
 *
 * These routes remain accessible via direct URL navigation but are hidden from sidebar
 */
