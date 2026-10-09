import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

export const SUPPORTED_LANGS = ['EN', 'PT-BR'];
export const DEFAULT_LANG = 'PT-BR';
const STORAGE_KEY = 'portfolio:lang';

export function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
  } catch {
  }
  return DEFAULT_LANG;
}

export function storeLang(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
  }
}

/** Loads the visitor's language before the app renders, so the first paint is already translated. */
export function provideAppLanguage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.addLangs(SUPPORTED_LANGS);
      translate.setDefaultLang(DEFAULT_LANG);
      return lastValueFrom(translate.use(getInitialLang()));
    })
  ]);
}
