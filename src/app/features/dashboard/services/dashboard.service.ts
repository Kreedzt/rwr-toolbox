import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, map, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { ServerService } from '../../servers/services/server.service';
import { PlayerService } from '../../players/services/player.service';
import { SettingsService } from '../../../core/services/settings.service';
import { PingService } from '../../../core/services/ping.service';

/**
 * Dashboard statistics
 */
export interface DashboardStats {
    serverCount: number;
    playerCount: number;
    modCount: number;
    apiStatus: 'online' | 'offline' | 'loading';
    lastUpdate: number;
}

/**
 * Activity log entry
 */
export interface Activity {
    id: string;
    type: 'server' | 'player' | 'mod' | 'system';
    title: string;
    description: string;
    timestamp: number;
    icon: string;
}

/**
 * System status information
 */
export interface SystemStatus {
    apiConnected: boolean;
    apiPing: number | null;
    cacheEnabled: boolean;
    gamePathConfigured: boolean;
    lastUpdate: number;
}

/**
 * Service for aggregating dashboard data from multiple sources
 */
@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private serverService = inject(ServerService);
    private playerService = inject(PlayerService);
    private settingsService = inject(SettingsService);
    private pingService = inject(PingService);

    // State management with signals (Principle IX: Signal管状态)
    private activitiesState = signal<Activity[]>([]);
    private apiStatusState = signal<'online' | 'offline' | 'loading'>(
        'loading',
    );

    readonly activitiesSig = this.activitiesState.asReadonly();
    readonly apiStatusSig = this.apiStatusState.asReadonly();

    /**
     * Get aggregated dashboard statistics
     */
    getStats$(): Observable<DashboardStats> {
        return combineLatest([
            toObservable(this.serverService.serversSig),
            toObservable(this.apiStatusSig),
        ]).pipe(
            map(([servers, apiStatus]) => {
                const serverCount = servers.length;
                const playerCount = servers.reduce(
                    (sum: number, s: any) => sum + s.currentPlayers,
                    0,
                );

                return {
                    serverCount,
                    playerCount,
                    modCount: 0, // TODO: Implement mod counting
                    apiStatus,
                    lastUpdate: Date.now(),
                };
            }),
        );
    }

    /**
     * Get recent activities
     */
    getRecentActivities$(): Observable<Activity[]> {
        return toObservable(this.activitiesSig);
    }

    /**
     * Get system status
     */
    getSystemStatus$(): Observable<SystemStatus> {
        return toObservable(this.apiStatusSig).pipe(
            map((apiStatus) => ({
                apiConnected: apiStatus === 'online',
                apiPing: null, // TODO: Track actual ping
                cacheEnabled: true,
                gamePathConfigured: false, // TODO: Check game path from settings
                lastUpdate: Date.now(),
            })),
        );
    }

    /**
     * Add an activity to the log
     */
    addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
        const newActivity: Activity = {
            ...activity,
            id: `activity-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
        };

        const currentActivities = this.activitiesState();
        this.activitiesState.set(
            [newActivity, ...currentActivities].slice(0, 10),
        );
    }

    /**
     * Refresh dashboard data
     */
    refresh(): void {
        this.serverService.fetchServers(true).subscribe({
            next: () => {
                this.apiStatusState.set('online');
            },
            error: () => {
                this.apiStatusState.set('offline');
            },
        });
    }

    /**
     * Initialize dashboard with default activities
     */
    initialize(): void {
        this.activitiesState.set([
            {
                id: 'activity-welcome',
                type: 'system',
                title: 'Welcome to RWR Toolbox',
                description: 'Your toolkit is ready to use',
                timestamp: Date.now(),
                icon: 'box',
            },
        ]);

        // Initial refresh
        this.refresh();
    }
}
