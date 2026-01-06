import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

import { routes } from './app.routes';
import { APP_ICONS } from './shared/icons';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        {
            provide: LUCIDE_ICONS,
            multi: true,
            useValue: new LucideIconProvider(APP_ICONS)
        }
    ],
};
