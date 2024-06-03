import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImageService } from '../home/services/image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private imageSubscription: Subscription | undefined;
  isLoadingImage: boolean = true;
  imageUrl: string | undefined;

  constructor(
    private translate: TranslateService,
    private imageService: ImageService
  ) {
    translate.addLangs(['EN', 'PT-BR']);
    translate.setDefaultLang('EN');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
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
