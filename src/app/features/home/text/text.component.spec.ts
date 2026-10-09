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

    expect(fixture.nativeElement.textContent.trim()).toBe('Full Cycle Development');
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
    expect(fixture.nativeElement.textContent.trim()).toBe('GenAI');

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
});
