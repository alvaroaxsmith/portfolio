import { Inject, Injectable, InjectionToken } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

export const PAGE_RELOAD = new InjectionToken<(url: string) => void>('PAGE_RELOAD', {
  providedIn: 'root',
  factory: () => (url: string) => window.location.assign(url)
});

const STORAGE_KEY = 'portfolio:chunk-reload';
const RETRY_WINDOW_MS = 10_000;
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk [\w-]+ failed/i;

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
  constructor(
    private readonly router: Router,
    @Inject(PAGE_RELOAD) private readonly reload: (url: string) => void
  ) {}

  watch(): Subscription {
    return this.router.events
      .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
      .subscribe((event) => {
        if (isChunkLoadError(event.error)) {
          this.recover(event.url);
        }
      });
  }

  recover(url: string): boolean {
    const now = Date.now();
    let lastAttempt = 0;
    try {
      lastAttempt = Number(sessionStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
    }
    if (now - lastAttempt < RETRY_WINDOW_MS) {
      return false;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, String(now));
    } catch {
    }
    this.reload(url);
    return true;
  }
}
