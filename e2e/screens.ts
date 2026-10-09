import { Page } from '@playwright/test';
import { expect, open, settled } from './fixtures';

export const DESKTOP = { width: 1280, height: 800 };
export const MOBILE = { width: 390, height: 844 };

export interface Screen {
  name: string;
  viewport: { width: number; height: number };
  path: string;
  /** Brings the page to the state under test, after it opened. */
  setup?: (page: Page) => Promise<void>;
  /** Pretend to be the production host, where analytics and the consent banner exist. */
  production?: boolean;
  /**
   * What a screenshot covers: the whole page, or only the window, for overlays fixed to it and for states
   * that responsive code would reset (a full-page capture briefly resizes the window).
   */
  capture?: 'page' | 'window';
}

const pages = [
  { slug: 'home', path: '/' },
  { slug: 'about-me', path: '/about-me' },
  { slug: 'courses', path: '/courses' },
  { slug: 'portfolio', path: '/portfolio' },
  { slug: 'contact', path: '/contact' }
];

/** Every page at both sizes, plus the states that only exist after an interaction. */
export const screens: Screen[] = [
  ...pages.map(({ slug, path }) => ({ name: `desktop-${slug}`, viewport: DESKTOP, path })),
  ...pages.map(({ slug, path }) => ({ name: `mobile-${slug}`, viewport: MOBILE, path })),
  {
    name: 'desktop-about-me-journey',
    capture: 'window',
    viewport: DESKTOP,
    path: '/about-me',
    setup: async (page) => {
      await page.locator('mat-card.timeline-content').first().click();
      await expect(page.locator('[data-experience-id="1"] svg')).toBeVisible();
    }
  },
  {
    name: 'desktop-courses-certificate',
    capture: 'window',
    viewport: DESKTOP,
    path: '/courses',
    setup: async (page) => {
      await page.locator('tr.course-row').first().click();
      await expect(page.locator('.certificate-sheet h2')).toBeVisible();
    }
  },
  {
    name: 'mobile-menu',
    capture: 'window',
    viewport: MOBILE,
    path: '/',
    setup: async (page) => {
      await page.locator('.mobile-menu-trigger button').click();
      await expect(page.locator('app-nav-menu-sheet')).toBeVisible();
    }
  },
  {
    name: 'desktop-home-consent',
    capture: 'window',
    viewport: DESKTOP,
    path: '/',
    production: true,
    setup: async (page) => {
      await expect(page.locator('app-consent-banner section')).toBeVisible();
    }
  }
];

/** Opens a screen in the given language and waits until nothing is still settling. */
export async function openScreen(page: Page, screen: Screen, lang: 'PT-BR' | 'EN' = 'PT-BR'): Promise<void> {
  await page.setViewportSize(screen.viewport);
  await page.addInitScript(
    ({ lang, production }) => {
      localStorage.setItem('portfolio:lang', lang);
      if (production) {
        Object.defineProperty(window, '__analytics', { get: () => ({ enabled: true }), set: () => undefined });
      }
    },
    { lang, production: !!screen.production }
  );
  await open(page, screen.path);
  await screen.setup?.(page);
  await page.evaluate(() => document.fonts.ready);
  // Lets lazy content and entrance animations finish before anything is measured.
  await page.waitForLoadState('networkidle');
  await settled(page);
}
