import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), TextComponent]
}).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
  });

  it('shows the first word before the rotation starts', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.rotating-word').textContent.trim()).toBe('Full Cycle Development');
    expect(component.animationState()).toBe('hidden');
  });

  it('swaps to the next word one second after loading, then animates it in', fakeAsync(() => {
    fixture.detectChanges();

    tick(1000);
    expect(component.animationState()).toBe('hidden');

    tick(100);
    fixture.detectChanges();
    expect(component.currentIndex()).toBe(1);
    expect(component.animationState()).toBe('shown');
    expect(fixture.nativeElement.querySelector('.rotating-word').textContent.trim()).toBe('GenAI');

    // Stop the endless rotation so the test can finish (the leak itself is F-04).
    const nextCycle = spyOn(component, 'showNextWord');
    tick(16 + 4000);
    expect(component.animationState()).toBe('hidden');
    expect(nextCycle).toHaveBeenCalledTimes(1);
  }));

  it('stops rotating once removed from the page', fakeAsync(() => {
    fixture.detectChanges();
    tick(1100);
    const swaps = spyOn(component, 'showNextWord').and.callThrough();

    fixture.destroy();
    tick(60_000);

    expect(swaps).not.toHaveBeenCalled();
  }));

  it('never starts rotating when removed before the first swap', fakeAsync(() => {
    fixture.detectChanges();

    fixture.destroy();
    tick(60_000);

    expect(component.currentIndex()).toBe(0);
  }));

  it('wraps back to the first word after the last one', fakeAsync(() => {
    component.currentIndex.set(component.words.length - 1);
    fixture.detectChanges();

    tick(1100);
    expect(component.currentIndex()).toBe(0);

    spyOn(component, 'showNextWord');
    tick(16 + 4000);
  }));

  it('shows the word only once it is time to slide it in', fakeAsync(() => {
    fixture.detectChanges();
    const word = () => fixture.nativeElement.querySelector('.rotating-word') as HTMLElement;
    expect(word().classList).not.toContain('shown');

    tick(1100);
    fixture.detectChanges();
    expect(word().classList).toContain('shown');

    spyOn(component, 'showNextWord');
    tick(16 + 4000);
  }));

  describe('pausing (WCAG 2.2.2)', () => {
    const toggle = () => fixture.nativeElement.querySelector('button.rotation-toggle') as HTMLButtonElement;
    const pointer = (type: string, pointerType: string) =>
      fixture.nativeElement.dispatchEvent(new PointerEvent(type, { pointerType }));

    /** Runs up to the first word on screen, then one full showing: a running rotation hides it. */
    function oneShowingLater() {
      tick(1100);
      fixture.detectChanges();
      tick(16 + 4000);
    }

    afterEach(() => {
      // The rotation never ends by itself; stop it so fakeAsync can finish.
      fixture.destroy();
    });

    it('offers a control next to the word, with a name in the visitor\'s language', () => {
      fixture.detectChanges();

      expect(toggle().getAttribute('aria-label')).toBe('home.rotation.pause');
      expect(toggle().getAttribute('aria-pressed')).toBe('false');
      expect(toggle().textContent?.trim()).toBe('pause');
    });

    it('holds the word while the mouse is over it, and moves on once it leaves', fakeAsync(() => {
      fixture.detectChanges();
      tick(1100);
      pointer('pointerenter', 'mouse');

      tick(16 + 4000);
      expect([component.currentIndex(), component.animationState()]).toEqual([1, 'shown']);

      pointer('pointerleave', 'mouse');
      expect(component.animationState()).toBe('hidden');
      tick(100);
      expect(component.currentIndex()).toBe(0);
    }));

    it('ignores the hover a touch screen emulates, so a tap only toggles', fakeAsync(() => {
      fixture.detectChanges();
      pointer('pointerenter', 'touch');

      oneShowingLater();

      expect(component.animationState()).toBe('hidden');
    }));

    it('holds the word while the control has keyboard focus', fakeAsync(() => {
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      toggle().focus();

      oneShowingLater();
      expect(component.animationState()).toBe('shown');

      toggle().blur();
      expect(component.animationState()).toBe('hidden');
      fixture.nativeElement.remove();
    }));

    it('shows the word when paused before it first slid in', fakeAsync(() => {
      fixture.detectChanges();
      toggle().click();

      tick(1000);

      expect([component.currentIndex(), component.animationState()]).toEqual([0, 'shown']);
    }));

    it('toggles with a tap on the word itself, since the button only shows once paused', () => {
      fixture.detectChanges();
      const word = fixture.nativeElement.querySelector('.rotating-word') as HTMLElement;

      word.click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-pressed')).toBe('true');

      word.click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-pressed')).toBe('false');
    });

    it('stays paused after a click or tap until pressed again', fakeAsync(() => {
      fixture.detectChanges();
      toggle().click();
      fixture.detectChanges();

      expect(toggle().getAttribute('aria-pressed')).toBe('true');
      expect(toggle().textContent?.trim()).toBe('play_arrow');
      oneShowingLater();
      expect(component.animationState()).toBe('shown');

      toggle().click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-pressed')).toBe('false');
      expect(component.animationState()).toBe('hidden');
    }));

    it('starts paused, with the first word on screen, when the visitor asks for less motion', fakeAsync(() => {
      spyOn(window, 'matchMedia').and.callFake((query: string) => ({ matches: query.includes('reduce') }) as MediaQueryList);
      fixture = TestBed.createComponent(TextComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(toggle().getAttribute('aria-pressed')).toBe('true');
      expect(component.animationState()).toBe('shown');
      oneShowingLater();
      expect([component.currentIndex(), component.animationState()]).toEqual([0, 'shown']);

      toggle().click();
      tick(100);
      expect(component.currentIndex()).toBe(1);
    }));
  });
});
