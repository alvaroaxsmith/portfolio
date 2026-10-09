import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { openScreen, screens } from './screens';

/**
 * Ratchet: violations the site still has, each tied to the issue that fixes it. A violation missing from this
 * list fails the build, and so does an entry whose violation is gone, so every fix removes its own line.
 */
const knownViolations: Record<string, Record<string, number>> = {
  'desktop-portfolio': { 'button-name': 74 },
  'desktop-contact': { 'aria-allowed-role': 74 },
  'mobile-contact': { 'aria-allowed-role': 74 },
  'mobile-courses': { 'aria-allowed-role': 74 },
  'mobile-about-me': { 'scrollable-region-focusable': 73 }
};

const WCAG_AND_BEST_PRACTICES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Experimental rule that counts a mat-icon ligature ("close", "translate") as visible text, so every
// icon button with a correct aria-label is reported. Not a real barrier.
const IGNORED_RULES = ['label-content-name-mismatch'];

for (const screen of screens) {
  test(`${screen.name} has no accessibility violations beyond the known ones`, async ({ page }) => {
    await openScreen(page, screen);

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

    const unexpected = found.filter(({ rule }) => !(rule in known));
    const fixed = Object.keys(known).filter((rule) => !found.some((violation) => violation.rule === rule));

    expect(unexpected, 'new accessibility violations').toEqual([]);
    expect(fixed, 'fixed violations still listed in knownViolations: remove them').toEqual([]);
  });
}
