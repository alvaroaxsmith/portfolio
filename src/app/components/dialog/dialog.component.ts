import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class Dialog  {
  constructor(
    public translate: TranslateService
    ) {
      translate.addLangs(['EN', 'PT-BR']);
      translate.setDefaultLang('EN');
     }

  switchLang(lang: string) {
    this.translate.use(lang);
  }
}
