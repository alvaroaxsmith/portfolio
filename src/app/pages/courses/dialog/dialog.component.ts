import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CourseService } from '../services/courses.service';
import { Course } from '../interfaces/courses.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../../../services/analytics.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SkeletonComponent } from '../../../components/skeleton/skeleton.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconButton, MatIcon, SkeletonComponent, TranslateModule]
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

  onFrameLoad(event: Event): void {
    if (showsBlankPage(event.target as HTMLIFrameElement)) {
      return;
    }
    this.isFrameLoaded = true;
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  private setUrls(link: string): void {
    if (!isCertificateUrl(link)) {
      return;
    }
    this.safeUrl = this.getSafeUrl(link);
    this.externalUrl = link.replace('/preview', '/view');
  }
}

const CERTIFICATE_HOST = 'drive.google.com';

/** Links come from an external API and bypass Angular's sanitizer, so only Google Drive over HTTPS is trusted. */
function isCertificateUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname === CERTIFICATE_HOST;
  } catch {
    return false;
  }
}

/**
 * Browsers report a load for the iframe's initial blank page, sometimes only after the certificate address is set.
 * Once the certificate is in, the frame is cross-origin and reading its location throws.
 */
function showsBlankPage(iframe: HTMLIFrameElement): boolean {
  try {
    return iframe.contentWindow?.location.href === 'about:blank';
  } catch {
    return false;
  }
}
