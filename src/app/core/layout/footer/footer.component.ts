import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MatTooltip } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, FontAwesomeModule, TranslateModule]
})
export class FooterComponent {
  analytics = inject(AnalyticsService);


  anoAtual = new Date().getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;
}
