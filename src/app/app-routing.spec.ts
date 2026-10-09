import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { routes } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';

describe('App routing', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.removeItem('portfolio:github-projects');
    TestBed.configureTestingModule({
      declarations: [ContactComponent],
      imports: [TranslateModule.forRoot(), MaterialModule, NoopAnimationsModule],
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
