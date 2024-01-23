import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutMeComponent } from './about-me.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  { path: '', component: AboutMeComponent },
];

@NgModule({
  declarations: [AboutMeComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild()],
  exports: [
    AboutMeComponent,
  ],
})
export class AboutMeModule { }
