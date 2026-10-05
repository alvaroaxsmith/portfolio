import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';
import { ProjectCardSkeletonComponent } from './project-card-skeleton/project-card-skeleton.component';
import { CoursesSkeletonComponent } from './courses-skeleton/courses-skeleton.component';

@NgModule({
  declarations: [SkeletonComponent, ProjectCardSkeletonComponent, CoursesSkeletonComponent],
  imports: [CommonModule],
  exports: [SkeletonComponent, ProjectCardSkeletonComponent, CoursesSkeletonComponent],
})
export class SkeletonModule { }
