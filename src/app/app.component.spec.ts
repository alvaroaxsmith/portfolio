import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { AnalyticsService } from './core/analytics/analytics.service';
import { SeoService } from './core/seo/seo.service';
import { provideAppLanguage } from './core/i18n/language-storage';

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
    imports: [TranslateModule.forRoot(), AppComponent],
    providers: [
        provideRouter([{ path: '**', component: StubPageComponent }]),
        { provide: AnalyticsService, useValue: analytics },
        provideAppLanguage()
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

    expect(TestBed.inject(TranslateService).currentLang).toBe('PT-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('starts in the language chosen on a previous visit', () => {
    localStorage.setItem('portfolio:lang', 'EN');

    render();

    expect(TestBed.inject(TranslateService).currentLang).toBe('EN');
  });

  it('remembers, tracks and applies a language switch', () => {
    render();

    TestBed.inject(TranslateService).use('EN');

    expect(localStorage.getItem('portfolio:lang')).toBe('EN');
    expect(analytics.track).toHaveBeenCalledWith('language_switch', { from: 'PT-BR', to: 'EN' });
    expect(document.documentElement.lang).toBe('en');
  });

  it('sends a page view for every navigation, without the query string in the path', async () => {
    render();

    await TestBed.inject(Router).navigateByUrl('/portfolio?utm_source=linkedin');

    expect(analytics.pageView).toHaveBeenCalledWith('/portfolio', jasmine.any(String), jasmine.any(String));
  });
});
