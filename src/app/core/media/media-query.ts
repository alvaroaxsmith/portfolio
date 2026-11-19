import { DestroyRef, InjectionToken, Signal, inject, signal } from '@angular/core';

/** The browser's matchMedia, behind a token so tests can choose what the screen matches. */
export const MATCH_MEDIA = new InjectionToken<(query: string) => MediaQueryList>('MATCH_MEDIA', {
  providedIn: 'root',
  factory: () => (query: string) => window.matchMedia(query)
});

/** The layout breakpoint the pages share: at or below it, lists replace tables. */
export const PHONE_LAYOUT = '(max-width: 767px)';
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * Whether the screen matches a media query, as a signal that follows changes (a rotation, a resized window).
 * Call it in an injection context: it stops listening when its owner goes away.
 */
export function mediaQuery(query: string): Signal<boolean> {
  const list = inject(MATCH_MEDIA)(query);
  const matches = signal(list.matches);
  const onChange = (event: MediaQueryListEvent) => matches.set(event.matches);
  list.addEventListener('change', onChange);
  inject(DestroyRef).onDestroy(() => list.removeEventListener('change', onChange));
  return matches.asReadonly();
}
