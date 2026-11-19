import EN from '../../../../assets/i18n/EN.json';
import PT_BR from '../../../../assets/i18n/PT-BR.json';
import { EXPERIENCES } from './experiences';
import { HIGHLIGHTS } from './highlights';

/** A key names its place ("timeline.metro.role"), instead of being the Portuguese or English text itself. */
const SEMANTIC_KEY = /^[a-z][A-Za-z]*(\.[a-z][A-Za-z0-9]*)+$/;

function lookup(translations: object, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations);
}

describe('About me texts', () => {
  const keys = [
    ...EXPERIENCES.flatMap((exp) => [exp.role, exp.company, exp.period, exp.duration, exp.description, ...exp.activities]),
    ...HIGHLIGHTS.flatMap((highlight) => [highlight.date, highlight.dateRange, highlight.description])
  ].filter((key): key is string => !!key);

  it('name every text by its place, not by the text itself', () => {
    expect(keys.filter((key) => !SEMANTIC_KEY.test(key))).toEqual([]);
  });

  it('exist in both languages', () => {
    for (const [lang, translations] of [['PT-BR', PT_BR], ['EN', EN]] as const) {
      expect(keys.filter((key) => typeof lookup(translations, key) !== 'string')).withContext(lang).toEqual([]);
    }
  });
});
