// Writes the build as Vercel's Build Output API (https://vercel.com/docs/build-output-api/v3): the files in
// .vercel/output/static and the rules of vercel.json as routes in .vercel/output/config.json.
// Handed a plain build folder, Vercel's framework preset added its own fallback that answered index.html for every
// missing path, even with no rewrites at all. A build output is served exactly as written: headers, then the files,
// then our rewrites, and a 404 for anything else.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = join(import.meta.dirname, '..');
const build = join(repo, 'dist', 'portfolio_resume', 'browser');
const output = join(repo, '.vercel', 'output');

/** vercel.json sources are path-to-regexp patterns; ours only use regex groups, named or not. */
export const toRegex = (source) => `^${source.replace(/:\w+(?=\()/g, '')}$`;

export function routesFrom(vercel) {
  return [
    ...vercel.headers.map(({ source, headers }) => ({
      src: toRegex(source),
      headers: Object.fromEntries(headers.map(({ key, value }) => [key, value])),
      continue: true
    })),
    { handle: 'filesystem' },
    ...vercel.rewrites.map(({ source, destination }) => ({ src: toRegex(source), dest: destination }))
  ];
}

if (!existsSync(join(build, 'index.html'))) {
  console.error(`No build found in ${build}. Run "npx ng build" first.`);
  process.exit(1);
}

const vercel = JSON.parse(readFileSync(join(repo, 'vercel.json'), 'utf-8'));
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(build, join(output, 'static'), { recursive: true });
writeFileSync(join(output, 'config.json'), `${JSON.stringify({ version: 3, routes: routesFrom(vercel) }, null, 2)}\n`);
console.log(`Vercel build output written to ${output}`);
