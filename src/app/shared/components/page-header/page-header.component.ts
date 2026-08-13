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
        <header
            class="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 pb-3"
        >
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
