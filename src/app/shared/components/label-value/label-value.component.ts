import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * One field in a detail panel: a de-emphasised label with the value below it.
 * The value goes through content projection so it can be a badge, a link, or
 * highlighted innerHTML rather than plain text.
 *
 *   <app-label-value labelKey="items.detail.key" mono>
 *       {{ item.key }}
 *   </app-label-value>
 */
@Component({
    selector: 'app-label-value',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslocoPipe],
    template: `
        <div class="min-w-0">
            <span
                class="mb-1 block text-xs font-semibold tracking-wider text-base-content/50 uppercase"
            >
                {{ labelKey() | transloco }}
            </span>
            <div
                class="text-sm"
                [class.font-mono]="mono()"
                [class.truncate]="truncate()"
            >
                <ng-content />
            </div>
        </div>
    `,
})
export class LabelValueComponent {
    readonly labelKey = input.required<string>();
    /** Monospace value — file paths, ids, numeric keys. */
    readonly mono = input<boolean>(false);
    readonly truncate = input<boolean>(false);
}
