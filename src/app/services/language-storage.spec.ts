import { DEFAULT_LANG, getInitialLang, storeLang } from './language-storage';

describe('language storage', () => {
  afterEach(() => localStorage.removeItem('portfolio:lang'));

  it('starts in Portuguese for first-time visitors', () => {
    expect(getInitialLang()).toBe(DEFAULT_LANG);
    expect(DEFAULT_LANG).toBe('PT-BR');
  });

  it('remembers the language chosen on a previous visit', () => {
    storeLang('EN');
    expect(getInitialLang()).toBe('EN');
  });

  it('ignores unsupported values saved in the browser', () => {
    localStorage.setItem('portfolio:lang', 'FR');
    expect(getInitialLang()).toBe(DEFAULT_LANG);
  });

  it('falls back to the default and does not throw when storage is blocked', () => {
    spyOn(localStorage, 'getItem').and.throwError('blocked');
    spyOn(localStorage, 'setItem').and.throwError('blocked');

    expect(getInitialLang()).toBe(DEFAULT_LANG);
    expect(() => storeLang('EN')).not.toThrow();
  });
});
