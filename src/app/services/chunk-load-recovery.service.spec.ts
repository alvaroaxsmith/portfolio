import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import {
  ChunkLoadRecoveryService,
  PAGE_RELOAD,
  isChunkLoadError
} from './chunk-load-recovery.service';

@Component({ template: 'ok', standalone: true })
class StubPageComponent {}

const CHROME_ERROR = new TypeError('Failed to fetch dynamically imported module: https://site/chunk-hbAydUjR.js');

describe('isChunkLoadError', () => {
  it('recognizes chunk load failures from Chrome, Firefox and Safari', () => {
    expect(isChunkLoadError(CHROME_ERROR)).toBeTrue();
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module: https://site/chunk.js'))).toBeTrue();
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBeTrue();
    expect(isChunkLoadError({ name: 'ChunkLoadError', message: 'Loading chunk 7 failed.' })).toBeTrue();
  });

  it('ignores unrelated errors', () => {
    expect(isChunkLoadError(new Error('Cannot match any routes. URL Segment: x'))).toBeFalse();
    expect(isChunkLoadError(new TypeError('Cannot read properties of undefined'))).toBeFalse();
    expect(isChunkLoadError(undefined)).toBeFalse();
    expect(isChunkLoadError(null)).toBeFalse();
  });
});

describe('ChunkLoadRecoveryService', () => {
  let reload: jasmine.Spy<(url: string) => void>;

  function setup(routes: Routes = [{ path: '', component: StubPageComponent }]) {
    reload = jasmine.createSpy('reload');
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: PAGE_RELOAD, useValue: reload }]
    });
    return TestBed.inject(ChunkLoadRecoveryService);
  }

  beforeEach(() => sessionStorage.removeItem('portfolio:chunk-reload'));
  afterEach(() => sessionStorage.removeItem('portfolio:chunk-reload'));

  it('reloads the destination page when a lazy route chunk fails to load', async () => {
    const service = setup([
      { path: '', component: StubPageComponent },
      { path: 'about-me', loadChildren: () => Promise.reject(CHROME_ERROR) }
    ]);
    const subscription = service.watch();

    await TestBed.inject(Router).navigateByUrl('/about-me').catch(() => false);

    expect(reload).toHaveBeenCalledOnceWith('/about-me');
    subscription.unsubscribe();
  });

  it('does not reload on navigation errors unrelated to chunks', async () => {
    const service = setup([
      { path: '', component: StubPageComponent },
      { path: 'broken', loadChildren: () => Promise.reject(new Error('module bug')) }
    ]);
    const subscription = service.watch();

    await TestBed.inject(Router).navigateByUrl('/broken').catch(() => false);

    expect(reload).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('reloads only once within the retry window to avoid reload loops', () => {
    const service = setup();

    expect(service.recover('/courses')).toBeTrue();
    expect(service.recover('/courses')).toBeFalse();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads again after the retry window has passed', () => {
    const service = setup();
    sessionStorage.setItem('portfolio:chunk-reload', String(Date.now() - 60_000));

    expect(service.recover('/portfolio')).toBeTrue();
    expect(reload).toHaveBeenCalledOnceWith('/portfolio');
  });

  it('still recovers when sessionStorage is unavailable', () => {
    const service = setup();
    spyOn(sessionStorage, 'getItem').and.throwError('blocked');
    spyOn(sessionStorage, 'setItem').and.throwError('blocked');

    expect(service.recover('/about-me')).toBeTrue();
    expect(reload).toHaveBeenCalledOnceWith('/about-me');
  });
});
