import { WeaponColumn, Weapon } from '../../../shared/models/weapons.models';

/**
 * Weapon table column definitions
 * Feature: 001-weapons-directory-scanner
 *
 * 6 default columns optimized for 800x600 resolution
 * + IMAGE_COLUMN for item thumbnails (T018: Phase 4 - US2)
 */
export const WEAPON_COLUMNS: WeaponColumn[] = [
    {
        key: 'image',
        field: 'key' as keyof Weapon,
        label: 'Image',
        i18nKey: 'weapons.columns.image',
        alignment: 'center',
        alwaysVisible: true,
    },
    {
        key: 'key',
        field: 'key',
        label: 'Key',
        i18nKey: 'weapons.columns.key',
        alignment: 'left',
        alwaysVisible: false,
    },
    {
        key: 'name',
        field: 'name',
        label: 'Name',
        i18nKey: 'weapons.columns.name',
        alignment: 'left',
        alwaysVisible: false,
    },
    {
        key: 'tag',
        field: 'tag',
        label: 'Class Tag',
        i18nKey: 'weapons.columns.tag',
        alignment: 'left',
        alwaysVisible: false,
    },
    {
        key: 'class',
        field: 'class',
        label: 'Class',
        i18nKey: 'weapons.columns.class',
        alignment: 'right',
        alwaysVisible: false,
    },
    {
        key: 'magazineSize',
        field: 'magazineSize',
        label: 'Magazine',
        i18nKey: 'weapons.columns.magazineSize',
        alignment: 'right',
        alwaysVisible: false,
    },
    {
        key: 'killProbability',
        field: 'killProbability',
        label: 'Damage',
        i18nKey: 'weapons.columns.killProbability',
        alignment: 'right',
        alwaysVisible: false,
    },
    {
        key: 'retriggerTime',
        field: 'retriggerTime',
        label: 'Fire Rate',
        i18nKey: 'weapons.columns.retriggerTime',
        alignment: 'right',
        alwaysVisible: false,
    },
    {
        key: 'filePath',
        field: 'filePath',
        label: 'File Path',
        i18nKey: 'weapons.columns.filePath',
        alignment: 'left',
        alwaysVisible: false,
    },
];

/**
 * Get column visibility from column ID list
 */
export function getColumnVisibility(columnIds: string[]): Map<string, boolean> {
    const visibility = new Map<string, boolean>();
    for (const col of WEAPON_COLUMNS) {
        visibility.set(col.key, columnIds.includes(col.key));
    }
    return visibility;
}

/**
 * Get visible columns
 */
export function getVisibleColumns(
    visibilityMap: Map<string, boolean>,
): WeaponColumn[] {
    return WEAPON_COLUMNS.filter((col) => visibilityMap.get(col.key) !== false);
}
