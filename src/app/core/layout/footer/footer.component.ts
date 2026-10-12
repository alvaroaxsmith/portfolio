import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, FaIconComponent, TranslatePipe]
})
export class FooterComponent {
  protected readonly analytics = inject(AnalyticsService);


  currentYear = new Date().getFullYear();

  faAngular = faAngular;
  faNodeJs = faNodeJs;
}
