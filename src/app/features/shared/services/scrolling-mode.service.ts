import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

export type ScrollingMode = 'table-only' | 'full-page';

@Injectable({ providedIn: 'root' })
export class ScrollingModeService {
    readonly mode = signal<ScrollingMode>('table-only');
    readonly isTableOnlyMode = computed(() => this.mode() === 'table-only');

    async loadMode(): Promise<void> {
        try {
            const saved = await invoke<ScrollingMode | null>(
                'get_scrolling_mode',
            );
            this.mode.set(saved || 'table-only');
        } catch (error) {
            console.error('Failed to load scrolling mode:', error);
            this.mode.set('table-only');
        }
    }

    async setMode(mode: ScrollingMode): Promise<void> {
        try {
            await invoke('save_scrolling_mode', { mode });
            this.mode.set(mode);
        } catch (error) {
            console.error('Failed to save scrolling mode:', error);
            throw error;
        }
    }
}
