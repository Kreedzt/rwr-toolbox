import { Injectable, computed, inject, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { SettingsService } from '../../../core/services/settings.service';
import {
    buildSteamLaunchArgsText,
    STEAM_RWR_APP_ID,
} from './steam-launch.constants';

type SteamLaunchAvailability = {
    available: boolean;
    reasonKey: string | null;
};

@Injectable({
    providedIn: 'root',
})
export class SteamLaunchService {
    private settingsService = inject(SettingsService);

    private isLaunchingSig = signal(false);
    private errorKeySig = signal<string | null>(null);

    readonly isLaunching = this.isLaunchingSig.asReadonly();
    readonly errorKey = this.errorKeySig.asReadonly();

    readonly boolParamsSig = computed(
        () => this.settingsService.settings().steamLaunchBoolParams,
    );
    readonly keyValueParamsSig = computed(
        () => this.settingsService.settings().steamLaunchKeyValueParams,
    );
    readonly customTokensSig = computed(
        () => this.settingsService.settings().steamLaunchCustomTokens,
    );

    readonly argsText = computed(() =>
        buildSteamLaunchArgsText({
            boolParams: this.boolParamsSig(),
            keyValueParams: this.keyValueParamsSig(),
            customTokens: this.customTokensSig(),
        }),
    );

    async setBoolParamEnabled(
        paramId: string,
        enabled: boolean,
    ): Promise<void> {
        const current = this.settingsService.settings().steamLaunchBoolParams;
        await this.settingsService.updateSettings({
            steamLaunchBoolParams: { ...current, [paramId]: enabled },
        });
    }

    async setKeyValueParam(key: string, value: string): Promise<void> {
        const current =
            this.settingsService.settings().steamLaunchKeyValueParams;
        await this.settingsService.updateSettings({
            steamLaunchKeyValueParams: { ...current, [key]: value },
        });
    }

    async removeKeyValueParam(key: string): Promise<void> {
        const current =
            this.settingsService.settings().steamLaunchKeyValueParams;
        if (!(key in current)) return;
        const { [key]: _, ...rest } = current;
        await this.settingsService.updateSettings({
            steamLaunchKeyValueParams: rest,
        });
    }

    async setCustomTokensFromText(multiline: string): Promise<void> {
        const tokens = multiline
            .split(/\r?\n/)
            .map((t) => t.trim())
            .filter(Boolean);

        await this.settingsService.updateSettings({
            steamLaunchCustomTokens: tokens,
        });
    }

    async checkGameAvailability(): Promise<SteamLaunchAvailability> {
        try {
            // Returns void on success; throws with a string error code on failure.
            await invoke('steam_check_rwr_available');
            return { available: true, reasonKey: null };
        } catch (e) {
            // Keep mapping minimal; refined in US3.
            const code = typeof e === 'string' ? e : 'unknown';
            if (code === 'game_unavailable') {
                return {
                    available: false,
                    reasonKey: 'settings.steamLaunch.errors.gameUnavailable',
                };
            }

            return {
                available: false,
                reasonKey: 'settings.steamLaunch.errors.steamUnavailable',
            };
        }
    }

    async launchGame(): Promise<void> {
        if (this.isLaunchingSig()) return;
        this.isLaunchingSig.set(true);
        this.errorKeySig.set(null);

        try {
            await invoke('steam_launch_rwr', {
                argsText: this.argsText(),
            });
        } catch (e) {
            const code = typeof e === 'string' ? e : 'unknown';
            if (code === 'steam_unavailable') {
                this.errorKeySig.set(
                    'settings.steamLaunch.errors.steamUnavailable',
                );
            } else if (code === 'game_unavailable') {
                this.errorKeySig.set(
                    'settings.steamLaunch.errors.gameUnavailable',
                );
            } else {
                this.errorKeySig.set(
                    'settings.steamLaunch.errors.launchFailed',
                );
            }
            throw e;
        } finally {
            this.isLaunchingSig.set(false);
        }
    }

    async copyArgsTextToClipboard(): Promise<void> {
        try {
            await writeText(this.argsText());
        } catch {
            // Clipboard plugin should be available on desktop; ignore for now.
        }
    }

    get appId(): number {
        return STEAM_RWR_APP_ID;
    }
}
