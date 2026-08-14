import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { invoke } from '@tauri-apps/api/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
    PageHeaderComponent,
    SectionTitleComponent,
} from '../../shared/components';
import { VersionCheckService } from '../../core/services/version-check.service';

interface ChangelogEntry {
    version: string;
    date: string;
    bodyHtml: SafeHtml;
}

@Component({
    selector: 'app-about',
    imports: [
        LucideAngularModule,
        TranslocoDirective,
        PageHeaderComponent,
        SectionTitleComponent,
    ],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
    private sanitizer = inject(DomSanitizer);
    private versionCheckService = inject(VersionCheckService);

    readonly updateStatus = this.versionCheckService.updateStatus;

    changelogEntries = signal<ChangelogEntry[]>([]);
    changelogLoadFailed = signal(false);

    async ngOnInit(): Promise<void> {
        this.changelogLoadFailed.set(false);

        try {
            const content = await invoke<string>('get_changelog');
            this.changelogEntries.set(await this.parseChangelog(content));
        } catch (error) {
            console.error('Failed to load changelog:', error);
            this.changelogLoadFailed.set(true);
            this.changelogEntries.set([]);
        }
    }

    async onDownloadRelease(): Promise<void> {
        const url = this.updateStatus().releaseUrl;
        if (url) {
            try {
                await invoke('open_releases_url', { url });
            } catch (error) {
                console.error('Failed to open releases page:', error);
            }
        }
    }

    /**
     * Split the changelog markdown by version headings (`## [version] - date`)
     * and render each version body as standalone, sanitized HTML.
     */
    private async parseChangelog(markdown: string): Promise<ChangelogEntry[]> {
        const versionRegex = /^##\s*\[([^\]]+)\]\s*-\s*(.+?)\s*$/;
        const sections: { version: string; date: string; body: string[] }[] =
            [];
        let current: (typeof sections)[number] | null = null;

        for (const line of markdown.split('\n')) {
            const match = line.match(versionRegex);
            if (match) {
                current = { version: match[1], date: match[2], body: [] };
                sections.push(current);
            } else if (current) {
                current.body.push(line);
            }
        }

        return Promise.all(
            sections.map(async (section) => ({
                version: section.version,
                date: section.date,
                bodyHtml: this.sanitizer.bypassSecurityTrustHtml(
                    await marked.parse(section.body.join('\n').trim()),
                ),
            })),
        );
    }
}
