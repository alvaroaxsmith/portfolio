import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';
import { ConsentBannerComponent } from './consent-banner.component';

describe('ConsentBannerComponent', () => {
  let fixture: ComponentFixture<ConsentBannerComponent>;
  let analytics: { consentBannerVisible: ReturnType<typeof signal<boolean>>; setConsent: jasmine.Spy };

  function render(visible: boolean) {
    analytics = {
      consentBannerVisible: signal(visible),
      setConsent: jasmine.createSpy('setConsent').and.callFake(() => analytics.consentBannerVisible.set(false))
    };
    TestBed.configureTestingModule({
      imports: [ConsentBannerComponent, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analytics }]
    });
    fixture = TestBed.createComponent(ConsentBannerComponent);
    fixture.detectChanges();
  }

  const banner = () => fixture.nativeElement.querySelector('.consent') as HTMLElement | null;
  const buttons = () => Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

  it('renders nothing when the visitor already chose or analytics is off', () => {
    render(false);
    expect(banner()).toBeNull();
  });

  it('shows an accessible dialog with decline and accept actions', () => {
    render(true);

    expect(banner()?.getAttribute('role')).toBe('dialog');
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
});
