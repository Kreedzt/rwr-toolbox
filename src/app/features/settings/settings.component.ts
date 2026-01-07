import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { SupportedLocale, LOCALES, DEFAULT_LOCALE } from '../../../i18n/locales';

/**
 * Settings component
 * Handles application settings including language switching
 */
@Component({
  selector: 'app-settings',
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  private translocoService = inject(TranslocoService);

  /** Available locales */
  readonly locales = LOCALES;

  /** Default locale */
  readonly defaultLocale = DEFAULT_LOCALE;

  /** Current locale from Transloco */
  get currentLocale(): SupportedLocale {
    return this.translocoService.getActiveLang() as SupportedLocale;
  }

  /**
   * Get the current locale value for select binding
   */
  get localeValue(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Change the application language
   * Stores preference and updates Transloco active language
   * @param event Change event from select element
   */
  onLocaleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      this.changeLocale(target.value as SupportedLocale);
    }
  }

  /**
   * Change the application language
   * Stores preference in localStorage and updates Transloco
   * @param locale New locale to set
   */
  changeLocale(locale: SupportedLocale): void {
    // Store locale preference in localStorage
    localStorage.setItem('locale', locale);

    // Update Transloco active language (runtime switch)
    this.translocoService.setActiveLang(locale);
  }
}
