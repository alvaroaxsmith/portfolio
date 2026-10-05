import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterComponent implements OnInit {

  dataAtual = new Date();
  anoAtual = this.dataAtual.getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;

  constructor(
    public translate: TranslateService,
    public analytics: AnalyticsService
  ) {
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

}
