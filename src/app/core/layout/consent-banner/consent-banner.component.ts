import { Component, ChangeDetectionStrategy, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService, ConsentChoice } from '../../analytics/analytics.service';

@Component({
    selector: 'app-consent-banner',
    imports: [MatButtonModule, TranslatePipe],
    templateUrl: './consent-banner.component.html',
    styleUrls: ['./consent-banner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsentBannerComponent {
  private readonly analytics = inject(AnalyticsService);


  readonly visible = this.analytics.consentBannerVisible;
  private readonly banner = viewChild<ElementRef<HTMLElement>>('banner');
  /** Where focus was when the visitor reopened the banner (the footer link); it goes back there after the choice. */
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    // Reopened on request, the banner takes focus so keyboard users land on the choice. On the first visit it
    // shows by itself and leaves focus alone.
    afterRenderEffect(() => {
      const banner = this.banner()?.nativeElement;
      if (banner && this.analytics.consentBannerReopened() && !banner.contains(document.activeElement)) {
        this.returnFocusTo = document.activeElement as HTMLElement | null;
        banner.focus();
      }
    });
  }

  choose(choice: ConsentChoice): void {
    this.analytics.setConsent(choice);
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }
}
