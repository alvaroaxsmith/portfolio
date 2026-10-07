import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './app.component';
import { Dialog } from './components/navbar/dialog/dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SkeletonModule } from './components/skeleton/skeleton.module';
import { ConsentBannerComponent } from './components/consent-banner/consent-banner.component';
import { provideAppLanguage } from './services/language-storage';
import { provideChunkLoadRecovery } from './services/chunk-load-recovery.service';

@NgModule({ declarations: [
        AppComponent,
        Dialog,
        NavbarComponent,
        SplashScreenComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        SkeletonModule,
        ConsentBannerComponent,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient],
            },
        })], providers: [
        provideAnimationsAsync(),
        provideAppLanguage(),
        provideHttpClient(withInterceptorsFromDi()),
        provideChunkLoadRecovery(),
    ] })
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
