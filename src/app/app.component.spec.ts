import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { AnalyticsService } from './core/analytics/analytics.service';
import { SeoService } from './core/seo/seo.service';
import { provideAppLanguage } from './core/i18n/language-storage';
import { provideDocumentLanguage } from './core/i18n/document-language';
import { provideSeo } from './core/seo/seo-title-strategy';
import { providePageViews } from './core/analytics/page-views';
import { provideFocusOnNavigation } from './core/a11y/focus-on-navigation';

@Component({ template: '', standalone: true })
class StubPageComponent {}

describe('AppComponent', () => {
  let analytics: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    localStorage.removeItem('portfolio:lang');
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track', 'pageView'], {
      enabled: false,
      consentBannerVisible: signal(false)
    });
    await TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideTranslateService(), 
        provideRouter([{ path: '**', component: StubPageComponent }]),
        { provide: AnalyticsService, useValue: analytics },
        // What app.config adds around the shell on every navigation.
        provideAppLanguage(),
        provideDocumentLanguage(),
        provideSeo(),
        providePageViews(),
        provideFocusOnNavigation()
    ],
    schemas: [NO_ERRORS_SCHEMA]
}).compileComponents();
  });

  const originalLang = document.documentElement.lang;

  afterEach(() => {
    localStorage.removeItem('portfolio:lang');
    // AppComponent writes <html lang>; put it back so later specs see the page as it was.
    document.documentElement.lang = originalLang;
  });

  function render() {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create the app', () => {
    expect(render().componentInstance).toBeTruthy();
  });

  it('keeps the main content hidden until the splash finishes', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('main')).toBeNull();

    fixture.componentInstance.onSplashAnimationFinished();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('main')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-consent-banner')).not.toBeNull();
  });

  describe('skip link', () => {
    function shown() {
      const fixture = render();
      fixture.componentInstance.onSplashAnimationFinished();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('keeps the navigation out of the main content it skips to', () => {
      const page = shown();

      expect(page.querySelector('main app-navbar')).toBeNull();
      expect(page.querySelector('app-navbar')).not.toBeNull();
    });

    it('moves focus to the main content without following the link', () => {
      const page = shown();
      document.body.appendChild(page);
      const skipLink = page.querySelector<HTMLAnchorElement>('.skip-link')!;
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });

      skipLink.dispatchEvent(click);

      expect(click.defaultPrevented).withContext('a fragment link would reload the site because of <base href>').toBeTrue();
      expect(document.activeElement).toBe(page.querySelector('main'));
      page.remove();
    });
  });

  describe('focus after changing page', () => {
    @Component({ template: '<h1>Page title</h1>', standalone: true })
    class TitledPageComponent {}

    async function navigatedTo(fixture: ReturnType<typeof render>, url: string) {
      await TestBed.inject(Router).navigateByUrl(url);
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function shownWithTitledPages() {
      TestBed.inject(Router).resetConfig([{ path: '**', component: TitledPageComponent }]);
      const fixture = render();
      fixture.componentInstance.onSplashAnimationFinished();
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      return fixture;
    }

    it('moves focus to the new page heading, so screen readers announce the page', async () => {
      const fixture = shownWithTitledPages();
      await navigatedTo(fixture, '/');
      const focus = spyOn(HTMLElement.prototype, 'focus').and.callThrough();

      await navigatedTo(fixture, '/contact');

      const heading = fixture.nativeElement.querySelector('main h1') as HTMLElement;
      expect(document.activeElement).toBe(heading);
      expect(heading.getAttribute('tabindex')).toBe('-1');
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      fixture.nativeElement.remove();
    });

    it('leaves focus alone on the first page of the visit', async () => {
      const fixture = shownWithTitledPages();

      await navigatedTo(fixture, '/');

      expect(document.activeElement).not.toBe(fixture.nativeElement.querySelector('main h1'));
      fixture.nativeElement.remove();
    });
  });

  it('keeps a page out of search results when its route asks to', async () => {
    const seo = TestBed.inject(SeoService);
    const update = spyOn(seo, 'update');
    TestBed.inject(Router).resetConfig([
      { path: 'missing', component: StubPageComponent, data: { seo: { titleKey: 't', descriptionKey: 'd', noindex: true } } }
    ]);
    render();

    await TestBed.inject(Router).navigateByUrl('/missing');

    expect(update).toHaveBeenCalledWith(jasmine.objectContaining({ path: '/missing', noindex: true }));
  });

  it('starts in Portuguese for first-time visitors', () => {
    render();

    expect(TestBed.inject(TranslateService).getCurrentLang()).toBe('PT-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('starts in the language chosen on a previous visit', () => {
    localStorage.setItem('portfolio:lang', 'EN');

    render();

    expect(TestBed.inject(TranslateService).getCurrentLang()).toBe('EN');
  });

  it('remembers, tracks and applies a language switch', () => {
    render();

    TestBed.inject(TranslateService).use('EN');

    expect(localStorage.getItem('portfolio:lang')).toBe('EN');
    expect(analytics.track).toHaveBeenCalledWith('language_switch', { from: 'PT-BR', to: 'EN' });
    expect(document.documentElement.lang).toBe('en');
  });

  it('sends the page view with the title of the page it lands on, not the one it left', async () => {
    TestBed.inject(TranslateService).setTranslation('PT-BR', { 'contact.title': 'Contato | Alvaro' }, true);
    TestBed.inject(Router).resetConfig([
      { path: 'contact', component: StubPageComponent, data: { seo: { titleKey: 'contact.title', descriptionKey: 'd' } } }
    ]);
    render();

    await TestBed.inject(Router).navigateByUrl('/contact');

    expect(analytics.pageView).toHaveBeenCalledWith('/contact', 'Contato | Alvaro', 'PT-BR');
  });

  it('sends a page view for every navigation, without the query string in the path', async () => {
    render();

    await TestBed.inject(Router).navigateByUrl('/portfolio?utm_source=linkedin');

    expect(analytics.pageView).toHaveBeenCalledWith('/portfolio', jasmine.any(String), jasmine.any(String));
  });
});
