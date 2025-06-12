import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class Dialog {
  constructor(public translate: TranslateService) { // Manter TranslateService injetado para uso
    // Remova as seguintes linhas:
    // translate.addLangs(['EN', 'PT-BR']);
    // translate.setDefaultLang('EN');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  trackByLang(index: number, lang: string): string {
    return lang; // Use um identificador único para cada item (neste caso, a própria string do idioma).
  }
}
