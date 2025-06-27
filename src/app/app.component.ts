import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionar OnInit e OnDestroy
import { TranslateService, LangChangeEvent } from '@ngx-translate/core'; // Adicionar LangChangeEvent
import { Subscription } from 'rxjs'; // Adicionar Subscription

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy { // Implementar OnInit e OnDestroy
  title = 'portfolio';
  private langChangeSubscription: Subscription | undefined; // Para gerenciar a inscrição

  constructor(private translate: TranslateService) {
    this.initializeAppLanguage();
  }

  ngOnInit() {
    // Inscrever-se nas mudanças de idioma
    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log('Evento de mudança de idioma:', event);
      console.log('Novo idioma ativo:', event.lang);
      console.log('Traduções para o novo idioma:', event.translations);
      console.log('Idioma padrão atual (após mudança):', this.translate.defaultLang);
    });
  }

  initializeAppLanguage() {
    const supportedLangs = ['EN', 'PT-BR'];
    this.translate.addLangs(supportedLangs);

    // Defina o idioma padrão que você deseja usar, independentemente do navegador.
    // Por exemplo, 'EN' ou 'PT-BR'.
    const defaultAppLanguage = 'EN';
    let langToUse = defaultAppLanguage;

    // Opcional: Verifique se o idioma padrão definido está na lista de idiomas suportados.
    // Se não estiver, você pode definir um fallback para o primeiro idioma suportado.
    if (!supportedLangs.includes(langToUse)) {
      console.warn(`Idioma padrão definido "${langToUse}" não está na lista de idiomas suportados [${supportedLangs.join(', ')}]. Usando o primeiro idioma suportado como fallback.`);
      langToUse = supportedLangs[0] || 'EN'; // Fallback para o primeiro da lista ou 'EN' se a lista estiver vazia
    }

    this.translate.setDefaultLang(langToUse);
    // O use() aqui define o idioma inicial.
    this.translate.use(langToUse).subscribe(() => {
      console.log('Idioma ativo (inicial):', this.translate.currentLang);
      console.log('Idioma padrão (inicial):', this.translate.defaultLang);
    });
  }

  ngOnDestroy() {
    // Cancelar a inscrição para evitar vazamentos de memória
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}
