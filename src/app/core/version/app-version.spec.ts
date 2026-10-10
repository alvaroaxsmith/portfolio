import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { version } from '../../../../package.json';
import { provideAppVersion } from './app-version';

describe('provideAppVersion', () => {
  let info: jasmine.Spy;

  beforeEach(async () => {
    info = spyOn(console, 'info');
    TestBed.configureTestingModule({ providers: [provideAppVersion()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
  });

  // The tag lives in the real <head>; remove it so later specs see the page as it was.
  afterEach(() => TestBed.inject(Meta).removeTag('name="version"'));

  it('exposes the released version in the page, without showing it', () => {
    expect(TestBed.inject(Meta).getTag('name="version"')?.content).toBe(version);
  });

  it('prints the version once in the console, to tell which release is live', () => {
    expect(info).toHaveBeenCalledOnceWith(`portfolio v${version}`);
  });
});
