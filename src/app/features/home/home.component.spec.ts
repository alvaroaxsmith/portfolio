import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
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
      imports: [HomeComponent],
      providers: [provideTranslateService(), 
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

  const photo = () => fixture.nativeElement.querySelector('.hero-media img') as HTMLImageElement;
  const placeholder = () => fixture.nativeElement.querySelector('app-photo-skeleton');
  function photoEvent(type: 'load' | 'error') {
    photo().dispatchEvent(new Event(type));
    fixture.detectChanges();
  }

  it('shows the photo from its fixed address, without asking the GitHub API first', () => {
    TestBed.inject(HttpTestingController).expectNone(() => true);

    expect(photo().getAttribute('src')).toBe('https://avatars.githubusercontent.com/u/69737979?v=4');
  });

  it('keeps the photo placeholder until the photo itself has loaded', () => {
    expect(placeholder()).not.toBeNull();

    photoEvent('load');

    expect(placeholder()).toBeNull();
  });

  it('falls back to the copy served by the site when the photo fails, instead of loading forever', () => {
    photoEvent('error');

    expect(photo().getAttribute('src')).toBe('assets/img/alvaro.jpg');
    expect(placeholder()).not.toBeNull();

    photoEvent('load');

    expect(placeholder()).toBeNull();
  });

  it('stops waiting when the fallback picture fails too', () => {
    photoEvent('error');
    photoEvent('error');

    expect(placeholder()).toBeNull();
  });

  it('loads the hero photo first: it is the largest thing on screen (LCP), so it is never lazy', () => {
    expect(photo().getAttribute('loading')).not.toBe('lazy');
    expect(photo().getAttribute('fetchpriority')).toBe('high');
    expect(photo().getAttribute('width')).toBe('350');
    expect(photo().getAttribute('height')).toBe('350');
  });

  it('names the highlights list in the visitor\'s language', () => {
    expect(fixture.nativeElement.querySelector('.hero-highlights').getAttribute('aria-label')).toBe('a11y.highlights');
  });
});
