import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImageService } from '../home/services/image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoadingImage = true;
  imageUrl: string | undefined;

  constructor(
    public translate: TranslateService,
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
        console.log('Image loaded successfully');
        this.isLoadingImage = false;
        this.imageUrl = url;
      })
      .catch(error => console.error(error));
  }
}
