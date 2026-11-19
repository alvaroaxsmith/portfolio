import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { readStorage, writeStorage } from '../storage/safe-storage';

export const SUPPORTED_LANGS = ['EN', 'PT-BR'];
export const DEFAULT_LANG = 'PT-BR';
const STORAGE_KEY = 'portfolio:lang';

export function getInitialLang(): string {
  const stored = readStorage(STORAGE_KEY);
  return stored && SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
}

export function storeLang(lang: string): void {
  writeStorage(STORAGE_KEY, lang);
}

/** Loads the visitor's language before the app renders, so the first paint is already translated. */
export function provideAppLanguage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.addLangs(SUPPORTED_LANGS);
      translate.setFallbackLang(DEFAULT_LANG);
      return lastValueFrom(translate.use(getInitialLang()));
    })
  ]);
}
