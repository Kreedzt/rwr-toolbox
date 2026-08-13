import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { EmptyStateComponent } from '../shared/components';

@Component({
    selector: 'app-notfound',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EmptyStateComponent, RouterLink, TranslocoPipe],
    templateUrl: './notfound.component.html',
})
export class NotfoundComponent {}
