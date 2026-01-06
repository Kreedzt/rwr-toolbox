import { MenuItem } from '../interfaces/menu-item.interface';

/**
 * Main navigation menu structure for RWR Toolbox
 */
export const MAIN_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Dashboard',
        icon: 'layout-dashboard',
        link: '/dashboard'
    },
    {
        label: 'Servers',
        icon: 'server',
        link: '/servers'
    },
    {
        label: 'Players',
        icon: 'users',
        link: '/players'
    },
    {
        label: 'Data',
        icon: 'database',
        link: '/data',
        children: [
            {
                label: 'Local Data',
                icon: 'hard-drive',
                link: '/data/local'
            },
            {
                label: 'Extract',
                icon: 'download',
                link: '/data/extract'
            },
            {
                label: 'Workshop',
                icon: 'folder-open',
                link: '/data/workshop'
            }
        ]
    },
    {
        label: 'Mods',
        icon: 'package',
        link: '/mods',
        children: [
            {
                label: 'Install',
                icon: 'cloud-download',
                link: '/mods/install'
            },
            {
                label: 'Bundle',
                icon: 'box',
                link: '/mods/bundle'
            }
        ]
    },
    {
        label: 'Hotkeys',
        icon: 'keyboard',
        link: '/hotkeys'
    },
    {
        divider: true
    },
    {
        label: 'Settings',
        icon: 'settings',
        link: '/settings'
    },
    {
        divider: true
    },
    {
        label: 'About',
        icon: 'info',
        link: '/about'
    }
];
