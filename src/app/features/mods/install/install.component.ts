import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { ModService } from '../services/mod.service';
import {
    ModReadInfo,
    ModInstallOptions,
} from '../../../shared/models/mod.models';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';

@Component({
    selector: 'app-install',
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        TranslocoDirective,
        MarkdownPipe,
    ],
    templateUrl: './install.component.html',
})
export class InstallComponent implements OnInit {
    private modService = inject(ModService);

    readonly loading = this.modService.loadingSig;
    readonly error = this.modService.errorSig;

    activeStep = 0;
    selectedFilePath: string | null = null;
    modInfo: ModReadInfo | null = null;

    readonly steps = [0, 1, 2] as const;

    installOptions: ModInstallOptions = {
        backup: true,
        overwrite: false,
    };

    showFileList = false;
    showReadme = false;
    showChangelog = false;

    ngOnInit(): void {
        const pendingPath = this.modService.pendingReinstallPathSig();
        if (pendingPath) {
            this.modService.setPendingReinstallPath(null);
            this.modService.readModInfo(pendingPath).subscribe({
                next: (info) => {
                    this.modInfo = info;
                    this.selectedFilePath = pendingPath;
                    this.activeStep = 1;
                },
                error: (err) => {
                    console.error('Failed to read pending reinstall mod:', err);
                },
            });
            return;
        }

        if (!this.modService.getGamePath()) {
            // Could redirect to settings or show a warning
        }
    }

    onSelectFile(): void {
        this.modService.selectAndReadModFile().subscribe({
            next: (result) => {
                this.modInfo = result.info;
                this.selectedFilePath = result.path;
                this.activeStep = 1;
            },
            error: (err) => {
                console.error('Failed to select file:', err);
            },
        });
    }

    onInstall(): void {
        if (!this.selectedFilePath) {
            return;
        }

        const targetPath = this.modService.getTargetPath();
        if (!targetPath) {
            alert('Game path not configured. Please set it in Settings first.');
            return;
        }

        this.modService
            .installMod(this.selectedFilePath, targetPath, this.installOptions)
            .subscribe({
                next: () => {
                    alert('Mod installed successfully!');
                    this.reset();
                },
                error: (err) => {
                    console.error('Installation failed:', err);
                },
            });
    }

    onBackup(): void {
        if (!this.selectedFilePath || !this.modInfo) {
            return;
        }

        const targetPath = this.modService.getTargetPath();
        if (!targetPath) {
            alert('Game path not configured. Please set it in Settings first.');
            return;
        }

        this.modService
            .makeBackup(
                this.selectedFilePath,
                this.modInfo.file_path_list,
                targetPath,
            )
            .subscribe({
                next: (backupPath) => {
                    alert(`Backup created at: ${backupPath}`);
                },
                error: (err) => {
                    console.error('Backup failed:', err);
                },
            });
    }

    onRecover(): void {
        const targetPath = this.modService.getTargetPath();
        if (!targetPath) {
            alert('Game path not configured. Please set it in Settings first.');
            return;
        }

        if (
            !confirm('This will replace current files with backup. Continue?')
        ) {
            return;
        }

        this.modService.recoverBackup(targetPath).subscribe({
            next: () => {
                alert('Backup recovered successfully!');
            },
            error: (err) => {
                console.error('Recover failed:', err);
            },
        });
    }

    onNext(): void {
        if (this.activeStep < this.steps.length - 1) {
            this.activeStep++;
        }
    }

    onPrev(): void {
        if (this.activeStep > 0) {
            this.activeStep--;
        }
    }

    reset(): void {
        this.activeStep = 0;
        this.selectedFilePath = null;
        this.modInfo = null;
        this.showFileList = false;
        this.showReadme = false;
        this.showChangelog = false;
        this.modService.clearError();
    }

    toggleFileList(): void {
        this.showFileList = !this.showFileList;
        if (this.showFileList) {
            this.showReadme = false;
            this.showChangelog = false;
        }
    }

    toggleReadme(): void {
        this.showReadme = !this.showReadme;
        if (this.showReadme) {
            this.showFileList = false;
            this.showChangelog = false;
        }
    }

    toggleChangelog(): void {
        this.showChangelog = !this.showChangelog;
        if (this.showChangelog) {
            this.showFileList = false;
            this.showReadme = false;
        }
    }

    closeModals(): void {
        this.showFileList = false;
        this.showReadme = false;
        this.showChangelog = false;
    }

    get gamePath(): string | undefined {
        return this.modService.getGamePath();
    }

    get isGamePathConfigured(): boolean {
        return !!this.modService.getGamePath();
    }
}
