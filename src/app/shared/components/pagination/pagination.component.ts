import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

/** Sentinel returned by pageNumbers() for a gap in the page list. */
const ELLIPSIS = -1;

/**
 * Page selector for the data pages. The window is always five slots wide and
 * centred on the current page, with the first and last page pinned.
 *
 * Project counts or a page-size selector into the [info] slot to put them on
 * the same row.
 */
@Component({
    selector: 'app-pagination',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LucideAngularModule, TranslocoPipe],
    template: `
        @if (totalPages() > 1 || hasInfo()) {
            <nav
                class="flex flex-wrap items-center justify-between gap-3"
                [attr.aria-label]="'pagination.label' | transloco"
            >
                <div class="text-sm text-base-content/70">
                    <ng-content select="[info]" />
                </div>

                @if (totalPages() > 1) {
                    <div class="join">
                        <button
                            type="button"
                            class="btn join-item btn-sm"
                            [disabled]="currentPage() <= 1"
                            [attr.aria-label]="'pagination.prev' | transloco"
                            (click)="goTo(currentPage() - 1)"
                        >
                            <i-lucide
                                name="chevron-left"
                                class="h-4 w-4"
                            ></i-lucide>
                        </button>

                        @for (page of pageNumbers(); track $index) {
                            @if (page === ellipsis) {
                                <span
                                    class="btn join-item btn-sm pointer-events-none text-base-content/50"
                                    aria-hidden="true"
                                >
                                    …
                                </span>
                            } @else {
                                <button
                                    type="button"
                                    class="btn join-item btn-sm"
                                    [class.btn-primary]="page === currentPage()"
                                    [attr.aria-current]="
                                        page === currentPage() ? 'page' : null
                                    "
                                    (click)="goTo(page)"
                                >
                                    {{ page }}
                                </button>
                            }
                        }

                        <button
                            type="button"
                            class="btn join-item btn-sm"
                            [disabled]="currentPage() >= totalPages()"
                            [attr.aria-label]="'pagination.next' | transloco"
                            (click)="goTo(currentPage() + 1)"
                        >
                            <i-lucide
                                name="chevron-right"
                                class="h-4 w-4"
                            ></i-lucide>
                        </button>
                    </div>
                }
            </nav>
        }
    `,
})
export class PaginationComponent {
    readonly currentPage = input.required<number>();
    readonly totalPages = input.required<number>();
    /** Slots in the sliding window, excluding the pinned first/last pages. */
    readonly windowSize = input<number>(5);
    /** Set when the [info] slot is used, so the row renders on a single page. */
    readonly hasInfo = input<boolean>(false);

    readonly pageChange = output<number>();

    protected readonly ellipsis = ELLIPSIS;

    protected readonly pageNumbers = computed<number[]>(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const window = this.windowSize();

        if (total <= window) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages: number[] = [1];
        const half = Math.floor(window / 2);
        let start = current - half;
        let end = current + half;

        if (start < 2) {
            end += 2 - start;
            start = 2;
        }
        if (end > total - 1) {
            start -= end - (total - 1);
            end = total - 1;
        }
        start = Math.max(2, start);

        if (start > 2) pages.push(ELLIPSIS);
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < total - 1) pages.push(ELLIPSIS);
        pages.push(total);

        return pages;
    });

    protected goTo(page: number): void {
        if (
            page < 1 ||
            page > this.totalPages() ||
            page === this.currentPage()
        ) {
            return;
        }
        this.pageChange.emit(page);
    }
}
