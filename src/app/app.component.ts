import { DOCUMENT } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject, filter, takeUntil } from 'rxjs';
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
    imports: [SplashScreenComponent, NavbarComponent, RouterOutlet, ConsentBannerComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private analytics = inject(AnalyticsService);
  private document = inject<Document>(DOCUMENT);

  readonly showMainContent = signal(false);
  private readonly destroy$ = new Subject<void>();

  onSplashAnimationFinished() {
    this.showMainContent.set(true);
  }

  ngOnInit() {
    this.updateDocumentLanguage(this.translate.currentLang || this.translate.defaultLang);
    this.updateSeo();
    let currentLang = this.translate.currentLang || this.translate.defaultLang;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateSeo();
        this.analytics.pageView(this.router.url.split(/[?#]/)[0], this.document.title, this.translate.currentLang);
      });

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSeo() {
    const seo = this.getCurrentSeoConfig();
    if (!seo) {
      return;
    }

    this.seoService.update({
      title: this.translate.instant(seo.titleKey),
      description: this.translate.instant(seo.descriptionKey),
      path: this.router.url.split(/[?#]/)[0]
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
