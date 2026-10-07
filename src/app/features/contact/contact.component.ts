import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FontAwesomeModule, TranslateModule]
})
export class ContactComponent {
  private analytics = inject(AnalyticsService);


  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faEnvelope = faEnvelope;
  faLocation = faLocationDot;
  faPhone = faPhone;

  trackContact(channel: string): void {
    this.analytics.track('contact_click', { channel });
  }

}
