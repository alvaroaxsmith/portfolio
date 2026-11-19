import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * scripts/vercel-ignore.sh is Vercel's Ignored Build Step: exit 0 skips the deployment, anything else deploys.
 * It runs here against a throwaway repository, with the variables Vercel sets.
 */

const script = join(__dirname, '..', 'scripts', 'vercel-ignore.sh');
let repo: string;

const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf-8' }).trim();
const commit = (files: string[]) => {
  for (const file of files) {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), `${file} ${Math.random()}\n`);
  }
  git('add', '-A');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-q', '-m', files.join(' '));
  return git('rev-parse', 'HEAD');
};
const deploys = (env: Record<string, string>) =>
  spawnSync('sh', [script], { cwd: repo, env: { PATH: process.env['PATH'], ...env } }).status !== 0;

test.beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'vercel-ignore-'));
  git('init', '-q');
  commit(['src/main.ts']);
});

test.afterEach(() => rmSync(repo, { recursive: true, force: true }));

test('vercel.json runs the script as its ignored build step', () => {
  const vercel = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf-8')) as { ignoreCommand?: string };
  expect(vercel.ignoreCommand).toBe('sh scripts/vercel-ignore.sh');
});

test('production always deploys, even when nothing visible changed', () => {
  const previous = git('rev-parse', 'HEAD');
  commit(['README.md']);
  expect(deploys({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_PREVIOUS_SHA: previous })).toBe(true);
});

test('the release branch gets no preview: it only changes the version and the changelog', () => {
  commit(['package.json', 'CHANGELOG.md']);
  expect(
    deploys({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'release-please--branches--main--components--portfolio-resume' })
  ).toBe(false);
});

test('a preview is skipped when only tests, workflows or docs changed since the last one', () => {
  const previous = git('rev-parse', 'HEAD');
  commit(['e2e/smoke.spec.ts', 'src/app/home/home.component.spec.ts', 'src/app/testing/fake.ts', '.github/workflows/ci.yml', 'docs/x.md', 'CLAUDE.md']);
  expect(deploys({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/x', VERCEL_GIT_PREVIOUS_SHA: previous })).toBe(false);
});

test('a preview deploys when something the visitor gets changed since the last one', () => {
  for (const file of ['src/app/home/home.component.ts', 'src/assets/i18n/EN.json', 'package-lock.json', 'vercel.json', 'scripts/vercel-output.mjs']) {
    const previous = git('rev-parse', 'HEAD');
    commit([file, 'e2e/smoke.spec.ts']);
    expect(deploys({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/x', VERCEL_GIT_PREVIOUS_SHA: previous }), file).toBe(true);
  }
});

test('a preview deploys when there is nothing to compare with: the first push, or a commit missing from the clone', () => {
  commit(['e2e/smoke.spec.ts']);
  expect(deploys({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/x' })).toBe(true);
  expect(deploys({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/x', VERCEL_GIT_PREVIOUS_SHA: 'a'.repeat(40) })).toBe(true);
});
