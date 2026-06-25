import { Injectable, inject, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Loads RWR's bundled localization map (English in-game name -> translated
 * name) so the data pages can search weapons/items by their localized names,
 * e.g. typing "霰弹枪" to find "AA-12".
 *
 * The map is loaded for the active UI language. When the language changes it
 * is reloaded automatically using the last-used game path, so localized search
 * keeps working without a rescan.
 */
@Injectable({
    providedIn: 'root',
})
export class GameTranslationService {
    private transloco = inject(TranslocoService);

    private map = signal<Record<string, string>>({});
    /** Reactive localized-name map (English name -> translated name). */
    readonly translations = this.map.asReadonly();

    private lastGamePath: string | null = null;
    private lastDirectory: string | undefined = undefined;

    constructor() {
        // Reload for the new language whenever it changes, if we've loaded before.
        this.transloco.langChanges$.subscribe(() => {
            if (this.lastGamePath !== null) {
                void this.load(this.lastGamePath, this.lastDirectory);
            }
        });
    }

    /**
     * Fetch and cache the localization map for the active language.
     * Failures are swallowed (the map is cleared) so they never block scanning.
     */
    async load(gamePath: string, directory?: string): Promise<void> {
        this.lastGamePath = gamePath;
        this.lastDirectory = directory;
        const lang = this.transloco.getActiveLang();
        try {
            const result = await invoke<Record<string, string>>(
                'get_game_translations',
                {
                    gamePath,
                    game_path: gamePath,
                    directory: directory ?? null,
                    lang,
                },
            );
            this.map.set(result ?? {});
        } catch {
            this.map.set({});
        }
    }

    /** Return the localized name for an English in-game name, if any. */
    translate(name: string): string | undefined {
        return this.map()[name];
    }
}
