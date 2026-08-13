import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

/**
 * The single h1 of a page, with an optional action group projected on the right.
 *
 *   <app-page-header titleKey="servers.title" icon="server">
 *       <div actions class="join">…</div>
 *   </app-page-header>
 */
@Component({
    selector: 'app-page-header',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, TranslocoPipe],
    template: `
        <!-- Separated by space, not a rule: the title is already the loudest
             thing on the page, and a border here would run parallel to the
             first card's own border a few pixels below it. pb-4 plus the
             page's space-y-4 puts 32px under the header against 16px between
             content blocks, so the header reads as its own group. -->
        <header class="flex flex-wrap items-start justify-between gap-3 pb-4">
            <div class="min-w-0">
                <h1
                    class="flex items-center gap-2 text-xl font-bold sm:text-2xl"
                >
                    @if (icon()) {
                        <i-lucide
                            [name]="icon()"
                            class="h-5 w-5 shrink-0 text-primary"
                        ></i-lucide>
                    }
                    <span class="truncate">{{ titleKey() | transloco }}</span>
                </h1>
                @if (descriptionKey()) {
                    <p class="mt-1 max-w-[65ch] text-sm text-base-content/70">
                        {{ descriptionKey() | transloco }}
                    </p>
                }
            </div>
            <div class="flex shrink-0 items-center gap-2">
                <ng-content select="[actions]" />
            </div>
        </header>
    `,
})
export class PageHeaderComponent {
    readonly titleKey = input.required<string>();
    readonly icon = input<string>('');
    readonly descriptionKey = input<string>('');
}
