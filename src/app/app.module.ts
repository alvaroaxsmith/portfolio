import { MaterialModule } from './material/material.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { Dialog } from './components/navbar/dialog/dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContactComponent } from './pages/contact/contact.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
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
        deps: [HttpClient]
      }
    })
  ],
  providers: [ProjectsService],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
