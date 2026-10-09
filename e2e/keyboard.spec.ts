import { Page } from '@playwright/test';
import { expect, open, settled, test } from './fixtures';

/**
 * Keyboard and focus behaviour that axe cannot see. Cases the site still fails are `test.fixme`, each naming
 * the issue that fixes it; that issue turns its case back into a plain `test`.
 */

interface TabStop {
  label: string;
  invisible: boolean;
}

/** Where focus is now, and whether a sighted keyboard user can see it. */
function currentStop(page: Page): Promise<TabStop | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    let invisible = rect.width === 0 || rect.height === 0;
    for (let node: HTMLElement | null = el; node && !invisible; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') {
        invisible = true;
      }
      if (node !== el && /hidden|clip/.test(style.overflow)) {
        const box = node.getBoundingClientRect();
        if (rect.right <= box.left || rect.left >= box.right || rect.bottom <= box.top || rect.top >= box.bottom) {
          invisible = true;
        }
        // A clipped element that takes focus makes the browser scroll its non-scrollable container to show it,
        // which pulls the content out of place (a carousel shows half a card). It was hidden until focused.
        if (node.scrollLeft !== 0 || node.scrollTop !== 0) {
          invisible = true;
        }
      }
    }
    if (rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) {
      invisible = true;
    }
    const label = (el.getAttribute('aria-label') || el.innerText || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
    return { label: `${el.tagName.toLowerCase()} "${label}"`, invisible };
  });
}

/** Tabs through the whole page once and returns the stops a sighted user could not see. */
async function invisibleTabStops(page: Page, maxStops = 80): Promise<string[]> {
  const invisible: string[] = [];
  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press('Tab');
    // The skip link slides in on focus.
    await settled(page);
    const stop = await currentStop(page);
    if (!stop) {
      break;
    }
    if (stop.invisible) {
      invisible.push(stop.label);
    }
  }
  return invisible;
}

test.describe('tab order shows every stop', () => {
  for (const path of ['/', '/courses', '/portfolio', '/contact']) {
    test(`${path} has no invisible tab stops`, async ({ page }) => {
      await open(page, path);

      expect(await invisibleTabStops(page)).toEqual([]);
    });
  }

  test.fixme('about me shows every stop, before the journey is opened (#73)', async ({ page }) => {
    await open(page, '/about-me');

    expect(await invisibleTabStops(page)).toEqual([]);
  });

  test.fixme('about me keeps closed journey cards out of the tab order (#73)', async ({ page }) => {
    await open(page, '/about-me');
    await page.locator('mat-card.timeline-content').first().click();
    await expect(page.locator('[data-experience-id="1"] svg')).toBeVisible();
    await page.locator('mat-card.mermaid-journey-card').first().click();
    await settled(page);
    await page.locator('h1').click();

    expect(await invisibleTabStops(page)).toEqual([]);
  });

  test.fixme('about me lets only the visible career card take focus (#73)', async ({ page }) => {
    await open(page, '/about-me');

    await expect(page.locator('.carousel-item mat-card[tabindex="0"]')).toHaveCount(1);
  });
});

test.describe('skip link', () => {
  test('is the first tab stop and becomes visible when focused', async ({ page }) => {
    await open(page, '/courses');

    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
  });

  test.fixme('moves focus past the navigation on the current page, without reloading (#72)', async ({ page }) => {
    await open(page, '/courses');
    await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');

    await expect(page).toHaveURL('/courses');
    expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
    const focusIsInNavigation = await page.evaluate(() => !!document.activeElement?.closest('app-navbar'));
    expect(focusIsInNavigation).toBe(false);
  });
});

test.describe('changing page', () => {
  test.fixme('moves focus to the new page heading (#73)', async ({ page }) => {
    await open(page, '/');
    await page.getByRole('navigation').locator('a[href="/contact"]').focus();

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL('/contact');
    await expect(page.locator('h1')).toBeFocused();
  });

  test.fixme('starts the new page at the top (#72)', async ({ page }) => {
    // From the bottom of a page to a longer one, so a kept scroll position would show.
    await open(page, '/courses');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);

    await page.locator('a[href="/about-me"]').first().dispatchEvent('click');

    await expect(page).toHaveURL('/about-me');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });

  test.fixme('the navigation stays visible while it has keyboard focus (#73)', async ({ page }) => {
    await open(page, '/about-me');
    // Two downward steps: the navbar hides on a scroll that goes down past a fifth of the viewport.
    for (const y of [300, 900]) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(y);
    }
    await expect(page.locator('app-navbar')).toHaveClass(/navbar-hidden/);

    await settled(page);

    await page.getByRole('navigation').locator('a[href="/portfolio"]').focus();
    await settled(page);

    await expect(page.getByRole('navigation').locator('a[href="/portfolio"]')).toBeInViewport();
  });
});

test.fixme('an unknown address shows a usable page instead of a blank screen (#72)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await open(page, '/this-page-does-not-exist');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /início|home/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
