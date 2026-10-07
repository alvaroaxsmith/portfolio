import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextComponent],
      imports: [TranslateModule.forRoot(), NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
  });

  it('shows the first word before the rotation starts', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('Full Cycle Development');
    expect(component.estadoAnimacao).toBe('inicial');
  });

  it('swaps to the next word one second after loading, then animates it in', fakeAsync(() => {
    fixture.detectChanges();

    tick(1000);
    expect(component.estadoAnimacao).toBe('inicial');

    tick(100);
    fixture.detectChanges();
    expect(component.indiceAtual).toBe(1);
    expect(component.estadoAnimacao).toBe('mostrar');
    expect(fixture.nativeElement.textContent.trim()).toBe('GenAI');

    // Stop the endless rotation so the test can finish (the leak itself is F-04).
    const nextCycle = spyOn(component, 'trocarPalavras');
    tick(16 + 4000);
    expect(component.estadoAnimacao).toBe('inicial');
    expect(nextCycle).toHaveBeenCalledTimes(1);
  }));

  it('stops rotating once removed from the page', fakeAsync(() => {
    fixture.detectChanges();
    tick(1100);
    const swaps = spyOn(component, 'trocarPalavras').and.callThrough();

    fixture.destroy();
    tick(60_000);

    expect(swaps).not.toHaveBeenCalled();
  }));

  it('never starts rotating when removed before the first swap', fakeAsync(() => {
    fixture.detectChanges();

    fixture.destroy();
    tick(60_000);

    expect(component.indiceAtual).toBe(0);
  }));

  it('wraps back to the first word after the last one', fakeAsync(() => {
    component.indiceAtual = component.palavras.length - 1;
    fixture.detectChanges();

    tick(1100);
    expect(component.indiceAtual).toBe(0);

    spyOn(component, 'trocarPalavras');
    tick(16 + 4000);
  }));
});
