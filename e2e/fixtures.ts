import { join } from 'node:path';
import { test as base, expect, Page } from '@playwright/test';

export const courses = [
  { field: 'Tecnologia', name: 'Java Full Stack', link: 'https://drive.google.com/file/d/java/preview', time: 640, school: 'Soul Code', date: '2022/05' },
  { field: 'Gestão', name: 'Scrum Foundation', link: 'https://drive.google.com/file/d/scrum/preview', time: 20, school: 'CertiProf', date: '2023/02' },
  { field: 'Tecnologia', name: 'Angular Avançado', link: 'https://drive.google.com/file/d/angular/preview', time: 40, school: 'Alura', date: '2024/08' }
];

const repo = (id: number, name: string, language: string, pushedAt: string, topics = ['portfolio-project']) => ({
  id,
  name,
  language,
  description: `${name} description`,
  html_url: `https://github.com/alvaroaxsmith/${name}`,
  pushed_at: pushedAt,
  topics
});

export const repos = [
  repo(1, 'angular-portfolio', 'TypeScript', '2026-09-01T00:00:00Z'),
  repo(2, 'spring-api', 'Java', '2026-08-01T00:00:00Z'),
  repo(3, 'fastapi-bff', 'Python', '2026-07-01T00:00:00Z'),
  repo(4, 'react-dashboard', 'TypeScript', '2026-06-01T00:00:00Z'),
  repo(5, 'nest-gateway', 'TypeScript', '2026-05-01T00:00:00Z'),
  repo(6, 'micro-frontends', 'JavaScript', '2026-04-01T00:00:00Z'),
  repo(7, 'private-notes', 'Markdown', '2026-03-01T00:00:00Z', [])
];

export interface ApiOptions {
  githubFails?: boolean;
  coursesFail?: boolean;
  /** Lets Google Fonts through, so screenshots show the real typography and Material icons. */
  realFonts?: boolean;
}

const AVATAR_URL = 'https://avatars.githubusercontent.com/u/0';

/** Fakes every third-party call so the suite never depends on GitHub, json-server, Google or GTM being up. */
export async function mockApis(page: Page, options: ApiOptions = {}): Promise<void> {
  await page.route(
    (url) => url.hostname !== 'localhost',
    (route) => route.fulfill({ status: 204, body: '' })
  );
  if (options.realFonts) {
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.continue());
  }
  await page.route(AVATAR_URL, (route) => route.fulfill({ path: join(__dirname, 'assets', 'avatar.png') }));
  await page.route('https://api.github.com/users/alvaroaxsmith', (route) =>
    options.githubFails
      ? route.fulfill({ status: 403, json: { message: 'rate limited' } })
      : route.fulfill({ json: { avatar_url: AVATAR_URL } })
  );
  await page.route('https://api.github.com/users/alvaroaxsmith/repos**', (route) =>
    options.githubFails ? route.fulfill({ status: 403, json: { message: 'rate limited' } }) : route.fulfill({ json: repos })
  );
  await page.route('https://json-server-vercel-beta-six.vercel.app/courses', (route) =>
    options.coursesFail ? route.fulfill({ status: 500, body: '' }) : route.fulfill({ json: { courses } })
  );
}

/** Opens a route and waits for the splash screen to hand over to the app. */
export async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('main#main-content')).toBeVisible({ timeout: 15_000 });
}

/** Waits for every running transition and finite animation, so visibility is judged on the final frame. */
export async function settled(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined))
    )
  );
}

export const test = base.extend<{ api: ApiOptions }>({
  api: [{}, { option: true }],
  page: async ({ page, api }, use) => {
    await mockApis(page, api);
    await use(page);
  }
});

export { expect };
