import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

/**
 * "Nothing here" placeholder. `sm` fits inside a card, `lg` fills a page.
 * Project a call to action into the [action] slot when the user can fix the
 * emptiness themselves (configure a path, clear a filter).
 */
@Component({
    selector: 'app-empty-state',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, TranslocoPipe],
    template: `
        <div
            class="flex flex-col items-center justify-center text-center"
            [class]="paddingClass()"
        >
            <i-lucide
                [name]="icon()"
                class="mb-3 text-base-content/30"
                [class]="iconClass()"
            ></i-lucide>
            <p
                class="font-medium text-base-content/70"
                [class]="messageClass()"
            >
                {{ messageKey() | transloco }}
            </p>
            @if (descriptionKey()) {
                <p class="mt-1 max-w-[45ch] text-sm text-base-content/50">
                    {{ descriptionKey() | transloco }}
                </p>
            }
            <!-- Collapses when nothing is projected, so the spacing below the
                 text only exists when there is an action. -->
            <div class="mt-4 empty:hidden">
                <ng-content select="[action]" />
            </div>
        </div>
    `,
})
export class EmptyStateComponent {
    readonly icon = input<string>('inbox');
    readonly messageKey = input.required<string>();
    readonly descriptionKey = input<string>('');
    readonly size = input<EmptyStateSize>('md');

    protected readonly paddingClass = computed(
        () => ({ sm: 'py-8', md: 'py-12', lg: 'py-20' })[this.size()],
    );

    protected readonly iconClass = computed(
        () =>
            ({ sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' })[this.size()],
    );

    protected readonly messageClass = computed(
        () => ({ sm: 'text-sm', md: 'text-base', lg: 'text-lg' })[this.size()],
    );
}
