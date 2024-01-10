import { Component, OnInit } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  dataAtual = new Date();
  anoAtual = this.dataAtual.getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;

  constructor(
    public translate: TranslateService
  ) {
    translate.addLangs(['EN', 'PT-BR']);
    translate.setDefaultLang('EN');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

}
