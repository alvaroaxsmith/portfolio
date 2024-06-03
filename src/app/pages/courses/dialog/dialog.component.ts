import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseService } from '../services/courses.service';
import { Course } from '../interfaces/courses.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  safeUrl: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public rowData: Course,
    private courseService: CourseService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadCourseData();
  }

  loadCourseData(): void {
    if (this.rowData && !this.rowData.name) {
      this.courseService.getCourses()
        .pipe(
          tap(courses => {
            const matchingCourse = courses.find(course => course.name === this.rowData.link);
            if (matchingCourse) {
              this.rowData = matchingCourse;
              this.safeUrl = this.getSafeUrl(matchingCourse.link);
            }
          })
        )
        .subscribe();
    } else {
      this.safeUrl = this.getSafeUrl(this.rowData.link);
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
