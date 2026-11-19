import { Injectable, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from './seo.service';

interface RouteSeo {
  titleKey: string;
  descriptionKey: string;
  /** Keeps the page out of search results, e.g. the not-found page. */
  noindex?: boolean;
}

/**
 * The router's hook for the page title, used for all of a page's SEO tags: it reads `data.seo` from the deepest
 * route that has it, translates it, and applies it again when the visitor switches language.
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly translate = inject(TranslateService);
  private readonly seo = inject(SeoService);
  private current?: RouterStateSnapshot;

  constructor() {
    super();
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.current) {
        this.updateTitle(this.current);
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.current = snapshot;
    let route = snapshot.root;
    let seo: RouteSeo | undefined = route.data['seo'];
    while (route.firstChild) {
      route = route.firstChild;
      seo = route.data['seo'] ?? seo;
    }
    if (!seo) {
      return;
    }
    this.seo.update({
      title: this.translate.instant(seo.titleKey),
      description: this.translate.instant(seo.descriptionKey),
      path: snapshot.url.split(/[?#]/)[0],
      noindex: !!seo.noindex
    });
  }
}

export function provideSeo(): Provider {
  return { provide: TitleStrategy, useExisting: SeoTitleStrategy };
}
