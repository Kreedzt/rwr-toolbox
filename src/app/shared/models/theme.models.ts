export interface ThemePreference {
    /** User's selected theme: 'light', 'dark', or 'auto' for OS detection */
    themeType: 'light' | 'dark' | 'auto';
    /** Whether theme was auto-detected from OS */
    isAutoDetect: boolean;
    /** Unix timestamp of last update */
    lastUpdated: number;
    /** Actual detected OS theme (only set when themeType='auto') */
    autoDetectedTheme?: 'light' | 'dark' | null;
}

export interface SystemTheme {
    /** Detected OS theme: 'light', 'dark', or null if detection failed */
    themeType: 'light' | 'dark' | null;
    /** Unix timestamp when detection was performed */
    detectedAt: number;
    /** Platform where theme was detected */
    platform: 'macos' | 'windows' | 'linux' | 'unknown';
}
