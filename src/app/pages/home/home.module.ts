import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TextComponent } from './text/text.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [HomeComponent, TextComponent, FooterComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild(),],
  exports: [
    HomeComponent,
  ],
})
export class HomeModule { }