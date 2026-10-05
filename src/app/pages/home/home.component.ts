import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImageService } from '../home/services/image.service';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  private imageSubscription: Subscription | undefined;
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
    this.imageService.getImage(0)
      .then(url => {
        this.isLoadingImage = false;
        this.imageUrl = url;
      })
      .catch(error => {
        console.error('Error loading image:', error);
      });
  }

  ngOnDestroy(): void {
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }
}
