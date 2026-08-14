import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
    EmptyStateComponent,
    PageHeaderComponent,
    SectionTitleComponent,
    StatCardComponent,
} from '../../shared/components';
import { DashboardService, Activity } from './services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    imports: [
        CommonModule,
        LucideAngularModule,
        RouterLink,
        TranslocoDirective,
        EmptyStateComponent,
        PageHeaderComponent,
        SectionTitleComponent,
        StatCardComponent,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);

    stats = this.dashboardService.stats;
    activities = this.dashboardService.activities;
    systemStatus = this.dashboardService.systemStatus;

    ngOnInit(): void {
        this.dashboardService.initialize();
    }

    ngOnDestroy(): void {
        this.dashboardService.stopPingInterval();
    }

    refresh(): void {
        this.dashboardService.refresh();
    }

    trackActivity(_index: number, activity: Activity): string {
        return activity.id;
    }
}
