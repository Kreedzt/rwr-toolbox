import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';
import { HttpClientService } from '../../../core/services/http-client.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CacheService } from '../../../core/services/cache.service';
import {
    RawPlayerData,
    Player,
    PlayerListResponse,
    PlayerFilter,
    PlayerSort,
    PlayerDatabase
} from '../../../shared/models/player.models';

/**
 * Service for fetching and managing player data
 */
@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private httpClient = inject(HttpClientService);
    private settingsService = inject(SettingsService);
    private cacheService = inject(CacheService);

    private readonly CACHE_KEY_PREFIX = 'players_list_';
    private readonly BASE_URL = 'http://rwr.runningwithrifles.com/rwr_stats/view_players.php';

    // State management with BehaviorSubjects
    private playersSubject = new BehaviorSubject<Player[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);
    private currentPageSubject = new BehaviorSubject<number>(1);
    private hasNextPageSubject = new BehaviorSubject<boolean>(false);
    private hasPreviousPageSubject = new BehaviorSubject<boolean>(false);

    /** Observable streams */
    readonly players$ = this.playersSubject.asObservable();
    readonly loading$ = this.loadingSubject.asObservable();
    readonly error$ = this.errorSubject.asObservable();
    readonly currentPage$ = this.currentPageSubject.asObservable();
    readonly hasNextPage$ = this.hasNextPageSubject.asObservable();
    readonly hasPreviousPage$ = this.hasPreviousPageSubject.asObservable();

    /**
     * Fetch players from API
     * @param database Player database to query
     * @param page Page number
     * @param pageSize Number of results per page
     * @param sortBy Sort field
     * @param forceRefresh Force refresh from API
     * @returns Observable of player list response
     */
    fetchPlayers(
        database: PlayerDatabase = 'invasion',
        page: number = 1,
        pageSize: number = 100,
        sortBy: string = 'rank_progression',
        forceRefresh = false
    ): Observable<PlayerListResponse> {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);

        const params = new URLSearchParams({
            db: database,
            sort: sortBy,
            search: ''
        });

        const url = `${this.BASE_URL}?${params.toString()}`;

        return this.httpClient.get<string>(url, {
            timeout: this.settingsService.settings().pingTimeout,
            withCacheBuster: true,
            responseType: 'text'
        }).pipe(
            map(html => this.parsePlayerList(html)),
            tap(response => {
                this.playersSubject.next(response.players);
                this.currentPageSubject.next(page);
                this.hasNextPageSubject.next(response.hasNextPage);
                this.hasPreviousPageSubject.next(response.hasPreviousPage);
                this.loadingSubject.next(false);

                // Cache the response
                this.cacheService.set(`${this.CACHE_KEY_PREFIX}${database}`, {
                    players: response.players,
                    timestamp: Date.now()
                });
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                this.errorSubject.next(error.message);

                // Try to load from cache
                const cached = this.cacheService.get<{ players: Player[]; timestamp: number }>(`${this.CACHE_KEY_PREFIX}${database}`);
                if (cached) {
                    console.log('Using cached player data');
                    this.playersSubject.next(cached.players);
                    return of({
                        players: cached.players,
                        currentPage: page,
                        hasNextPage: false,
                        hasPreviousPage: page > 1,
                        timestamp: cached.timestamp,
                        fromCache: true
                    });
                }

                return throwError(() => error);
            }),
            shareReplay(1)
        );
    }

    /**
     * Parse HTML response into Player objects
     * @param html HTML string from API
     * @returns Parsed player list response
     */
    private parsePlayerList(html: string): PlayerListResponse {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Check for pagination links
        const hasNextPage = this.checkPaginationLink(doc, 'Next');
        const hasPreviousPage = this.checkPaginationLink(doc, 'Previous');

        const rows = doc.querySelectorAll('table tr');
        const players: Player[] = [];

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');

            if (cells.length < 13) continue;

            const rawData: RawPlayerData = {
                row_number: this.extractText(cells[0].textContent),
                username: this.extractText(cells[1].textContent),
                kills: this.extractText(cells[2].textContent),
                deaths: this.extractText(cells[3].textContent),
                score: this.extractText(cells[4].textContent),
                kd: this.extractText(cells[5].textContent),
                time_played: this.extractText(cells[6].textContent),
                longest_kill_streak: this.extractText(cells[7].textContent),
                targets_destroyed: this.extractText(cells[8].textContent),
                vehicles_destroyed: this.extractText(cells[9].textContent),
                soldiers_healed: this.extractText(cells[10].textContent),
                teamkills: this.extractText(cells[11].textContent),
                distance_moved: this.extractText(cells[12].textContent)
            };

            players.push(this.parsePlayer(rawData));
        }

        return {
            players,
            currentPage: 1,
            hasNextPage,
            hasPreviousPage,
            timestamp: Date.now(),
            fromCache: false
        };
    }

    /**
     * Check if pagination link exists
     * @param doc Parsed HTML document
     * @param text Link text to find
     * @returns True if link exists
     */
    private checkPaginationLink(doc: Document, text: string): boolean {
        const links = doc.querySelectorAll('a');
        for (let i = 0; i < links.length; i++) {
            if (links[i].textContent?.trim() === text) {
                return true;
            }
        }
        return false;
    }

    /**
     * Parse raw player data into typed Player object
     * @param raw Raw player data
     * @returns Parsed player object
     */
    private parsePlayer(raw: RawPlayerData): Player {
        return {
            id: raw.username,
            username: raw.username,
            kills: parseInt(raw.kills) || 0,
            deaths: parseInt(raw.deaths) || 0,
            score: parseInt(raw.score) || 0,
            kd: parseFloat(raw.kd) || 0,
            timePlayed: this.parseTimeToSeconds(raw.time_played),
            timePlayedFormatted: raw.time_played,
            longestKillStreak: parseInt(raw.longest_kill_streak) || 0,
            targetsDestroyed: parseInt(raw.targets_destroyed) || 0,
            vehiclesDestroyed: parseInt(raw.vehicles_destroyed) || 0,
            soldiersHealed: parseInt(raw.soldiers_healed) || 0,
            teamkills: parseInt(raw.teamkills) || 0,
            distanceMoved: this.parseDistanceToMeters(raw.distance_moved)
        };
    }

    /**
     * Filter players based on criteria
     * @param players Player list to filter
     * @param filter Filter criteria
     * @returns Filtered player list
     */
    filterPlayers(players: Player[], filter: PlayerFilter): Player[] {
        return players.filter(player => {
            // Search filter
            if (filter.search) {
                const search = filter.search.toLowerCase();
                if (!player.username.toLowerCase().includes(search)) {
                    return false;
                }
            }

            // Kills filters
            if (filter.minKills !== undefined && player.kills < filter.minKills) {
                return false;
            }
            if (filter.maxKills !== undefined && player.kills > filter.maxKills) {
                return false;
            }

            // K/D filter
            if (filter.minKd !== undefined && player.kd < filter.minKd) {
                return false;
            }

            // Time played filter
            if (filter.minTimePlayed !== undefined && player.timePlayed < filter.minTimePlayed) {
                return false;
            }

            // Favorites filter
            if (filter.isFavorite) {
                if (!this.settingsService.isFavorite(player.id, 'player')) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Sort players
     * @param players Player list to sort
     * @param sort Sort configuration
     * @returns Sorted player list
     */
    sortPlayers(players: Player[], sort: PlayerSort): Player[] {
        return [...players].sort((a, b) => {
            let comparison = 0;

            switch (sort.field) {
                case 'username':
                    comparison = a.username.localeCompare(b.username);
                    break;
                case 'kills':
                    comparison = b.kills - a.kills;
                    break;
                case 'deaths':
                    comparison = b.deaths - a.deaths;
                    break;
                case 'kd':
                    comparison = b.kd - a.kd;
                    break;
                case 'timePlayed':
                    comparison = b.timePlayed - a.timePlayed;
                    break;
                case 'score':
                    comparison = b.score - a.score;
                    break;
            }

            return sort.direction === 'desc' ? -comparison : comparison;
        });
    }

    /**
     * Clear player cache
     * @param database Specific database to clear, or all if undefined
     */
    clearCache(database?: PlayerDatabase): void {
        if (database) {
            this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${database}`);
        } else {
            // Clear all player caches
            ['invasion', 'pacific', 'prereset_invasion'].forEach(db => {
                this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${db}`);
            });
        }
    }

    // Helper methods

    private extractText(text: string | null): string {
        return text?.trim() ?? '';
    }

    private parseTimeToSeconds(text: string): number {
        // Format: "123h 45m" or similar
        const hoursMatch = text.match(/(\d+)h/);
        const minutesMatch = text.match(/(\d+)m/);

        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

        return (hours * 3600) + (minutes * 60);
    }

    private parseDistanceToMeters(text: string): number {
        // Format: "12.5 km" or "12500 m"
        const kmMatch = text.match(/([\d.]+)\s*km/i);
        const mMatch = text.match(/([\d.]+)\s*m/i);

        if (kmMatch) {
            return parseFloat(kmMatch[1]) * 1000;
        }
        if (mMatch) {
            return parseFloat(mMatch[1]);
        }

        return 0;
    }
}
