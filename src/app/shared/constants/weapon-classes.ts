/**
 * Weapon class names mapping constants
 * Feature: 003-ux-improvements
 *
 * Maps numeric class values from weapon XML to i18n translation keys.
 * The class attribute (e.g., class="0") is separate from the tag attribute.
 */

/**
 * Weapon class numeric value to i18n key mapping
 *
 * From weapon XML: <specification class="0" ... />
 * These are game code classifications, separate from tag names.
 */
export const WEAPON_CLASS_NAMES: Record<number, string> = {
    0: 'weapons.class.assault',
    1: 'weapons.class.smg',
    2: 'weapons.class.sniper',
    3: 'weapons.class.lmg',
    4: 'weapons.class.shotgun',
    5: 'weapons.class.pistol',
    6: 'weapons.class.rifle',
    // Add more mappings as discovered from game data
};

/**
 * Get display name for weapon class value
 *
 * @param classValue - Numeric class value from weapon XML
 * @returns Raw number if no i18n mapping exists (for unknown classes)
 */
export function getWeaponClassName(classValue: number): string {
    const i18nKey = WEAPON_CLASS_NAMES[classValue];
    return i18nKey || `${classValue}`;
}

/**
 * Check if a class value has a named mapping
 *
 * @param classValue - Numeric class value
 * @returns true if the class has an i18n mapping
 */
export function hasWeaponClassName(classValue: number): boolean {
    return classValue in WEAPON_CLASS_NAMES;
}
