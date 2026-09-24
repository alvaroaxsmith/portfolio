import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
export class TextComponent implements OnInit {
  palavras: string[] = ['Full Cycle Development', 'GenAI'];
  estadoAnimacao = 'inicial';
  indiceAtual = 0;

  constructor(private readonly translate: TranslateService) { }

  ngOnInit() {
    setTimeout(() => {
      this.trocarPalavras();
    }, 1000);
  }

  trocarPalavras() {
    this.estadoAnimacao = 'inicial';
    setTimeout(() => {
      this.indiceAtual = (this.indiceAtual + 1) % this.palavras.length;
      this.estadoAnimacao = 'mostrar';

      requestAnimationFrame(() => {
        setTimeout(() => {
          this.estadoAnimacao = 'inicial';
          this.trocarPalavras();
        }, 4000);
      });
    }, 100);
  }

  // Método para obter a palavra traduzida
  getTranslatedWord(word: string): string {
    return this.translate.instant(word);
  }
}
