/**
 * Replaces IntersectionObserver for the current spec, so tests decide when an element "comes into view"
 * instead of depending on real layout and on when the browser happens to report it.
 */
export function fakeIntersectionObserver() {
  const callbacks: IntersectionObserverCallback[] = [];
  const observed = new Set<Element>();

  spyOn(window, 'IntersectionObserver').and.callFake(function (callback: IntersectionObserverCallback) {
    callbacks.push(callback);
    return {
      observe: (element: Element) => observed.add(element),
      unobserve: (element: Element) => observed.delete(element),
      disconnect: () => observed.clear(),
      takeRecords: () => []
    } as unknown as IntersectionObserver;
  });

  return {
    /** Reports the most recently observed element as visible (or not) to the latest observer. */
    report(isIntersecting: boolean): void {
      const callback = callbacks.at(-1);
      if (!callback) {
        throw new Error('Nothing is being observed');
      }
      callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    },
    get observing(): number {
      return observed.size;
    }
  };
}
