import { MaterialModule } from './material/material.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { Dialog } from './components/navbar/dialog/dialog.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContactComponent } from './pages/contact/contact.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProjectsService } from './pages/portfolio/services/projects.service';
import { DialogComponent } from './pages/courses/dialog/dialog.component';
import { TextComponent } from './pages/home/text/text.component'
import { AboutMeModule } from './pages/about-me/about-me.module';

@NgModule({
  declarations: [
    AppComponent,
    Dialog,
    HomeComponent,
    NavbarComponent,
    PortfolioComponent,
    FooterComponent,
    ContactComponent,
    CoursesComponent,
    DialogComponent,
    TextComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    MatDialogModule,
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
