import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ImageService } from './services/image.service';
import { DEFAULT_LANG } from '../../core/i18n/language-storage';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { environment } from '../../../environments/environment';
import { TextComponent } from './text/text.component';
import { MatButton } from '@angular/material/button';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { FooterComponent } from '../../core/layout/footer/footer.component';

/** Served by github.com rather than the API, so it keeps working when the API is rate limited. */
const FALLBACK_IMAGE_URL = `https://github.com/${environment.githubUser}.png`;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TextComponent, MatButton, SkeletonComponent, FooterComponent, TranslatePipe]
})
export class HomeComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly imageService = inject(ImageService);
  private readonly analytics = inject(AnalyticsService);

  readonly isLoadingImage = signal(true);
  readonly imageUrl = signal<string | undefined>(undefined);

  trackCvDownload(): void {
    this.analytics.track('cv_download', { language: this.translate.getCurrentLang() ?? DEFAULT_LANG });
  }

  trackLinkedin(): void {
    this.analytics.track('linkedin_click', { location: 'home' });
  }

  ngOnInit(): void {
    this.imageService.getImage()
      .then(url => {
        this.isLoadingImage.set(false);
        this.imageUrl.set(url);
      })
      .catch(error => {
        console.error('Error loading image:', error);
        this.imageUrl.set(FALLBACK_IMAGE_URL);
        this.isLoadingImage.set(false);
      });
  }
}
