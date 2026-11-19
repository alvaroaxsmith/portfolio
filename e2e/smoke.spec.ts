import type { Page } from '@playwright/test';
import { courses, expect, open, repos, settled, test } from './fixtures';

const pages = [
  { path: '/', heading: 'Engenheiro de Software | GenAI | Full Cycle' },
  { path: '/about-me', heading: 'Quem sou eu?' },
  { path: '/courses', heading: 'Aprendizado contínuo' },
  { path: '/portfolio', heading: 'Código aberto' },
  { path: '/contact', heading: 'Vamos conversar' }
];

test.describe('every page', () => {
  for (const { path, heading } of pages) {
    test(`${path} opens directly by URL`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await open(page, path);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      expect(errors).toEqual([]);
    });
  }
});

test('the menu loads every lazy page without a full reload', async ({ page }) => {
  await open(page, '/');
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });

  for (const { path, heading } of pages.slice(1)) {
    await nav.locator(`a[href="${path}"]`).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});

test('the pages are downloaded in the background, so a first visit waits for no code', async ({ page }) => {
  const mermaidMarker = 'Syntax error in text';
  const scripts: { url: string; mermaid: Promise<boolean> }[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) {
      scripts.push({ url: response.url(), mermaid: response.text().then((body) => body.includes(mermaidMarker), () => false) });
    }
  });
  await open(page, '/');
  await page.waitForLoadState('networkidle');
  const preloaded = scripts.length;
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });

  for (const { path, heading } of pages.slice(1)) {
    await nav.locator(`a[href="${path}"]`).dispatchEvent('click');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }

  expect(scripts.slice(preloaded).map(({ url }) => url), 'scripts downloaded on a click').toEqual([]);
  // Mermaid only draws the career journey, so it stays out of the preloading.
  expect((await Promise.all(scripts.map(({ mermaid }) => mermaid))).some(Boolean)).toBe(false);
});

test('switching to English translates the page and is remembered after a reload', async ({ page }) => {
  await open(page, '/about-me');

  await page.getByRole('button', { name: 'TRADUÇÃO' }).click();
  await page.getByRole('menuitemradio', { name: 'EN' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who am I?');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.reload();
  await expect(page.locator('main#main-content')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who am I?');
});

test('entrance animations end with the content fully visible', async ({ page }) => {
  await open(page, '/');
  await expect(page.locator('app-text .rotating-word.shown')).toHaveCSS('opacity', '1', { timeout: 5_000 });

  await page.getByRole('navigation', { name: 'Navegação principal' }).locator('a[href="/portfolio"]').click();
  const firstCard = page.locator('.project-wrapper').first();
  await expect(firstCard).toContainText('angular-portfolio');
  await expect(firstCard).toHaveCSS('opacity', '1');
});

test('about me draws the career journey diagram when an experience is opened', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page, '/about-me');

  await page.locator('mat-card.timeline-content').first().click();

  await expect(page.locator('[data-experience-id="1"] svg')).toBeVisible();
  expect(errors).toEqual([]);
});

test('about me downloads Mermaid only when the journey is opened', async ({ page }) => {
  // A string only Mermaid's own code carries, to tell its files apart from the app's.
  const mermaidMarker = 'Syntax error in text';
  const scripts: Promise<boolean>[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) {
      scripts.push(response.text().then((body) => body.includes(mermaidMarker), () => false));
    }
  });
  const mermaidLoaded = async () => (await Promise.all(scripts)).some(Boolean);

  await open(page, '/about-me');
  await page.waitForLoadState('networkidle');
  expect(await mermaidLoaded()).toBe(false);

  await page.locator('mat-card.timeline-content').first().click();
  await expect(page.locator('[data-experience-id="1"] svg')).toBeVisible();
  expect(await mermaidLoaded()).toBe(true);
});

test.describe('the home photo', () => {
  const PHOTO = 'https://avatars.githubusercontent.com/u/69737979?v=4';

  test('does not wait for the GitHub API', async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url() === 'https://api.github.com/users/alvaroaxsmith') apiCalls.push(request.url());
    });
    await open(page, '/');

    await expect(page.locator('.hero-media img')).toBeVisible();
    await expect(page.locator('.hero-media img')).toHaveAttribute('src', PHOTO);
    expect(apiCalls).toEqual([]);
  });

  test('shows the fallback picture when the photo fails', async ({ page }) => {
    await page.route(PHOTO, (route) => route.fulfill({ status: 500, body: '' }));
    await page.route('https://github.com/alvaroaxsmith.png', (route) => route.fulfill({ path: 'e2e/assets/avatar.png' }));
    await open(page, '/');

    await expect(page.locator('.hero-media img')).toHaveAttribute('src', 'https://github.com/alvaroaxsmith.png');
    await expect(page.locator('.hero-media img')).toBeVisible();
    await expect(page.locator('app-photo-skeleton')).toHaveCount(0);
  });
});

test.describe('courses', () => {
  test('lists, filters and opens a certificate', async ({ page }) => {
    await open(page, '/courses');
    const rows = page.locator('tr.course-row');
    await expect(rows).toHaveCount(courses.length);

    await page.getByRole('textbox').fill('scrum');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Scrum Foundation');

    await rows.first().click();
    const sheet = page.locator('.certificate-sheet');
    await expect(sheet.getByRole('heading', { name: 'Scrum Foundation' })).toBeVisible();
    await expect(sheet.locator('iframe')).toHaveAttribute('src', courses[1].link);
  });

  test.describe('when the course list cannot be loaded (for example a 404 right after a deploy)', () => {
    test.use({ api: { coursesFail: true } });

    test('the page still opens', async ({ page }) => {
      await open(page, '/courses');

      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aprendizado contínuo');
    });

    test('stops loading and tells the visitor (#72)', async ({ page }) => {
      await open(page, '/courses');

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.locator('app-courses-skeleton')).toHaveCount(0);
    });
  });
});

test.describe('projects', () => {
  const portfolioRepos = repos.filter((repo) => repo.topics.includes('portfolio-project'));

  test('lists only portfolio repositories, most recent first, and filters by technology', async ({ page }) => {
    await open(page, '/portfolio');
    const cards = page.locator('mat-card.project-card');
    await expect(cards.first()).toContainText('angular-portfolio');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Java', exact: true }).click();

    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('spring-api');
    await expect(page.getByText('private-notes')).toHaveCount(0);
  });

  test('loads the remaining projects when scrolling to the end', async ({ page }) => {
    await open(page, '/portfolio');
    const cards = page.locator('mat-card.project-card');
    await expect(cards.first()).toBeVisible();

    await page.locator('.load-more-trigger').scrollIntoViewIfNeeded();

    await expect(cards).toHaveCount(portfolioRepos.length);
  });

  test.describe('when GitHub is unavailable', () => {
    test.use({ api: { githubFails: true } });

    test('shows the error message instead of loading forever', async ({ page }) => {
      await open(page, '/portfolio');

      await expect(page.locator('.no-projects-message')).toContainText('github.com/alvaroaxsmith');
    });
  });
});

test.describe('consent banner on the production site', () => {
  test.beforeEach(async ({ page }) => {
    // The inline GTM snippet only enables analytics on the production host; pretend we are on it without loading GTM.
    await page.addInitScript(() => {
      Object.defineProperty(window, '__analytics', { get: () => ({ enabled: true }), set: () => undefined });
    });
  });

  test('asks for consent once and remembers the choice', async ({ page }) => {
    await open(page, '/');
    const banner = page.getByRole('region', { name: 'Privacidade' });
    await expect(banner).toBeVisible();

    await banner.getByRole('button').first().click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.locator('main#main-content')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('region', { name: 'Privacidade' })).toBeHidden();
  });
});

test.describe('the course hint', () => {
  const hint = (page: Page) => page.locator('mat-snack-bar-container.course-hint');

  // The hint stays up for five seconds; a click the hint swallows would only land after it leaves.
  const prompt = { timeout: 1_000 };

  /** Waits for the site's entrance (the menu slides in), but not for the hint's own five-second clock. */
  async function openCoursesWithHint(page: Page) {
    await open(page, '/courses');
    await page.locator('.shell').evaluate((shell) => Promise.all(shell.getAnimations().map((animation) => animation.finished)));
    await expect(hint(page)).toBeVisible();
  }

  test('leaves the menu links clickable while it is open', async ({ page }) => {
    await openCoursesWithHint(page);

    await page.getByRole('navigation', { name: 'Navegação principal' }).locator('a[href="/contact"]').click(prompt);

    await expect(page).toHaveURL('/contact');
  });

  test('leaves the mobile menu button clickable while it is open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openCoursesWithHint(page);

    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click(prompt);

    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closes when the visitor leaves the courses page', async ({ page }) => {
    await open(page, '/courses');
    await expect(hint(page)).toBeVisible();

    // Dispatched straight to the link, so this checks the closing on its own, apart from what covers the menu.
    await page.getByRole('navigation', { name: 'Navegação principal' }).locator('a[href="/portfolio"]').dispatchEvent('click');

    await expect(page).toHaveURL('/portfolio');
    await expect(hint(page)).toHaveCount(0, prompt);
  });
});

test.describe('the menu lines up with the page margins', () => {
  /** Left of the first link's text and right of the last control, against the left and right of the page heading block. */
  async function edges(page: Page, lastControl: string) {
    return page.evaluate((last) => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return {
        menuLeft: box('nav li:first-child .mdc-button__label').left,
        menuRight: box(last).right,
        pageLeft: box('main h1').left,
        pageRight: box('.container').right
      };
    }, lastControl);
  }

  test('on a desktop screen', async ({ page }) => {
    await open(page, '/about-me');
    const { menuLeft, menuRight, pageLeft, pageRight } = await edges(page, '.language-form mat-icon');

    expect(Math.abs(menuLeft - pageLeft), `menu starts at ${menuLeft}, page at ${pageLeft}`).toBeLessThanOrEqual(1);
    expect(Math.abs(menuRight - pageRight), `menu ends at ${menuRight}, page at ${pageRight}`).toBeLessThanOrEqual(1);
  });

  test('on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/about-me');
    const { menuLeft, menuRight, pageLeft, pageRight } = await edges(page, '.menu-button');

    expect(Math.abs(menuLeft - pageLeft), `menu starts at ${menuLeft}, page at ${pageLeft}`).toBeLessThanOrEqual(1);
    expect(Math.abs(menuRight - pageRight), `menu ends at ${menuRight}, page at ${pageRight}`).toBeLessThanOrEqual(1);
  });
});

test.describe('the floating menu keeps the links where they were at the top', () => {
  /** Horizontal edges of every visible menu control, as the visitor sees them. */
  const edges = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('nav li a .mdc-button__label, .language-form mat-icon, .menu-button')]
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => {
          const { left, right } = el.getBoundingClientRect();
          return [Math.round(left), Math.round(right)];
        })
    );

  async function float(page: Page) {
    // Scrolling down hides the menu and scrolling back up brings it back as the floating bar.
    await page.mouse.wheel(0, 600);
    await expect(page.locator('app-navbar')).toHaveClass(/navbar-fixed/);
    await page.mouse.wheel(0, -150);
    await expect(page.locator('app-navbar')).not.toHaveClass(/navbar-hidden/);
    await settled(page);
  }

  for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
    test(`on a ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await open(page, '/about-me');
      await settled(page);
      const atTop = await edges(page);

      await float(page);

      expect(await edges(page)).toEqual(atTop);
    });
  }
});

test.describe('loading placeholders', () => {
  const projectsOnHold = (page: Page) => page.route('https://api.github.com/users/alvaroaxsmith/repos**', () => undefined);
  const animationOf = (page: Page) =>
    page.locator('app-project-card-skeleton app-skeleton').first().evaluate((el) => getComputedStyle(el).animationName);

  test('shimmer while the content loads', async ({ page }) => {
    await projectsOnHold(page);
    await open(page, '/portfolio');

    expect(await animationOf(page)).not.toBe('none');
  });

  test('stay still for visitors who ask for less motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await projectsOnHold(page);
    await open(page, '/portfolio');

    expect(await animationOf(page)).toBe('none');
  });
});

test.describe('career cards on a touch screen', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  /** Drags a finger 100px up inside the visible career card and returns how far the card scrolled. */
  async function swipe(page: Page, withoutPageHandlers: boolean): Promise<number> {
    await open(page, '/about-me');
    const card = page.locator('.carousel-item:not([inert]) mat-card-content').first();
    await card.scrollIntoViewIfNeeded();
    if (withoutPageHandlers) {
      // A copy of the same element, without the listeners the page added: the browser's own touch scrolling.
      await card.evaluate((el) => el.replaceWith(el.cloneNode(true)));
    }
    const box = (await card.boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const x = box.x + box.width / 2;
    const y = box.y + box.height * 0.7;
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', at = y) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: at }] });
    await touch('touchStart');
    for (let step = 1; step <= 10; step++) {
      await touch('touchMove', y - step * 10);
    }
    await touch('touchEnd');
    await page.waitForTimeout(600);
    return card.evaluate((el) => el.scrollTop);
  }

  test('scroll as far as the finger moves, like any scrolling box', async ({ page }) => {
    const native = await swipe(page, true);
    const actual = await swipe(page, false);

    expect(Math.abs(actual - native), `scrolled ${actual}px, the browser alone ${native}px`).toBeLessThanOrEqual(10);
  });
});

test('the app runs without zone.js: signals schedule the rendering', async ({ page }) => {
  await open(page, '/');

  expect(await page.evaluate(() => typeof (window as unknown as { Zone?: unknown }).Zone)).toBe('undefined');
  // And it still renders what changes: the navbar reacts to scrolling, the menu navigates.
  await page.mouse.wheel(0, 300);
  await expect(page.locator('app-navbar')).toHaveClass(/navbar-hidden/);
  await page.mouse.wheel(0, -100);
  await expect(page.locator('app-navbar')).not.toHaveClass(/navbar-hidden/);
  await expect(page.locator('app-navbar')).toHaveClass(/navbar-fixed/);
  await page.getByRole('navigation', { name: 'Navegação principal' }).locator('a[href="/contact"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vamos conversar');
});
