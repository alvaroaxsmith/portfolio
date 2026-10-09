import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { provideAppLanguage } from './core/i18n/language-storage';
import { provideChunkLoadRecovery } from './core/chunk-load/chunk-load-recovery.service';

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // The app still relies on zone.js for change detection; going zoneless is a separate decision (Q-03).
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: httpTranslateLoader, deps: [HttpClient] }
      })
    ),
    provideAppLanguage(),
    provideChunkLoadRecovery()
  ]
};
