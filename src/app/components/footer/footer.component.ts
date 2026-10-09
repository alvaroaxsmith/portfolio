import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterComponent {

  anoAtual = new Date().getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;

  constructor(public analytics: AnalyticsService) {}
}
