import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { DEFAULT_LANG, provideAppLanguage } from './core/i18n/language-storage';
import { provideChunkLoadRecovery } from './core/chunk-load/chunk-load-recovery.service';
import { provideAppVersion } from './core/version/app-version';

export const appConfig: ApplicationConfig = {
  providers: [
    // The app still relies on zone.js for change detection; going zoneless is a separate decision (Q-03).
    provideZoneChangeDetection(),
    // A new page starts at the top (and Back restores where the visitor was), instead of keeping the old scroll.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    // Portuguese fills in any key missing from the visitor's language; the language itself is set by
    // provideAppLanguage, which waits for it before the first render.
    provideTranslateService({ fallbackLang: DEFAULT_LANG }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideAppLanguage(),
    provideChunkLoadRecovery(),
    provideAppVersion()
  ]
};
