import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DEFAULT_LANG } from '../../core/i18n/language-storage';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { environment } from '../../../environments/environment';
import { TextComponent } from './text/text.component';
import { MatButton } from '@angular/material/button';
import { PhotoSkeletonComponent } from '../../shared/skeleton/photo-skeleton/photo-skeleton.component';
import { FooterComponent } from '../../core/layout/footer/footer.component';

/** The same photo served by the site itself, so it still shows when the GitHub host that serves the avatar is down or blocked. */
const FALLBACK_IMAGE_URL = 'assets/img/alvaro.jpg';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TextComponent, MatButton, PhotoSkeletonComponent, FooterComponent, TranslatePipe]
})
export class HomeComponent {
  private readonly translate = inject(TranslateService);
  private readonly analytics = inject(AnalyticsService);

  /** The photo, then the public profile picture if it fails. */
  protected readonly photoUrl = signal(environment.avatarUrl);
  /** Whether the photo is on screen; the placeholder stays until then. */
  protected readonly photoLoaded = signal(false);

  trackCvDownload(): void {
    this.analytics.track('cv_download', { language: this.translate.getCurrentLang() ?? DEFAULT_LANG });
  }

  trackLinkedin(): void {
    this.analytics.track('linkedin_click', { location: 'home' });
  }

  onPhotoError(): void {
    if (this.photoUrl() !== FALLBACK_IMAGE_URL) {
      this.photoUrl.set(FALLBACK_IMAGE_URL);
      return;
    }
    // Both pictures failed: stop showing a placeholder that would never end.
    this.photoLoaded.set(true);
  }
}
