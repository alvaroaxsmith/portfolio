import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CourseService } from '../services/courses.service';
import { Course } from '../interfaces/courses.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DialogComponent implements OnInit {
  safeUrl: SafeResourceUrl | null = null;
  externalUrl: string | null = null;
  isFrameLoaded = false;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public rowData: Course,
    private bottomSheetRef: MatBottomSheetRef<DialogComponent>,
    private courseService: CourseService,
    private domSanitizer: DomSanitizer,
    private analytics: AnalyticsService
  ) { }

  trackOpenNewTab(): void {
    this.analytics.track('certificate_open_new_tab', { course: this.rowData.name });
  }

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
              this.setUrls(matchingCourse.link);
            }
          })
        )
        .subscribe();
    } else {
      this.setUrls(this.rowData.link);
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onFrameLoad(): void {
    this.isFrameLoaded = true;
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  private setUrls(link: string): void {
    this.safeUrl = this.getSafeUrl(link);
    this.externalUrl = link.replace('/preview', '/view');
  }
}
