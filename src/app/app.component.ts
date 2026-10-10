import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from './core/seo/seo.service';
import { AnalyticsService } from './core/analytics/analytics.service';
import { storeLang } from './core/i18n/language-storage';
import { SplashScreenComponent } from './core/layout/splash-screen/splash-screen.component';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { ConsentBannerComponent } from './core/layout/consent-banner/consent-banner.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SplashScreenComponent, NavbarComponent, RouterOutlet, ConsentBannerComponent, TranslateModule]
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly analytics = inject(AnalyticsService);
  private readonly document = inject<Document>(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly showMainContent = signal(false);

  onSplashAnimationFinished() {
    this.showMainContent.set(true);
  }

  /**
   * With <base href="/">, following "#main-content" would load "/#main-content" (the home page) from any other
   * route, so the skip link moves focus itself.
   */
  skipToContent(event: Event) {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }

  ngOnInit() {
    this.updateDocumentLanguage(this.translate.currentLang || this.translate.defaultLang);
    this.updateSeo();
    let currentLang = this.translate.currentLang || this.translate.defaultLang;
    let firstPage = true;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateSeo();
        this.analytics.pageView(this.router.url.split(/[?#]/)[0], this.document.title, this.translate.currentLang);
        if (!firstPage) {
          this.focusPageHeading();
        }
        firstPage = false;
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: LangChangeEvent) => {
        if (event.lang !== currentLang) {
          this.analytics.track('language_switch', { from: currentLang, to: event.lang });
          currentLang = event.lang;
        }
        storeLang(event.lang);
        this.updateDocumentLanguage(event.lang);
        this.updateSeo();
      });
  }

  /**
   * After a page change focus would stay on the menu link, and screen readers would not announce the new page.
   * Moving it to the page heading fixes both; the first page of the visit keeps the browser's own focus.
   */
  private focusPageHeading() {
    afterNextRender(() => {
      const heading = this.document.querySelector<HTMLElement>('main h1');
      if (!heading) {
        return;
      }
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }, { injector: this.injector });
  }

  private updateSeo() {
    const seo = this.getCurrentSeoConfig();
    if (!seo) {
      return;
    }

    this.seoService.update({
      title: this.translate.instant(seo.titleKey),
      description: this.translate.instant(seo.descriptionKey),
      path: this.router.url.split(/[?#]/)[0],
      noindex: !!seo.noindex
    });
  }

  private getCurrentSeoConfig() {
    const currentRoute = this.router.routerState.snapshot.root;
    const dataFromTree = [...currentRoute.pathFromRoot]
      .reverse()
      .map((route) => route.data['seo'])
      .find(Boolean);

    if (dataFromTree) {
      return dataFromTree;
    }

    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.data['seo']) {
        return route.snapshot.data['seo'];
      }
    }

    return null;
  }

  private updateDocumentLanguage(lang: string) {
    this.document.documentElement.lang = lang === 'PT-BR' ? 'pt-BR' : 'en';
  }
}
