import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionTitleComponent } from '../section-title/section-title.component';

/**
 * The panel of search and filter controls that sits above a data table.
 * Layout only — every page keeps its own fields.
 *
 * Wrap each field in a <label class="fieldset-label"> + control pair; the
 * grid here gives them a consistent column rhythm.
 */
@Component({
    selector: 'app-filter-toolbar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SectionTitleComponent],
    template: `
        <section class="rounded-box border border-base-300 bg-base-200 p-4">
            @if (labelKey()) {
                <app-section-title [labelKey]="labelKey()" icon="search" />
            }
            <div
                class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
                [class.mt-3]="labelKey()"
            >
                <ng-content />
            </div>
        </section>
    `,
})
export class FilterToolbarComponent {
    readonly labelKey = input<string>('');
}
