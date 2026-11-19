type Area = 'local' | 'session';

const areaOf = (area: Area): Storage => (area === 'local' ? localStorage : sessionStorage);

/**
 * Browser storage that never throws: private windows, blocked site data or a full quota make it unavailable, and
 * every caller treats that as "nothing stored".
 */
export function readStorage(key: string, area: Area = 'local'): string | null {
  try {
    return areaOf(area).getItem(key);
  } catch {
    return null;
  }
}

/** Stores a value, or removes it when given null; does nothing when storage is unavailable. */
export function writeStorage(key: string, value: string | null, area: Area = 'local'): void {
  try {
    if (value === null) {
      areaOf(area).removeItem(key);
    } else {
      areaOf(area).setItem(key, value);
    }
  } catch {
    // Unavailable: the choice simply is not remembered.
  }
}
