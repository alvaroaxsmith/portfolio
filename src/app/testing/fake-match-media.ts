/** A stand-in for window.matchMedia whose answers the test sets, firing `change` like the browser does. */
export function fakeMatchMedia(initial: Record<string, boolean> = {}) {
  const matches = new Map(Object.entries(initial));
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  const matchMedia = (query: string): MediaQueryList =>
    ({
      media: query,
      get matches() {
        return matches.get(query) ?? false;
      },
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.set(query, (listeners.get(query) ?? new Set()).add(listener));
      },
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.get(query)?.delete(listener);
      }
    }) as unknown as MediaQueryList;

  return {
    matchMedia,
    set(query: string, value: boolean) {
      matches.set(query, value);
      listeners.get(query)?.forEach((listener) => listener({ matches: value, media: query } as MediaQueryListEvent));
    },
    listening: (query: string) => listeners.get(query)?.size ?? 0
  };
}
