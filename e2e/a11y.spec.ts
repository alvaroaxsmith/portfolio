import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { openScreen, screens } from './screens';

/**
 * Ratchet: violations the site still has, each tied to the issue that fixes it, with how many elements it hits.
 * More elements than listed (or a rule not listed) fails the build; fewer fails too, so every fix lowers or
 * removes its own entry and the list only ever shrinks.
 */
const knownViolations: Record<string, Record<string, { issue: number; nodes: number }>> = {
  'desktop-portfolio': { 'button-name': { issue: 74, nodes: 1 } },
  'desktop-contact': { 'aria-allowed-role': { issue: 74, nodes: 4 } },
  'mobile-contact': { 'aria-allowed-role': { issue: 74, nodes: 4 } },
  'mobile-courses': { 'aria-allowed-role': { issue: 74, nodes: 3 } },
  'mobile-about-me': { 'scrollable-region-focusable': { issue: 73, nodes: 7 } }
};

const WCAG_AND_BEST_PRACTICES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Experimental rule that counts a mat-icon ligature ("close", "translate") as visible text, so every
// icon button with a correct aria-label is reported. Not a real barrier.
const IGNORED_RULES = ['label-content-name-mismatch'];

// Every screen in Portuguese (the default); the consent banner also in English, since visitors abroad see it first.
const audits = [
  ...screens.map((screen) => ({ screen, lang: 'PT-BR' as const })),
  ...screens.filter((screen) => screen.production).map((screen) => ({ screen, lang: 'EN' as const }))
];

for (const { screen, lang } of audits) {
  test(`${screen.name} (${lang}) has no accessibility violations beyond the known ones`, async ({ page }) => {
    await openScreen(page, screen, lang);

    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG_AND_BEST_PRACTICES)
      .disableRules(IGNORED_RULES)
      .analyze();

    const found = violations.map(({ id, impact, nodes }) => ({
      rule: id,
      impact,
      targets: nodes.map((node) => node.target.join(' '))
    }));
    const known = knownViolations[screen.name] ?? {};

    const unexpected = found.filter(({ rule, targets }) => targets.length > (known[rule]?.nodes ?? 0));
    const improved = Object.entries(known)
      .filter(([rule, { nodes }]) => (found.find((violation) => violation.rule === rule)?.targets.length ?? 0) < nodes)
      .map(([rule]) => rule);

    expect(unexpected, 'new accessibility violations').toEqual([]);
    expect(improved, 'fewer violations than knownViolations lists: lower or remove these entries').toEqual([]);
  });
}
