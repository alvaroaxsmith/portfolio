import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TextComponent implements OnInit, OnDestroy {
  palavras: string[] = ['Full Cycle Development', 'GenAI'];
  estadoAnimacao = 'inicial';
  indiceAtual = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private frame?: number;

  constructor(private readonly translate: TranslateService) { }

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
    this.estadoAnimacao = 'inicial';
    this.timer = setTimeout(() => {
      this.indiceAtual = (this.indiceAtual + 1) % this.palavras.length;
      this.estadoAnimacao = 'mostrar';

      this.frame = requestAnimationFrame(() => {
        this.timer = setTimeout(() => {
          this.estadoAnimacao = 'inicial';
          this.trocarPalavras();
        }, 4000);
      });
    }, 100);
  }

  getTranslatedWord(word: string): string {
    return this.translate.instant(word);
  }
}
