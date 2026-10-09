import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService, ConsentChoice } from '../../analytics/analytics.service';

@Component({
    selector: 'app-consent-banner',
    imports: [MatButtonModule, TranslateModule],
    templateUrl: './consent-banner.component.html',
    styleUrls: ['./consent-banner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsentBannerComponent {
  private readonly analytics = inject(AnalyticsService);


  readonly visible = this.analytics.consentBannerVisible;

  choose(choice: ConsentChoice): void {
    this.analytics.setConsent(choice);
  }
}
