import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';

type TestWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: jasmine.Spy;
  __analytics?: { enabled: boolean };
};

describe('AnalyticsService', () => {
  const win = window as TestWindow;

  function createService(enabled: boolean, consent: string | null = null): AnalyticsService {
    win.__analytics = { enabled };
    win.dataLayer = [];
    win.gtag = jasmine.createSpy('gtag');
    if (consent) {
      localStorage.setItem('portfolio:consent', consent);
    }
    TestBed.configureTestingModule({});
    return TestBed.inject(AnalyticsService);
  }

  function pushedEvents(): Array<Record<string, unknown>> {
    return (win.dataLayer ?? []).map((entry) =>
      Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined))
    );
  }

  afterEach(() => {
    localStorage.removeItem('portfolio:consent');
    delete win.__analytics;
    delete win.dataLayer;
    delete win.gtag;
  });

  describe('when analytics is disabled (local, previews or ?analytics=off)', () => {
    it('does not send any event', () => {
      const service = createService(false);

      service.track('cv_download', { language: 'PT-BR' });
      service.pageView('/', 'Home', 'PT-BR');

      expect(win.dataLayer).toEqual([]);
    });

    it('never shows the consent banner and ignores requests to reopen it', () => {
      const service = createService(false);

      service.openConsentBanner();

      expect(service.consentBannerVisible()).toBeFalse();
    });
  });

  describe('when analytics is enabled', () => {
    it('sends events with their parameters to the dataLayer', () => {
      const service = createService(true, 'granted');

      service.track('repo_click', { repo: 'app-gym', tech: 'Dart', view: 'grid' });

      expect(pushedEvents()).toEqual([{ event: 'repo_click', repo: 'app-gym', tech: 'Dart', view: 'grid' }]);
    });

    it('clears parameters from the previous event so they do not leak into the next one', () => {
      const service = createService(true, 'granted');

      service.track('repo_click', { repo: 'app-gym', tech: 'Dart' });
      service.track('cv_download', { language: 'EN' });

      const last = win.dataLayer![1];
      expect(last).toEqual(jasmine.objectContaining({ event: 'cv_download', language: 'EN' }));
      expect('repo' in last && last['repo'] === undefined).toBeTrue();
      expect('tech' in last && last['tech'] === undefined).toBeTrue();
    });

    it('sends page views with the full URL so GA4 can read UTM parameters', () => {
      const service = createService(true, 'granted');

      service.pageView('/portfolio', 'Projetos | Alvaro Ferreira', 'PT-BR');

      expect(pushedEvents()[0]).toEqual({
        event: 'page_view',
        page_path: '/portfolio',
        page_location: location.href,
        page_title: 'Projetos | Alvaro Ferreira',
        language: 'PT-BR'
      });
    });
  });

  describe('consent (LGPD)', () => {
    it('shows the banner to visitors who have not chosen yet', () => {
      const service = createService(true);

      expect(service.consent).toBeNull();
      expect(service.consentBannerVisible()).toBeTrue();
    });

    it('does not show the banner again after a choice was made', () => {
      expect(createService(true, 'denied').consentBannerVisible()).toBeFalse();
    });

    it('accepting stores the choice, grants only analytics storage and hides the banner', () => {
      const service = createService(true);

      service.setConsent('granted');

      expect(localStorage.getItem('portfolio:consent')).toBe('granted');
      expect(win.gtag).toHaveBeenCalledOnceWith('consent', 'update', { analytics_storage: 'granted' });
      expect(service.consentBannerVisible()).toBeFalse();
      expect(pushedEvents()).toContain({ event: 'consent_update', analytics_storage: 'granted' });
    });

    it('declining stores the choice and keeps analytics storage denied', () => {
      const service = createService(true);

      service.setConsent('denied');

      expect(service.consent).toBe('denied');
      expect(win.gtag).toHaveBeenCalledOnceWith('consent', 'update', { analytics_storage: 'denied' });
    });

    it('lets the visitor reopen the banner to change the choice', () => {
      const service = createService(true, 'granted');

      service.openConsentBanner();

      expect(service.consentBannerVisible()).toBeTrue();
    });

    it('ignores invalid stored values', () => {
      expect(createService(true, 'maybe').consent).toBeNull();
    });

    it('keeps working when localStorage is blocked', () => {
      spyOn(localStorage, 'getItem').and.throwError('blocked');
      spyOn(localStorage, 'setItem').and.throwError('blocked');
      const service = createService(true);

      expect(service.consent).toBeNull();
      expect(() => service.setConsent('granted')).not.toThrow();
      expect(win.gtag).toHaveBeenCalled();
    });
  });
});
