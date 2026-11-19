import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getInitialLang, storeLang } from './language-storage';

/** Keeps <html lang> on the language in use, and remembers the language a visitor switches to. */
export function provideDocumentLanguage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const root = inject(DOCUMENT).documentElement;
      const apply = (lang: string) => (root.lang = lang === 'PT-BR' ? 'pt-BR' : 'en');

      let language = getInitialLang();
      apply(language);
      translate.onLangChange.subscribe(({ lang }) => {
        apply(lang);
        // Only a switch is remembered: a first visit stays without a stored choice.
        if (lang !== language) {
          storeLang(lang);
          language = lang;
        }
      });
    })
  ]);
}
