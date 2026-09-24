import { DOCUMENT } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Inject } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { SeoService } from './services/seo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portfolio';
  showMainContent = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeAppLanguage();
  }

  onSplashAnimationFinished() {
    this.showMainContent = true;
  }

  ngOnInit() {
    this.updateDocumentLanguage(this.translate.currentLang || this.translate.defaultLang);
    this.updateSeo();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateSeo());

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: LangChangeEvent) => {
        this.updateDocumentLanguage(event.lang);
        this.updateSeo();
      });
  }

  initializeAppLanguage() {
    const supportedLangs = ['EN', 'PT-BR'];
    this.translate.addLangs(supportedLangs);
    const defaultAppLanguage = 'PT-BR';
    let langToUse = defaultAppLanguage;
    if (!supportedLangs.includes(langToUse)) {
      langToUse = supportedLangs[0] || 'PT-BR';
    }

    this.translate.setDefaultLang(langToUse);
    this.translate.use(langToUse).subscribe();
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
      description: this.translate.instant(seo.descriptionKey)
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
