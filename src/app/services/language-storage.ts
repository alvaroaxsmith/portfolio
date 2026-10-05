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
