import { courses, expect, open, repos, test } from './fixtures';

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

test('switching to English translates the page and is remembered after a reload', async ({ page }) => {
  await open(page, '/about-me');

  await page.getByRole('button', { name: 'TRADUÇÃO' }).click();
  await page.getByRole('menuitem', { name: 'EN' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who am I?');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.reload();
  await expect(page.locator('main#main-content')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who am I?');
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

  test.describe('when the courses API is down', () => {
    test.use({ api: { coursesFail: true } });

    test('the page still opens', async ({ page }) => {
      await open(page, '/courses');

      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aprendizado contínuo');
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
    const banner = page.getByRole('dialog');
    await expect(banner).toBeVisible();

    await banner.getByRole('button').first().click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.locator('main#main-content')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
