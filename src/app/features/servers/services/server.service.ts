import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';
import { HttpClientService } from '../../../core/services/http-client.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CacheService } from '../../../core/services/cache.service';
import {
    RawServerData,
    Server,
    ServerListResponse,
    ServerFilter,
    ServerSort
} from '../../../shared/models/server.models';

/**
 * Service for fetching and managing server data
 */
@Injectable({
    providedIn: 'root'
})
export class ServerService {
    private httpClient = inject(HttpClientService);
    private settingsService = inject(SettingsService);
    private cacheService = inject(CacheService);

    private readonly CACHE_KEY = 'servers_list';
    private readonly BASE_URL = 'http://rwr.runningwithrifles.com/rwr_server_list/view_servers.php';

    // State management with BehaviorSubjects
    private serversSubject = new BehaviorSubject<Server[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    /** Observable streams */
    readonly servers$ = this.serversSubject.asObservable();
    readonly loading$ = this.loadingSubject.asObservable();
    readonly error$ = this.errorSubject.asObservable();

    /**
     * Fetch all servers from API
     * @param forceRefresh Force refresh from API, ignore cache
     * @returns Observable of server list response
     */
    fetchServers(forceRefresh = false): Observable<ServerListResponse> {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);

        return this.httpClient.get<string>(this.BASE_URL, {
            timeout: this.settingsService.settings().pingTimeout,
            responseType: 'text'
        }).pipe(
            map(html => this.parseServerList(html)),
            tap(response => {
                this.serversSubject.next(response.servers);
                this.loadingSubject.next(false);

                // Cache the response
                this.cacheService.set(this.CACHE_KEY, {
                    servers: response.servers,
                    timestamp: Date.now()
                });
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                this.errorSubject.next(error.message);

                // Try to load from cache
                const cached = this.cacheService.get<{ servers: Server[]; timestamp: number }>(this.CACHE_KEY);
                if (cached) {
                    console.log('Using cached server data');
                    this.serversSubject.next(cached.servers);
                    return of({
                        servers: cached.servers,
                        timestamp: cached.timestamp,
                        totalCount: cached.servers.length,
                        fromCache: true
                    });
                }

                return throwError(() => error);
            }),
            shareReplay(1)
        );
    }

    /**
     * Parse HTML response into Server objects
     * @param html HTML string from API
     * @returns Parsed server list response
     */
    private parseServerList(html: string): ServerListResponse {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('table tr');

        const servers: Server[] = [];
        const timestamp = Date.now();

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');

            if (cells.length < 14) continue;

            const rawData: RawServerData = {
                row_number: this.extractNumber(cells[0].textContent),
                name: this.extractText(cells[1].textContent),
                address: this.extractText(cells[2].textContent),
                port: this.extractText(cells[3].textContent),
                country: this.extractText(cells[4].textContent),
                map: this.extractText(cells[5].textContent),
                player_count: this.extractText(cells[6].textContent),
                bot_count: this.extractText(cells[7].textContent),
                version: this.extractText(cells[8].textContent),
                last_update: this.extractText(cells[9].textContent),
                steam: cells[10].innerHTML,
                player_names: this.extractText(cells[11].textContent),
                comment: this.extractText(cells[12].textContent),
                reachable: this.extractText(cells[13].textContent)
            };

            servers.push(this.parseServer(rawData));
        }

        return {
            servers,
            timestamp,
            totalCount: servers.length,
            fromCache: false
        };
    }

    /**
     * Parse raw server data into typed Server object
     * @param raw Raw server data
     * @returns Parsed server object
     */
    private parseServer(raw: RawServerData): Server {
        const [currentPlayers, maxPlayers] = this.parsePlayerCount(raw.player_count);
        const lastUpdateSeconds = this.parseTimeToSeconds(raw.last_update);

        // Extract steam link
        const steamLinkMatch = raw.steam.match(/href="([^"]+)"/);
        const steamLink = steamLinkMatch ? steamLinkMatch[1] : '';

        return {
            id: `${raw.address}:${raw.port}`,
            name: raw.name,
            address: raw.address,
            port: parseInt(raw.port) || 0,
            country: raw.country,
            map: raw.map,
            currentPlayers,
            maxPlayers,
            botCount: parseInt(raw.bot_count) || 0,
            version: raw.version,
            lastUpdate: raw.last_update,
            lastUpdateSeconds,
            steamLink,
            playerNames: raw.player_names.split(',').map(n => n.trim()).filter(n => n),
            comment: raw.comment,
            isReachable: raw.reachable === '1'
        };
    }

    /**
     * Filter servers based on criteria
     * @param servers Server list to filter
     * @param filter Filter criteria
     * @returns Filtered server list
     */
    filterServers(servers: Server[], filter: ServerFilter): Server[] {
        return servers.filter(server => {
            // Search filter
            if (filter.search) {
                const search = filter.search.toLowerCase();
                const matchesName = server.name.toLowerCase().includes(search);
                const matchesMap = server.map.toLowerCase().includes(search);
                const matchesCountry = server.country.toLowerCase().includes(search);
                if (!matchesName && !matchesMap && !matchesCountry) {
                    return false;
                }
            }

            // Country filter
            if (filter.country && server.country !== filter.country) {
                return false;
            }

            // Map filter
            if (filter.map && server.map !== filter.map) {
                return false;
            }

            // Player count filters
            if (filter.minPlayers !== undefined && server.currentPlayers < filter.minPlayers) {
                return false;
            }
            if (filter.maxPlayers !== undefined && server.currentPlayers > filter.maxPlayers) {
                return false;
            }

            // Available slots filter
            if (filter.hasAvailableSlots && server.currentPlayers >= server.maxPlayers) {
                return false;
            }

            // Favorites filter
            if (filter.isFavorite) {
                if (!this.settingsService.isFavorite(server.id, 'server')) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Sort servers
     * @param servers Server list to sort
     * @param sort Sort configuration
     * @returns Sorted server list
     */
    sortServers(servers: Server[], sort: ServerSort): Server[] {
        return [...servers].sort((a, b) => {
            let comparison = 0;

            switch (sort.field) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'playerCount':
                    comparison = b.currentPlayers - a.currentPlayers;
                    break;
                case 'ping':
                    const aPing = a.ping ?? Infinity;
                    const bPing = b.ping ?? Infinity;
                    comparison = aPing - bPing;
                    break;
                case 'lastUpdate':
                    comparison = a.lastUpdateSeconds - b.lastUpdateSeconds;
                    break;
                case 'country':
                    comparison = a.country.localeCompare(b.country);
                    break;
            }

            return sort.direction === 'desc' ? -comparison : comparison;
        });
    }

    /**
     * Clear server cache
     */
    clearCache(): void {
        this.cacheService.delete(this.CACHE_KEY);
    }

    // Helper methods

    private extractText(text: string | null): string {
        return text?.trim() ?? '';
    }

    private extractNumber(text: string | null): number {
        return parseInt(text?.trim() ?? '0') || 0;
    }

    private parsePlayerCount(text: string): [number, number] {
        const [current, max] = text.split('/').map(n => parseInt(n) || 0);
        return [current, max];
    }

    private parseTimeToSeconds(text: string): number {
        const match = text.match(/(\d+)([smhd])/);
        if (!match) return 0;

        const value = parseInt(match[1]);
        const unit = match[2];

        const conversions: Record<string, number> = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400
        };

        return value * (conversions[unit] || 0);
    }
}
