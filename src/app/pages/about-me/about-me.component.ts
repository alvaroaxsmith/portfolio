import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent {

  constructor(
    public translate: TranslateService
  ) {
    translate.addLangs(['EN', 'PT-BR']);
    translate.setDefaultLang('EN');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  skills: string[] = [
    'Angular',
    'Typescript',
    'Javascript/ Typescript',
    'React',
    'NodeJS',
    'Docker',
    'Git',
    'AWS',
    'Java/ Spring Boot',
    'MySQL',
    'MongoDB',
    'HTML/ CSS',
    'Python FastAPI',
    'CI/CD Jenkins',

  ];

}
