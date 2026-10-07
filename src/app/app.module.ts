import { MaterialModule } from './material/material.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { Dialog } from './components/navbar/dialog/dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { ContactComponent } from './pages/contact/contact.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogComponent } from './pages/courses/dialog/dialog.component';
import { SkeletonModule } from './components/skeleton/skeleton.module';
import { ConsentBannerComponent } from './components/consent-banner/consent-banner.component';
import { provideAppLanguage } from './services/language-storage';
import { provideChunkLoadRecovery } from './services/chunk-load-recovery.service';

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
        SkeletonModule,
        ConsentBannerComponent,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient],
            },
        })], providers: [
        provideAppLanguage(),
        provideHttpClient(withInterceptorsFromDi()),
        provideChunkLoadRecovery(),
    ] })
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
