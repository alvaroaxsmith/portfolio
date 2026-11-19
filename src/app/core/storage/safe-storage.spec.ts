import { readStorage, writeStorage } from './safe-storage';

describe('safe storage', () => {
  const KEY = 'portfolio:test';
  afterEach(() => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  });

  it('reads and writes local storage by default', () => {
    writeStorage(KEY, 'a');

    expect(readStorage(KEY)).toBe('a');
    expect(localStorage.getItem(KEY)).toBe('a');
  });

  it('can use session storage instead', () => {
    writeStorage(KEY, 'b', 'session');

    expect(readStorage(KEY, 'session')).toBe('b');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('removes the entry when given null', () => {
    writeStorage(KEY, 'a');
    writeStorage(KEY, null);

    expect(readStorage(KEY)).toBeNull();
  });

  it('never throws when the browser refuses storage (private mode, blocked site data)', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');

    expect(readStorage(KEY)).toBeNull();
    expect(() => writeStorage(KEY, 'a')).not.toThrow();
  });
});
