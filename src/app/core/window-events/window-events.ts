import { DestroyRef, NgZone, inject } from '@angular/core';

/**
 * Listens to a frequent window event (scroll, resize) with a passive listener outside Angular, so the events
 * themselves never run change detection for the whole app. `update` writes its signals and returns whether
 * anything changed; only then is Angular entered, once, to render it. Call it in an injection context: the
 * listener goes away with the caller.
 */
export function onWindowEvent(type: 'scroll' | 'resize', update: () => boolean): void {
  const zone = inject(NgZone);
  const listener = () => {
    if (update()) {
      zone.run(() => undefined);
    }
  };
  zone.runOutsideAngular(() => window.addEventListener(type, listener, { passive: true }));
  inject(DestroyRef).onDestroy(() => window.removeEventListener(type, listener));
}
