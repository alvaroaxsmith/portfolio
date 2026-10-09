import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { routes } from './app.routes';
import { ContactComponent } from './features/contact/contact.component';
import { HomeComponent } from './features/home/home.component';
import { AboutMeComponent } from './features/about-me/about-me.component';
import { CoursesComponent } from './features/courses/courses.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';

describe('App routing', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.removeItem('portfolio:github-projects');
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).match(() => true);
  });

  const cases: [string, unknown][] = [
    ['/', HomeComponent],
    ['/about-me', AboutMeComponent],
    ['/courses', CoursesComponent],
    ['/portfolio', PortfolioComponent],
    ['/contact', ContactComponent]
  ];

  for (const [url, component] of cases) {
    it(`navigates to ${url} and renders its page`, async () => {
      const page = await harness.navigateByUrl(url, component as never);

      expect(page).toBeInstanceOf(component as never);
      expect(TestBed.inject(Router).url).toBe(url);
    });
  }

  it('navigates between the lazy pages in sequence, like the menu does', async () => {
    for (const [url, component] of cases.slice(1)) {
      const page = await harness.navigateByUrl(url, component as never);
      expect(page).toBeInstanceOf(component as never);
    }
  });
});
