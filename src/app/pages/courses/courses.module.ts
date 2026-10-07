import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesComponent } from './courses.component';
import { DialogComponent } from './dialog/dialog.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'src/app/components/skeleton/skeleton.module';

const routes: Routes = [
  { path: '', component: CoursesComponent },
];

@NgModule({
    imports: [CommonModule, MaterialModule, SkeletonModule, RouterModule.forChild(routes), TranslateModule.forChild(), CoursesComponent, DialogComponent],
    exports: [
        CoursesComponent,
    ],
})
export class CoursesModule { }