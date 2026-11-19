import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { DEFAULT_LANG, getInitialLang } from '../i18n/language-storage';
import { AnalyticsService } from './analytics.service';

/** A page view on every navigation, and a `language_switch` event when the visitor changes language. */
export function providePageViews(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const router = inject(Router);
      const analytics = inject(AnalyticsService);
      const translate = inject(TranslateService);
      const document = inject(DOCUMENT);

      router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        // The router sets the new page's title right after NavigationEnd, so it is read once that is done.
        queueMicrotask(() =>
          analytics.pageView(router.url.split(/[?#]/)[0], document.title, translate.getCurrentLang() ?? DEFAULT_LANG)
        );
      });

      let language = getInitialLang();
      translate.onLangChange.subscribe(({ lang }) => {
        if (lang !== language) {
          analytics.track('language_switch', { from: language, to: lang });
          language = lang;
        }
      });
    })
  ]);
}
