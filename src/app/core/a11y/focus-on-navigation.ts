import { DOCUMENT } from '@angular/common';
import { EnvironmentInjector, EnvironmentProviders, afterNextRender, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * After a page change focus would stay on the menu link, and screen readers would not announce the new page.
 * Moving it to the page heading fixes both; the first page of the visit keeps the browser's own focus.
 */
export function provideFocusOnNavigation(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const router = inject(Router);
      const document = inject(DOCUMENT);
      const injector = inject(EnvironmentInjector);
      let firstPage = true;

      router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        if (firstPage) {
          firstPage = false;
          return;
        }
        afterNextRender(() => {
          const heading = document.querySelector<HTMLElement>('main h1');
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
          }
        }, { injector });
      });
    })
  ]);
}
