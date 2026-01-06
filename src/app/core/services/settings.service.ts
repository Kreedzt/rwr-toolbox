import { Injectable, signal, computed } from '@angular/core';
import { AppSettings, ApiEndpoint, FavoriteItem } from '../../shared/models/common.models';

/**
 * Default application settings
 */
const DEFAULT_SETTINGS: AppSettings = {
    apiEndpoint: 'global',
    serverPageSize: 100,
    playerPageSize: 100,
    enablePing: true,
    pingTimeout: 10000,
    cacheEnabled: true,
    favorites: []
};

/**
 * Available API endpoints
 */
const AVAILABLE_ENDPOINTS: ApiEndpoint[] = [
    { key: 'cn', label: '中国大陆', host: 'robin.kreedzt.cn' },
    { key: 'global', label: '全球', host: 'robin.kreedzt.com' }
];

/**
 * Settings service with Tauri Store persistence
 * Falls back to localStorage for web mode
 */
@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    // Reactive settings using signals
    private settingsState = signal<AppSettings>(DEFAULT_SETTINGS);

    /** Current settings */
    readonly settings = computed(() => this.settingsState());

    /** Available endpoints */
    readonly endpoints = AVAILABLE_ENDPOINTS;

    /** Local storage key */
    private readonly LOCAL_STORAGE_KEY = 'app_settings';

    /**
     * Initialize settings from storage
     */
    async initialize(): Promise<void> {
        // For now, use localStorage
        // Tauri Store integration will be added later
        try {
            const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.settingsState.set({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Update settings
     * @param updates Partial settings to update
     */
    async updateSettings(updates: Partial<AppSettings>): Promise<void> {
        const newSettings = { ...this.settingsState(), ...updates };
        this.settingsState.set(newSettings);

        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Get the current API endpoint host
     * @returns Host address
     */
    getEndpoint(): string {
        const endpointKey = this.settingsState().apiEndpoint;
        const endpoint = this.endpoints.find(e => e.key === endpointKey);
        return endpoint?.host ?? AVAILABLE_ENDPOINTS[1].host;
    }

    /**
     * Get the current API endpoint
     * @returns Full endpoint object
     */
    getEndpointConfig(): ApiEndpoint {
        const endpointKey = this.settingsState().apiEndpoint;
        return this.endpoints.find(e => e.key === endpointKey) ?? AVAILABLE_ENDPOINTS[1];
    }

    /**
     * Add a favorite item
     * @param item Favorite item to add
     */
    async addFavorite(item: FavoriteItem): Promise<void> {
        const currentFavorites = this.settingsState().favorites;
        const exists = currentFavorites.some(f => f.id === item.id && f.type === item.type);

        if (!exists) {
            await this.updateSettings({
                favorites: [...currentFavorites, item]
            });
        }
    }

    /**
     * Remove a favorite item
     * @param id Item ID
     * @param type Item type ('server' or 'player')
     */
    async removeFavorite(id: string, type: 'server' | 'player'): Promise<void> {
        const currentFavorites = this.settingsState().favorites;
        await this.updateSettings({
            favorites: currentFavorites.filter(f => !(f.id === id && f.type === type))
        });
    }

    /**
     * Get favorite IDs by type
     * @param type Item type
     * @returns Array of favorite IDs
     */
    getFavorites(type: 'server' | 'player'): string[] {
        return this.settingsState().favorites
            .filter(f => f.type === type)
            .map(f => f.id);
    }

    /**
     * Check if item is favorited
     * @param id Item ID
     * @param type Item type
     * @returns True if favorited
     */
    isFavorite(id: string, type: 'server' | 'player'): boolean {
        return this.settingsState().favorites.some(f => f.id === id && f.type === type);
    }

    /**
     * Toggle favorite status
     * @param id Item ID
     * @param type Item type
     */
    async toggleFavorite(id: string, type: 'server' | 'player'): Promise<void> {
        if (this.isFavorite(id, type)) {
            await this.removeFavorite(id, type);
        } else {
            await this.addFavorite({
                id,
                type,
                addedAt: Date.now()
            });
        }
    }

    /**
     * Reset settings to defaults
     */
    async resetToDefaults(): Promise<void> {
        this.settingsState.set(DEFAULT_SETTINGS);
        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
}
