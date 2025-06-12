import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'portfolio';

  constructor(private translate: TranslateService) {
    this.initializeAppLanguage();
  }

  initializeAppLanguage() {
    const supportedLangs = ['EN', 'PT-BR'];
    this.translate.addLangs(supportedLangs);

    let langToUse = 'EN'; // Idioma padrão
    const browserLangRaw = this.translate.getBrowserLang();

    if (browserLangRaw) {
      // Extrai a parte principal do idioma (ex: 'en' de 'en-US', 'pt' de 'pt-BR')
      const browserLang = browserLangRaw.split('-')[0].toUpperCase();

      // Mapeia para os idiomas suportados pela aplicação
      if (browserLang === 'PT' && supportedLangs.includes('PT-BR')) {
        langToUse = 'PT-BR';
      } else if (supportedLangs.includes(browserLang)) {
        langToUse = browserLang;
      }
    }

    this.translate.setDefaultLang(langToUse);
    this.translate.use(langToUse); // Define o idioma ativo da aplicação
  }
}
