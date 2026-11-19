import { DestroyRef, inject } from '@angular/core';

/**
 * Listens to a frequent window event (scroll, resize) with a passive listener. `update` writes the signals the
 * event changes; without zone.js, only a signal that really changed schedules a render, so the events themselves
 * never re-render the app. Call it in an injection context: the listener goes away with the caller.
 */
export function onWindowEvent(type: 'scroll' | 'resize', update: () => void): void {
  window.addEventListener(type, update, { passive: true });
  inject(DestroyRef).onDestroy(() => window.removeEventListener(type, update));
}
