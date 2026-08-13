import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Small heading above a card or a block inside one. Carries the whole
 * "section label" role — uppercase with tracking, de-emphasised, never bold
 * enough to compete with the page title.
 *
 * Use the [trailing] slot for a count badge or a link on the same line.
 */
@Component({
    selector: 'app-section-title',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, TranslocoPipe],
    template: `
        <div class="flex items-center justify-between gap-2">
            <h2
                class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-base-content/70 uppercase"
            >
                @if (icon()) {
                    <i-lucide [name]="icon()" class="h-3.5 w-3.5"></i-lucide>
                }
                @if (labelKey()) {
                    {{ labelKey() | transloco }}
                } @else {
                    <ng-content />
                }
            </h2>
            <ng-content select="[trailing]" />
        </div>
    `,
})
export class SectionTitleComponent {
    readonly labelKey = input<string>('');
    readonly icon = input<string>('');
}
