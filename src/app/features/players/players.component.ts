import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
    Player,
    PlayerFilter,
    PlayerSort,
    PlayerSortField,
    PlayerDatabase
} from '../../shared/models/player.models';
import { PlayerService } from './services/player.service';
import { SettingsService } from '../../core/services/settings.service';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Players list component with filtering, sorting, and database switching
 */
@Component({
    selector: 'app-players',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, TranslocoDirective],
    templateUrl: './players.component.html',
    styleUrl: './players.component.css'
})
export class PlayersComponent implements OnInit {
    private playerService = inject(PlayerService);
    private settingsService = inject(SettingsService);
    private translocoService = inject(TranslocoService);

    // Convert observables to signals
    private players$ = this.playerService.players$;
    private loading$ = this.playerService.loading$;
    private error$ = this.playerService.error$;
    private currentPage$ = this.playerService.currentPage$;
    private hasNextPage$ = this.playerService.hasNextPage$;
    private hasPreviousPage$ = this.playerService.hasPreviousPage$;

    players = toSignal(this.players$, { initialValue: [] as Player[] });
    loading = toSignal(this.loading$, { initialValue: false });
    error = toSignal(this.error$, { initialValue: null as string | null });
    currentPage = toSignal(this.currentPage$, { initialValue: 1 });
    hasNextPage = toSignal(this.hasNextPage$, { initialValue: false });
    hasPreviousPage = toSignal(this.hasPreviousPage$, { initialValue: false });

    // Available databases
    databases: PlayerDatabase[] = ['invasion', 'pacific', 'prereset_invasion'];

    // Local component state with signals
    selectedDatabase = signal<PlayerDatabase>('invasion');
    filter = signal<PlayerFilter>({});
    sort = signal<PlayerSort>({ field: 'kills', direction: 'desc' });

    // Computed state
    filteredPlayers = computed(() => {
        const allPlayers = this.players();
        const currentFilter = this.filter();
        const currentSort = this.sort();

        let filtered = this.playerService.filterPlayers(allPlayers, currentFilter);
        filtered = this.playerService.sortPlayers(filtered, currentSort);

        return filtered;
    });

    ngOnInit() {
        this.loadData();
    }

    /**
     * Load players from API
     */
    loadData() {
        this.playerService.fetchPlayers(this.selectedDatabase()).subscribe({
            error: err => console.error('Failed to load players:', err)
        });
    }

    /**
     * Handle database change
     */
    onDatabaseChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.selectedDatabase.set(value as PlayerDatabase);
        this.loadData();
    }

    /**
     * Handle search input change
     */
    onSearchChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.filter.update(f => ({ ...f, search: value || undefined }));
    }

    /**
     * Handle favorites toggle change
     */
    onFavoritesToggleChange(event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.filter.update(f => ({ ...f, isFavorite: checked || undefined }));
    }

    /**
     * Handle sort changes
     */
    onSortChange(field: PlayerSortField) {
        this.sort.update(s => {
            if (s.field === field) {
                return { field, direction: s.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { field, direction: 'desc' };
        });
    }

    /**
     * Toggle favorite status
     */
    async onToggleFavorite(player: Player) {
        await this.settingsService.toggleFavorite(player.id, 'player');
    }

    /**
     * Check if player is favorited
     */
    isFavorite(playerId: string): boolean {
        return this.settingsService.isFavorite(playerId, 'player');
    }

    /**
     * Refresh player list
     */
    onRefresh() {
        this.playerService.clearCache(this.selectedDatabase());
        this.loadData();
    }

    /**
     * Navigate to previous page
     */
    onPreviousPage() {
        const current = this.currentPage();
        if (current > 1) {
            // Reload with previous page
            this.playerService.fetchPlayers(this.selectedDatabase(), current - 1).subscribe({
                error: err => console.error('Failed to load players:', err)
            });
        }
    }

    /**
     * Navigate to next page
     */
    onNextPage() {
        const current = this.currentPage();
        if (this.hasNextPage()) {
            // Reload with next page
            this.playerService.fetchPlayers(this.selectedDatabase(), current + 1).subscribe({
                error: err => console.error('Failed to load players:', err)
            });
        }
    }

    /**
     * Get database display label
     */
    getDatabaseLabel(db: PlayerDatabase): string {
        const keyMap: Record<PlayerDatabase, string> = {
            invasion: 'players.db_invasion',
            pacific: 'players.db_pacific',
            prereset_invasion: 'players.db_prereset'
        };
        const key = keyMap[db] || db;
        return this.translocoService.translate(key);
    }
}
