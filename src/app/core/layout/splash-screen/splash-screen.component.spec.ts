import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SplashScreenComponent } from './splash-screen.component';

type SplashWindow = Window & { __splash?: { startedAt: number; finish: jasmine.Spy } };

describe('SplashScreenComponent', () => {
  const win = window as SplashWindow;
  let fixture: ComponentFixture<SplashScreenComponent>;
  let finished: jasmine.Spy;

  function setup(translations: Record<string, unknown>, engineStartedMsAgo: number | null) {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), SplashScreenComponent]
});
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('PT-BR', translations);
    translate.use('PT-BR');
    if (engineStartedMsAgo !== null) {
      win.__splash = {
        startedAt: performance.now() - engineStartedMsAgo,
        finish: jasmine.createSpy('finish').and.returnValue(Promise.resolve())
      };
    }
    fixture = TestBed.createComponent(SplashScreenComponent);
    finished = jasmine.createSpy('animationFinished');
    fixture.componentInstance.animationFinished.subscribe(finished);
    fixture.detectChanges();
  }

  afterEach(() => delete win.__splash);

  const letters = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.letter') as NodeListOf<HTMLElement>).map((el) => el.textContent);

  it('shows the translated loading text, one element per letter', fakeAsync(() => {
    setup({ splash: { loading: 'Loading' } }, 0);

    expect(letters()).toEqual(['L', 'o', 'a', 'd', 'i', 'n', 'g']);
    expect(fixture.nativeElement.querySelector('.loading').getAttribute('aria-label')).toBe('Loading');
    expect(fixture.nativeElement.querySelectorAll('.dots i').length).toBe(3);
    tick(3000);
    flushMicrotasks();
  }));

  it('falls back to "Carregando" when the translation is missing', fakeAsync(() => {
    setup({}, 0);

    expect(fixture.componentInstance.text).toBe('Carregando');
    tick(3000);
    flushMicrotasks();
  }));

  it('stays at least 3 seconds since the grid first appeared before leaving', fakeAsync(() => {
    setup({}, 1000);

    tick(1800);
    expect(win.__splash!.finish).not.toHaveBeenCalled();

    tick(300);
    expect(win.__splash!.finish).toHaveBeenCalledTimes(1);
    flushMicrotasks();
  }));

  it('leaves right away when the grid has already been on screen for 3 seconds', fakeAsync(() => {
    setup({}, 5000);

    tick(0);

    expect(win.__splash!.finish).toHaveBeenCalledTimes(1);
    flushMicrotasks();
  }));

  it('hides the text during the exit and releases the page only when the exit ends', fakeAsync(() => {
    let resolveExit!: () => void;
    setup({}, 5000);
    win.__splash!.finish.and.returnValue(new Promise<void>((resolve) => (resolveExit = resolve)));

    tick(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('is-leaving');
    expect(finished).not.toHaveBeenCalled();

    resolveExit();
    flushMicrotasks();
    fixture.detectChanges();
    expect(finished).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.classList).toContain('is-done');
  }));

  it('still releases the page after 3 seconds if the grid engine is missing', fakeAsync(() => {
    setup({}, null);

    tick(3000);
    flushMicrotasks();

    expect(finished).toHaveBeenCalledTimes(1);
  }));
});
