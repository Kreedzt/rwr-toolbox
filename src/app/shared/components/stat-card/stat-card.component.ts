import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

/**
 * A single headline number with its label and an optional status line.
 *
 * The number is deliberately not tinted: it is already the loudest thing in
 * the card through size and weight, and colouring each card differently reads
 * as a category difference that does not exist. Colour is left for the [desc]
 * slot, where online/offline actually means something.
 */
@Component({
    selector: 'app-stat-card',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, TranslocoPipe],
    template: `
        <div class="rounded-box border border-base-300 bg-base-100 p-4">
            <div class="flex items-start justify-between gap-2">
                <span
                    class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
                >
                    {{ labelKey() | transloco }}
                </span>
                @if (icon()) {
                    <i-lucide
                        [name]="icon()"
                        class="h-5 w-5 shrink-0 text-base-content/30"
                    ></i-lucide>
                } @else {
                    <ng-content select="[figure]" />
                }
            </div>

            <p class="mt-2 text-2xl leading-none font-bold">
                <ng-content select="[value]" />
            </p>

            <div class="mt-2 text-xs text-base-content/50 empty:hidden">
                <ng-content select="[desc]" />
            </div>
        </div>
    `,
})
export class StatCardComponent {
    readonly labelKey = input.required<string>();
    readonly icon = input<string>('');
}
