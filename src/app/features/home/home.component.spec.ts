import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  const blockNavigation = (event: Event) => event.preventDefault();

  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track', 'openConsentBanner'], { enabled: false });
    await TestBed.configureTestingModule({
      imports: [HomeComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnalyticsService, useValue: analytics }
      ]
    }).compileComponents();

    TestBed.inject(TranslateService).use('PT-BR');
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    document.addEventListener('click', blockNavigation);
  });

  afterEach(() => {
    document.removeEventListener('click', blockNavigation);
    TestBed.inject(HttpTestingController).match(() => true);
  });

  const link = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLAnchorElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers the CV as a download', () => {
    expect(link('a[download]').getAttribute('href')).toBe('/assets/cv/alvaro-machado-ferreira-cv.txt');
  });

  it('tracks CV downloads with the current language', () => {
    link('a[download]').click();

    expect(analytics.track).toHaveBeenCalledWith('cv_download', { language: 'PT-BR' });
  });

  it('opens LinkedIn in a new tab and tracks the click', () => {
    const linkedin = link('a[href*="linkedin.com"]');
    expect(linkedin.getAttribute('target')).toBe('_blank');
    expect(linkedin.getAttribute('rel')).toContain('noopener');

    linkedin.click();

    expect(analytics.track).toHaveBeenCalledWith('linkedin_click', { location: 'home' });
  });

  it('shows the GitHub avatar once it loads', async () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://api.github.com/users/alvaroaxsmith').flush({ avatar_url: 'https://avatars/me.png' });
    await new Promise((resolve) => setTimeout(resolve));

    expect(component.isLoadingImage()).toBeFalse();
    expect(component.imageUrl()).toBe('https://avatars/me.png');
  });

  it('falls back to the public GitHub profile picture when the API fails, instead of loading forever', async () => {
    spyOn(console, 'error');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://api.github.com/users/alvaroaxsmith').flush({ message: 'rate limited' }, { status: 403, statusText: 'Forbidden' });
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();

    expect(component.isLoadingImage()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.hero-media img').getAttribute('src')).toBe('https://github.com/alvaroaxsmith.png');
  });
});
