// Serves the production build like Vercel does, with the rules of vercel.json: static files first, then its
// rewrites (index.html for page addresses), a 404 for anything else, and its headers on every response.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..', 'dist', 'portfolio_resume', 'browser');
const port = Number(process.env.PORT ?? 4300);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml'
};

const vercel = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'vercel.json'), 'utf-8'));
/** Vercel sources are path-to-regexp patterns; ours only use regex groups, named or not. */
const pattern = (source) => new RegExp(`^${source.replace(/:\w+(?=\()/g, '')}$`);
const rewrites = vercel.rewrites.map(({ source, destination }) => ({ match: pattern(source), destination }));
const headerRules = vercel.headers.map(({ source, headers }) => ({ match: pattern(source), headers }));

if (!existsSync(join(root, 'index.html'))) {
  console.error(`No build found in ${root}. Run "npx ng build" first.`);
  process.exit(1);
}

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '');
  const urlPath = path.replaceAll('\\', '/');
  for (const rule of headerRules) {
    if (rule.match.test(urlPath)) {
      rule.headers.forEach(({ key, value }) => res.setHeader(key, value));
    }
  }
  const isFile = (candidate) => existsSync(candidate) && !statSync(candidate).isDirectory();
  let file = join(root, path);
  if (!isFile(file)) {
    const rewrite = rewrites.find(({ match }) => match.test(urlPath));
    file = rewrite ? join(root, rewrite.destination) : null;
  }
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
