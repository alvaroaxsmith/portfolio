import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { version } from '../../../../package.json';

/**
 * Tells which release is live without changing the page: a <meta name="version"> and one console line.
 * The version comes from package.json, which release-please bumps on every release.
 */
export function provideAppVersion(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(Meta).updateTag({ name: 'version', content: version });
      console.info(`portfolio v${version}`);
    })
  ]);
}
