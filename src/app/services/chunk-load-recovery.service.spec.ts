import { ApplicationInitStatus, Component, EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Router, Routes, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import {
  ChunkLoadRecoveryService,
  PAGE_RELOAD,
  isChunkLoadError,
  provideChunkLoadRecovery
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

  it('recognizes Safari rejecting an HTML page served in place of a missing chunk', () => {
    expect(isChunkLoadError(new TypeError("'text/html' is not a valid JavaScript MIME type."))).toBeTrue();
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
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let reloadClicked: Subject<void>;

  function setup(routes: Routes = [{ path: '', component: StubPageComponent }], providers: (Provider | EnvironmentProviders)[] = []) {
    reload = jasmine.createSpy('reload');
    reloadClicked = new Subject<void>();
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    snackBar.open.and.returnValue({ onAction: () => reloadClicked } as unknown as MatSnackBarRef<TextOnlySnackBar>);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter(routes),
        { provide: PAGE_RELOAD, useValue: reload },
        { provide: MatSnackBar, useValue: snackBar },
        ...providers
      ]
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
    spyOn(console, 'error');

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

  it('does not reload by itself when it cannot remember the attempt, so it can never loop', () => {
    const service = setup();
    spyOn(console, 'error');
    spyOn(sessionStorage, 'getItem').and.throwError('blocked');
    spyOn(sessionStorage, 'setItem').and.throwError('blocked');

    expect(service.recover('/about-me')).toBeFalse();
    expect(reload).not.toHaveBeenCalled();
  });

  describe('when it gives up on reloading by itself', () => {
    function giveUp() {
      const service = setup();
      spyOn(console, 'error');
      service.recover('/courses');
      service.recover('/courses');
      reload.calls.reset();
    }

    it('tells the user the page could not be loaded and offers to reload it', () => {
      giveUp();

      expect(snackBar.open).toHaveBeenCalledOnceWith('chunkLoad.failed', 'chunkLoad.reload');
      expect(reload).not.toHaveBeenCalled();

      reloadClicked.next();

      expect(reload).toHaveBeenCalledOnceWith('/courses');
    });

    it('logs the failure', () => {
      giveUp();

      expect(console.error).toHaveBeenCalled();
    });
  });

  it('starts watching navigations as soon as the app starts', async () => {
    setup(
      [
        { path: '', component: StubPageComponent },
        { path: 'portfolio', loadChildren: () => Promise.reject(CHROME_ERROR) }
      ],
      [provideChunkLoadRecovery()]
    );
    await TestBed.inject(ApplicationInitStatus).donePromise;

    await TestBed.inject(Router).navigateByUrl('/portfolio').catch(() => false);

    expect(reload).toHaveBeenCalledOnceWith('/portfolio');
  });
});
