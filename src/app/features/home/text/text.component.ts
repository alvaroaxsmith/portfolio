import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    // The word disappears at once, and the next one slides in from the left.
    styles: `
      .palavra-container {
        opacity: 0;
        transform: translateX(-100px);
      }
      .palavra-container.mostrar {
        opacity: 1;
        transform: none;
        transition: opacity 1.5s, transform 1.5s;
      }
      @media (prefers-reduced-motion: reduce) {
        .palavra-container.mostrar {
          transition: none;
        }
      }
    `,
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
