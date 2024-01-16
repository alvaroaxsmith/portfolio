import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseService } from '../services/courses.service';
import { Course } from '../interfaces/courses.interface';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public rowData: Course,
    private courseService: CourseService,
    private domSanitizer: DomSanitizer
  ) {
    this.loadCourseData();
  }

  ngOnInit(): void { }

  loadCourseData(): void {
    if (this.rowData && !this.rowData.name) {
      this.courseService.getCourses().subscribe(courses => {
        this.rowData = courses.find(course => course.name === this.rowData.link) || this.rowData;
      });
    }
  }

  getSafeUrl(url: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
