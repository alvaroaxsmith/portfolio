import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANG, SUPPORTED_LANGS, getInitialLang, provideAppLanguage, storeLang } from './language-storage';

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

describe('provideAppLanguage', () => {
  afterEach(() => localStorage.removeItem('portfolio:lang'));

  async function boot(): Promise<TranslateService> {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideAppLanguage()]
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    return TestBed.inject(TranslateService);
  }

  it('loads Portuguese before the app starts for first-time visitors', async () => {
    const translate = await boot();

    expect(translate.currentLang).toBe('PT-BR');
    expect(translate.defaultLang).toBe('PT-BR');
  });

  it('loads the language chosen on a previous visit before the app starts', async () => {
    storeLang('EN');

    const translate = await boot();

    expect(translate.currentLang).toBe('EN');
  });

  it('offers every supported language', async () => {
    const translate = await boot();

    expect(translate.getLangs()).toEqual(SUPPORTED_LANGS);
  });
});
