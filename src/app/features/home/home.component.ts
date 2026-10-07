import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ImageService } from './services/image.service';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TextComponent, MatButton, SkeletonComponent, FooterComponent, TranslateModule]
})
export class HomeComponent implements OnInit {
  isLoadingImage = true;
  imageUrl: string | undefined;

  constructor(
    private translate: TranslateService,
    private imageService: ImageService,
    private analytics: AnalyticsService
  ) {}

  trackCvDownload(): void {
    this.analytics.track('cv_download', { language: this.translate.currentLang });
  }

  trackLinkedin(): void {
    this.analytics.track('linkedin_click', { location: 'home' });
  }

  ngOnInit(): void {
    this.imageService.getImage()
      .then(url => {
        this.isLoadingImage = false;
        this.imageUrl = url;
      })
      .catch(error => {
        console.error('Error loading image:', error);
        this.imageUrl = FALLBACK_IMAGE_URL;
        this.isLoadingImage = false;
      });
  }
}
