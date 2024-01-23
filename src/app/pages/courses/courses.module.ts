import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesComponent } from './courses.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: CoursesComponent },
];

@NgModule({
  declarations: [CoursesComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild()],
  exports: [
    CoursesComponent,
  ],
})
export class CoursesModule { }