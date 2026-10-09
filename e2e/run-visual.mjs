// Runs the visual regression in the Playwright Linux image when Docker is available, so `npm run verify`
// (and the pre-push hook) compares pixels before pushing. Without Docker it says so loudly and leaves the
// comparison to the `visual` job in CI, instead of passing silently.
import { spawnSync } from 'node:child_process';

const docker = spawnSync('docker', ['info'], { stdio: 'ignore' });

if (docker.status !== 0) {
  console.warn(
    '\n⚠  Visual regression NOT run: Docker is not running.\n' +
      '   Start Docker and run `npm run test:visual`, or rely on the `visual` check of the pull request.\n'
  );
  process.exit(0);
}

const run = spawnSync('npm', ['run', '-s', 'test:visual'], { stdio: 'inherit' });
process.exit(run.status ?? 1);
