import { EnvironmentProviders, Injectable, InjectionToken, Injector, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, filter } from 'rxjs';

export const PAGE_RELOAD = new InjectionToken<(url: string) => void>('PAGE_RELOAD', {
  providedIn: 'root',
  factory: () => (url: string) => window.location.assign(url)
});

const STORAGE_KEY = 'portfolio:chunk-reload';
const RETRY_WINDOW_MS = 10_000;
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|is not a valid JavaScript MIME type|ChunkLoadError|Loading chunk [\w-]+ failed/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) {
    return false;
  }
  const { name = '', message = '' } = error as { name?: string; message?: string };
  return CHUNK_ERROR_PATTERN.test(`${name} ${message}`);
}

@Injectable({
  providedIn: 'root'
})
export class ChunkLoadRecoveryService {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly translate = inject(TranslateService);
  private readonly reload = inject(PAGE_RELOAD);


  watch(): Subscription {
    return this.router.events
      .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
      .subscribe((event) => {
        if (isChunkLoadError(event.error)) {
          this.recover(event.url);
        }
      });
  }

  /**
   * Reloads the page at most once per retry window. A reload wipes memory, so the attempt can only be remembered
   * in sessionStorage; when it is unavailable an automatic reload could loop forever, so the user decides instead.
   */
  recover(url: string): boolean {
    const now = Date.now();
    try {
      const lastAttempt = Number(sessionStorage.getItem(STORAGE_KEY)) || 0;
      if (now - lastAttempt >= RETRY_WINDOW_MS) {
        sessionStorage.setItem(STORAGE_KEY, String(now));
        this.reload(url);
        return true;
      }
    } catch {
    }
    this.giveUp(url);
    return false;
  }

  /** The snack bar is only needed here, which almost never happens, so it is downloaded now, not with the app. */
  private giveUp(url: string): void {
    console.error(`Could not load the page for ${url} after reloading.`);
    const message = this.translate.instant('chunkLoad.failed');
    this.loadSnackBar().then(
      ({ MatSnackBar }) =>
        this.injector
          .get(MatSnackBar)
          .open(message, this.translate.instant('chunkLoad.reload'))
          .onAction()
          .subscribe(() => this.reload(url)),
      // Files are failing to load, so the snack bar may fail too: the browser's own dialog still offers the reload.
      () => {
        if (window.confirm(message)) {
          this.reload(url);
        }
      }
    );
  }

  protected loadSnackBar() {
    return import('@angular/material/snack-bar');
  }
}

/** Recovers from failed lazy chunk loads on every navigation, from the moment the app boots. */
export function provideChunkLoadRecovery(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(ChunkLoadRecoveryService).watch();
    })
  ]);
}
