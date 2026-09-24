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
import { HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProjectsService } from './pages/portfolio/services/projects.service';
import { DialogComponent } from './pages/courses/dialog/dialog.component';

@NgModule({ declarations: [
        AppComponent,
        Dialog,
        NavbarComponent,
        SplashScreenComponent,
        ContactComponent,
        DialogComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        MatDialogModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient],
            },
        })], providers: [
        ProjectsService,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [TranslateService],
            multi: true,
        },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
    ] })
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function appInitializerFactory(translate: TranslateService) {
  return () => {
    const supportedLangs = ['EN', 'PT-BR'];
    translate.addLangs(supportedLangs);
    const defaultAppLanguage = 'PT-BR';
    let langToUse = defaultAppLanguage;
    if (!supportedLangs.includes(langToUse)) {
      langToUse = supportedLangs[0] || 'PT-BR';
    }
    translate.setDefaultLang(langToUse);
    return translate.use(langToUse).toPromise();
  };
}
