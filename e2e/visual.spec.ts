import { expect, test } from './fixtures';
import { openScreen, screens } from './screens';

/**
 * Visual regression with zero tolerance: any pixel that differs from the reference fails. References are
 * rendered in the Playwright Linux image (see `npm run test:visual`), the same one CI uses, so fonts render
 * identically; anywhere else these tests are skipped instead of comparing a different renderer.
 *
 * A PR may update a reference only for a visual change its issue lists as approved, showing before and after.
 */
test.skip(process.env['VISUAL'] !== '1', 'Visual references are Linux-only: run `npm run test:visual`.');

test.use({ api: { realFonts: true } });

// The footer prints the current year; freezing the date keeps the references valid on January 1st.
const FIXED_NOW = new Date('2026-10-01T12:00:00Z');

const screenshot = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  threshold: 0,
  maxDiffPixels: 0
};

/** Parts that change on their own: the rotating word, the timed hint, the certificate frame (a live iframe). */
const moving = (page: import('@playwright/test').Page) => [
  page.locator('app-text .rotating-word'),
  page.locator('.mat-mdc-snack-bar-container'),
  page.locator('app-certificate-sheet .frame')
];

for (const lang of ['PT-BR', 'EN'] as const) {
  test.describe(lang, () => {
    // Every screen in Portuguese (the default); in English, the pages and the consent banner.
    const covered = lang === 'PT-BR' ? screens : screens.filter((screen) => !screen.setup || screen.production);

    for (const screen of covered) {
      test(screen.name, async ({ page }) => {
        await page.clock.setFixedTime(FIXED_NOW);
        await openScreen(page, screen, lang);

        await expect(page).toHaveScreenshot(`${screen.name}-${lang}.png`, {
          ...screenshot,
          fullPage: (screen.capture ?? 'page') === 'page',
          mask: moving(page)
        });
      });
    }
  });
}
