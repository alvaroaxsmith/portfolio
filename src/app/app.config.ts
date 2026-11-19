import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { DEFAULT_LANG, provideAppLanguage } from './core/i18n/language-storage';
import { provideChunkLoadRecovery } from './core/chunk-load/chunk-load-recovery.service';
import { provideAppVersion } from './core/version/app-version';

export const appConfig: ApplicationConfig = {
  providers: [
    // No zone.js: every component is OnPush and driven by signals, which schedule the rendering themselves.
    provideZonelessChangeDetection(),
    // A new page starts at the top (and Back restores where the visitor was), instead of keeping the old scroll.
    // Once the first page is on screen, the other pages are downloaded in the background, so the first visit to each
    // one waits for no code. Mermaid stays out: it is only downloaded when the career journey opens.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withPreloading(PreloadAllModules)
    ),
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
