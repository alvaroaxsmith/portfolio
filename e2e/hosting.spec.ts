import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from './fixtures';
import { openScreen, screens } from './screens';

/**
 * Hosting rules from vercel.json (cache, security headers, the 404 for missing files, the report-only CSP).
 * e2e/serve.mjs applies the same file, so these run against the rules production gets.
 */

const browser = join(__dirname, '..', 'dist', 'portfolio_resume', 'browser');
const config = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf-8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const reportOnlyCsp = config.headers.flatMap((rule) => rule.headers).find((h) => h.key === 'Content-Security-Policy-Report-Only')!.value;

test.describe('cache', () => {
  test('keeps hashed build files for a year, and always revalidates the page itself', async ({ request }) => {
    const chunk = readdirSync(browser).find((file) => /^chunk-.+\.js$/.test(file))!;

    const file = await request.get(`/${chunk}`);
    const page = await request.get('/about-me');

    expect(file.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(page.headers()['cache-control'] ?? '').not.toContain('immutable');
  });

  test('does not cache files whose name has no hash, such as the translations', async ({ request }) => {
    const translations = await request.get('/assets/i18n/EN.json');

    expect(translations.headers()['cache-control'] ?? '').not.toContain('immutable');
  });
});

test('sends the security headers with every response', async ({ request }) => {
  const headers = (await request.get('/')).headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toBe("frame-ancestors 'none'");
  expect(headers['content-security-policy-report-only']).toContain("default-src 'self'");
});

test.describe('missing files', () => {
  test('a missing file answers 404 instead of the site HTML', async ({ request }) => {
    const missing = await request.get('/chunk-DOESNOTX.js');

    expect(missing.status()).toBe(404);
    expect(missing.headers()['content-type'] ?? '').not.toContain('text/html');
  });

  test('a page address still opens the site', async ({ request }) => {
    for (const path of ['/about-me', '/this-page-does-not-exist']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('text/html');
    }
  });
});

test('the CSP allows every inline script of the built page, by hash', async ({ page }) => {
  const html = readFileSync(join(browser, 'index.html'), 'utf-8');
  // Parsed by the browser (DOMParser runs no script), so the hashed text is exactly what the browser hashes.
  // Scripts with src are covered by 'self'.
  const inline = await page.evaluate(
    (source) =>
      Array.from(new DOMParser().parseFromString(source, 'text/html').querySelectorAll('script:not([src])')).map(
        (script) => script.textContent ?? ''
      ),
    html
  );

  expect(inline.length).toBeGreaterThan(0);
  for (const body of inline) {
    const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
    expect(reportOnlyCsp, `inline script starting "${body.trim().slice(0, 40)}"`).toContain(hash);
  }
});

test.describe('the report-only CSP would block nothing', () => {
  for (const screen of screens) {
    test(screen.name, async ({ page }) => {
      await page.addInitScript(() => {
        const found: string[] = [];
        (window as unknown as { cspViolations: string[] }).cspViolations = found;
        document.addEventListener('securitypolicyviolation', (event) =>
          found.push(`${event.effectiveDirective} ${event.blockedURI}`)
        );
      });

      await openScreen(page, screen);

      expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([]);
    });
  }
});

test.describe('page metadata before any JavaScript runs', () => {
  const head = () => readFileSync(join(browser, 'index.html'), 'utf-8');

  test('has a preview image for social networks, and the canonical address', () => {
    const html = head();

    expect(html).toContain('<meta property="og:image" content="https://avatars.githubusercontent.com/u/69737979?v=4">');
    expect(html).toContain('<meta name="twitter:image" content="https://avatars.githubusercontent.com/u/69737979?v=4">');
    expect(html).toContain('<meta property="og:url" content="https://alvaromachadoferreira.vercel.app/">');
    expect(html).toContain('<link rel="canonical" href="https://alvaromachadoferreira.vercel.app/">');
  });

  test('preconnects to the font files with CORS, as they are fetched', () => {
    expect(head()).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  });
});
