/**
 * Classes applied to a matched search term. Kept as a constant so the four
 * pages that highlight results stay in sync, and so the colour comes from the
 * theme rather than a hardcoded palette value.
 */
export const HIGHLIGHT_MARK_CLASS = 'bg-warning/40 rounded-selector px-px';

export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Wraps every case-insensitive occurrence of `term` in a highlight span.
 * All non-markup content is escaped, so the result is safe for [innerHTML].
 */
export function highlightTerm(
    text: string | null | undefined,
    term: string | null | undefined,
    emptyPlaceholder = '-',
): string {
    const raw = (text ?? '').toString();
    if (!raw) return emptyPlaceholder;

    const query = (term ?? '').trim();
    if (!query) return escapeHtml(raw);

    const matcher = new RegExp(escapeRegExp(query), 'gi');
    let result = '';
    let lastIndex = 0;

    for (const match of raw.matchAll(matcher)) {
        const index = match.index ?? 0;
        const matched = match[0] ?? '';
        result += escapeHtml(raw.slice(lastIndex, index));
        result += `<span class="${HIGHLIGHT_MARK_CLASS}">${escapeHtml(matched)}</span>`;
        lastIndex = index + matched.length;
    }

    result += escapeHtml(raw.slice(lastIndex));
    return result || escapeHtml(raw);
}
