import { MaterialModule } from './material/material.module';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { Dialog } from './components/navbar/dialog/dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { ContactComponent } from './pages/contact/contact.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProjectsService } from './pages/portfolio/services/projects.service';
import { DialogComponent } from './pages/courses/dialog/dialog.component';
import { AboutMeModule } from './pages/about-me/about-me.module';
import { CoursesModule } from './pages/courses/courses.module';
import { HomeModule } from './pages/home/home.module';
import { PortfolioModule } from './pages/portfolio/portfolio.module';

@NgModule({
  declarations: [
    AppComponent,
    Dialog,
    NavbarComponent,
    SplashScreenComponent,
    ContactComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    MatDialogModule,
    CoursesModule,
    HomeModule,
    PortfolioModule,
    AboutMeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    ProjectsService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function appInitializerFactory(translate: TranslateService) {
  return () => {
    const supportedLangs = ['EN', 'PT-BR'];
    translate.addLangs(supportedLangs);
    const defaultAppLanguage = 'EN';
    let langToUse = defaultAppLanguage;
    if (!supportedLangs.includes(langToUse)) {
      langToUse = supportedLangs[0] || 'EN';
    }
    translate.setDefaultLang(langToUse);
    // Carrega as traduções sem delay adicional - vai executar em paralelo com a splash screen
    return translate.use(langToUse).toPromise();
  };
}
