import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../analytics/analytics.service';
import { ConsentBannerComponent } from './consent-banner.component';

describe('ConsentBannerComponent', () => {
  let fixture: ComponentFixture<ConsentBannerComponent>;
  let analytics: {
    consentBannerVisible: ReturnType<typeof signal<boolean>>;
    consentBannerReopened: ReturnType<typeof signal<boolean>>;
    setConsent: jasmine.Spy;
  };

  function render(visible: boolean, reopened = false) {
    analytics = {
      consentBannerVisible: signal(visible),
      consentBannerReopened: signal(reopened),
      setConsent: jasmine.createSpy('setConsent').and.callFake(() => analytics.consentBannerVisible.set(false))
    };
    TestBed.configureTestingModule({
      imports: [ConsentBannerComponent, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analytics }]
    });
    fixture = TestBed.createComponent(ConsentBannerComponent);
    // In the page, as in the app: focus only moves to elements in the document.
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  afterEach(() => fixture.nativeElement.remove());

  const banner = () => fixture.nativeElement.querySelector('.consent') as HTMLElement | null;
  const buttons = () => Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

  it('renders nothing when the visitor already chose or analytics is off', () => {
    render(false);
    expect(banner()).toBeNull();
  });

  it('shows a named region (not a dialog: it does not block the page) with decline and accept actions', () => {
    render(true);

    expect(banner()?.getAttribute('role')).toBe('region');
    expect(banner()?.getAttribute('aria-labelledby')).toBe('consent-title');
    expect(buttons().length).toBe(2);
  });

  it('declining records "denied" and closes the banner', () => {
    render(true);

    buttons()[0].click();
    fixture.detectChanges();

    expect(analytics.setConsent).toHaveBeenCalledOnceWith('denied');
    expect(banner()).toBeNull();
  });

  it('accepting records "granted" and closes the banner', () => {
    render(true);

    buttons()[1].click();
    fixture.detectChanges();

    expect(analytics.setConsent).toHaveBeenCalledOnceWith('granted');
    expect(banner()).toBeNull();
  });

  describe('focus', () => {
    let opener: HTMLButtonElement;

    beforeEach(() => {
      opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
    });

    afterEach(() => opener.remove());

    it('takes focus when the visitor reopens it, and gives it back after the choice', async () => {
      render(true, true);
      await fixture.whenStable();

      expect(document.activeElement).toBe(banner());

      buttons()[0].click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(opener);
    });

    it('leaves focus where it is when it shows by itself on the first visit', async () => {
      render(true, false);
      await fixture.whenStable();

      expect(document.activeElement).toBe(opener);
    });
  });
});
