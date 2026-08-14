import { Pipe, PipeTransform } from '@angular/core';
import { highlightTerm } from '../utils/highlight.utils';

/**
 * Usage: <span [innerHTML]="server.name | highlight: searchTerm()"></span>
 *
 * Returns an escaped HTML string, not a trusted value — Angular's sanitizer
 * still runs over it and allows the highlight span through.
 */
@Pipe({
    name: 'highlight',
    standalone: true,
})
export class HighlightPipe implements PipeTransform {
    transform(
        text: string | null | undefined,
        term: string | null | undefined,
        emptyPlaceholder = '-',
    ): string {
        return highlightTerm(text, term, emptyPlaceholder);
    }
}
