import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService, ConsentChoice } from '../../services/analytics.service';

@Component({
    selector: 'app-consent-banner',
    imports: [MatButtonModule, TranslateModule],
    templateUrl: './consent-banner.component.html',
    styleUrls: ['./consent-banner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsentBannerComponent {
  constructor(private readonly analytics: AnalyticsService) {}

  readonly visible = this.analytics.consentBannerVisible;

  choose(choice: ConsentChoice): void {
    this.analytics.setConsent(choice);
  }
}
