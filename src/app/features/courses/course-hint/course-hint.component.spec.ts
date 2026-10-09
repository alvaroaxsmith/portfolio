import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { CourseHintComponent } from './course-hint.component';

describe('CourseHintComponent (course hint)', () => {
  let fixture: ComponentFixture<CourseHintComponent>;
  let host: HTMLElement;
  let ref: jasmine.SpyObj<MatSnackBarRef<CourseHintComponent>>;
  let liveRegion: HTMLElement;

  function render(insideLiveRegion: boolean) {
    ref = jasmine.createSpyObj<MatSnackBarRef<CourseHintComponent>>('MatSnackBarRef', ['dismiss']);
    TestBed.configureTestingModule({
      imports: [CourseHintComponent, TranslateModule.forRoot()],
      providers: [{ provide: MatSnackBarRef, useValue: ref }]
    });
    fixture = TestBed.createComponent(CourseHintComponent);
    host = fixture.nativeElement;
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
    if (insideLiveRegion) {
      liveRegion.appendChild(host);
    }
    fixture.detectChanges();
  }

  afterEach(() => liveRegion.remove());

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  it('waits until Material moves it into the aria-live region before animating', async () => {
    render(false);
    expect(host.classList).not.toContain('is-ready');

    liveRegion.appendChild(host);
    await nextFrame();
    await nextFrame();
    fixture.detectChanges();

    expect(host.classList).toContain('is-ready');
  });

  it('starts right away when it is already in the aria-live region', () => {
    render(true);
    fixture.detectChanges();

    expect(host.classList).toContain('is-ready');
  });

  it('does not repeat the announcement with its own status role', () => {
    render(true);

    expect(host.querySelector('[role="status"]')).toBeNull();
  });

  it('closes itself when the clock completes its turn', fakeAsync(() => {
    render(true);

    fixture.componentInstance.onTimerEnd();
    fixture.detectChanges();
    expect(host.classList).toContain('is-leaving');
    expect(ref.dismiss).not.toHaveBeenCalled();

    tick(280);
    expect(ref.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('closes when the visitor clicks the close button, only once', fakeAsync(() => {
    render(true);
    const close: HTMLButtonElement = host.querySelector('button.hint-close')!;

    close.click();
    close.click();
    tick(280);

    expect(ref.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('pauses the clock while hovered or focused', () => {
    render(true);

    host.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(host.classList).toContain('is-paused');

    host.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(host.classList).not.toContain('is-paused');

    host.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    expect(host.classList).toContain('is-paused');
  });
});
