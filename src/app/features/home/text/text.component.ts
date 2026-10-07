import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    animations: [
        trigger('trocar-palavras', [
            state('inicial', style({ opacity: 0, transform: 'translateX(-100px)' })),
            transition('inicial => mostrar', [
                animate('1500ms', style({ opacity: 1, transform: 'translateX(0px)' })),
            ]),
            transition('mostrar => inicial', [
                style({ opacity: 0, transform: 'translateX(-100px)' }),
                animate('1500ms', style({ opacity: 1, transform: 'translateX(0px)' })),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule]
})
export class TextComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);

  palavras: string[] = ['Full Cycle Development', 'GenAI'];
  readonly estadoAnimacao = signal('inicial');
  readonly indiceAtual = signal(0);
  private timer?: ReturnType<typeof setTimeout>;
  private frame?: number;

  ngOnInit() {
    this.timer = setTimeout(() => {
      this.trocarPalavras();
    }, 1000);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }
  }

  trocarPalavras() {
    this.estadoAnimacao.set('inicial');
    this.timer = setTimeout(() => {
      this.indiceAtual.set((this.indiceAtual() + 1) % this.palavras.length);
      this.estadoAnimacao.set('mostrar');

      this.frame = requestAnimationFrame(() => {
        this.timer = setTimeout(() => {
          this.estadoAnimacao.set('inicial');
          this.trocarPalavras();
        }, 4000);
      });
    }, 100);
  }

  getTranslatedWord(word: string): string {
    return this.translate.instant(word);
  }
}
