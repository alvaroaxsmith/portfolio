// Serves the Vercel build output (.vercel/output, written by scripts/vercel-output.mjs) the way Vercel does:
// the header routes on every response, then the static files, then the rewrite routes, and a 404 for anything else.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const output = join(import.meta.dirname, '..', '.vercel', 'output');
const root = join(output, 'static');
const port = Number(process.env.PORT ?? 4300);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml'
};

if (!existsSync(join(output, 'config.json'))) {
  console.error(`No build output found in ${output}. Run "npx ng build && node scripts/vercel-output.mjs" first.`);
  process.exit(1);
}

const { routes } = JSON.parse(readFileSync(join(output, 'config.json'), 'utf-8'));
const filesystem = routes.findIndex((route) => route.handle === 'filesystem');
const compile = (route) => ({ ...route, match: new RegExp(route.src) });
const headerRoutes = routes.slice(0, filesystem).map(compile);
const rewriteRoutes = routes.slice(filesystem + 1).map(compile);

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '');
  const urlPath = path.replaceAll('\\', '/');
  for (const route of headerRoutes) {
    if (route.match.test(urlPath)) {
      Object.entries(route.headers).forEach(([key, value]) => res.setHeader(key, value));
    }
  }
  const isFile = (candidate) => existsSync(candidate) && !statSync(candidate).isDirectory();
  let file = join(root, path);
  if (!isFile(file)) {
    const rewrite = rewriteRoutes.find(({ match }) => match.test(urlPath));
    file = rewrite ? join(root, rewrite.dest) : null;
  }
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
