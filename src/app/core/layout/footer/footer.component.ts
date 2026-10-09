import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MatTooltip } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTooltip, FontAwesomeModule, TranslateModule]
})
export class FooterComponent {

  anoAtual = new Date().getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;

  constructor(public analytics: AnalyticsService) {}
}
