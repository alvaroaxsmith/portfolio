import { Component, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ElementRef, afterRenderEffect, computed, effect, inject, viewChild, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PHONE_LAYOUT, mediaQuery } from '../../core/media/media-query';
import { providePaginatorIntl } from '../../core/i18n/paginator-intl';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { CourseService } from './services/courses.service';
import { Course } from './course.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CertificateSheetComponent } from './certificate-sheet/certificate-sheet.component';
import { CourseHintComponent } from './course-hint/course-hint.component';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { CoursesStateService } from './services/courses-state.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CoursesSkeletonComponent } from '../../shared/skeleton/courses-skeleton/courses-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';

const MOBILE_BATCH_SIZE = 5;
@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MatInput, MatIcon, MatSuffix, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, CoursesSkeletonComponent, MatPaginator, TranslatePipe],
    // Translated paginator texts, provided here so the paginator stays out of the initial bundle.
    providers: [providePaginatorIntl()]
})
export class CoursesComponent implements AfterViewInit, OnDestroy {
  private readonly courseService = inject(CourseService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly snackBar = inject(MatSnackBar);
  private readonly analytics = inject(AnalyticsService);
  protected readonly state = inject(CoursesStateService);
  /** Phones get the card list and desktops the table: only the one on screen is rendered. */
  protected readonly phone = mediaQuery(PHONE_LAYOUT);

  protected readonly displayedColumns = ['field', 'name', 'time', 'school', 'date'];
  readonly dataSource = new MatTableDataSource<Course>();
  /** The course list; loading and failure are part of the resource, and leaving the page cancels it. */
  private readonly source = rxResource({ stream: () => this.courseService.getCourses() });
  readonly isLoading = computed(() => this.source.isLoading());
  readonly loadError = computed(() => !!this.source.error());

  /** The table filters through the data source; the mobile list reads the same courses and filter as signals. */
  private readonly courses = computed(() => (this.source.hasValue() ? this.source.value() : []));
  private readonly filter = signal(normalizeFilter(this.state.filter));
  /** How many cards the mobile list shows; kept in the state service too, so it survives leaving the page. */
  private readonly mobileCount = signal(this.state.mobileCount);

  protected readonly visibleCourses = computed(() => {
    const filter = this.filter();
    const courses = this.courses();
    return filter ? courses.filter((course) => this.dataSource.filterPredicate(course, filter)) : courses;
  });
  readonly mobileCourses = computed(() => this.visibleCourses().slice(0, this.mobileCount()));
  readonly hasMoreMobileCourses = computed(() => this.mobileCount() < this.visibleCourses().length);
  /** The hint on screen, closed when the visitor leaves: it speaks about this page only. */
  private hintRef?: MatSnackBarRef<CourseHintComponent>;
  private mobileObserver?: IntersectionObserver;
  private mobileTriggerEl?: HTMLElement;

  private readonly mobileLoadTrigger = viewChild<ElementRef<HTMLElement>>('mobileLoadTrigger');

  constructor() {
    afterRenderEffect(() => this.observeMobileTrigger(this.mobileLoadTrigger()?.nativeElement));
    // The sort and the paginator exist only while the table is on screen; the data source follows them as they come
    // and go. Their saved state reaches them through the template bindings.
    // The table filters and pages through the data source, which follows the loaded courses and the filter.
    effect(() => {
      this.dataSource.data = this.courses();
      this.dataSource.filter = this.filter();
    });
    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      this.dataSource.paginator = this.paginator() ?? null;
    });
  }

  private observeMobileTrigger(trigger: HTMLElement | undefined): void {
    if (this.mobileTriggerEl) {
      this.mobileObserver?.unobserve(this.mobileTriggerEl);
    }
    this.mobileTriggerEl = trigger;
    if (this.mobileTriggerEl) {
      this.mobileObserver ??= new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.loadMoreMobileCourses();
        }
      });
      this.mobileObserver.observe(this.mobileTriggerEl);
    }
  }

  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  openDialog = (rowData: Course): void => {
    this.analytics.track('certificate_open', { course: rowData.name, school: rowData.school });
    this.bottomSheet.open(CertificateSheetComponent, {
      data: rowData,
      panelClass: 'certificate-sheet',
      ariaLabel: rowData.name
    });
  }

  onSort({ active, direction }: Sort): void {
    this.state.sortActive = active;
    this.state.sortDirection = direction;
  }

  onPage({ pageIndex, pageSize }: PageEvent): void {
    this.state.pageIndex = pageIndex;
    this.state.pageSize = pageSize;
  }

  ngAfterViewInit() {
    this.showSnackbar();
  }

  ngOnDestroy() {
    this.mobileObserver?.disconnect();
    this.hintRef?.dismiss();
  }

  showSnackbar() {
    if (this.state.hintShown) {
      return;
    }
    this.state.hintShown = true;
    this.hintRef = this.snackBar.openFromComponent(CourseHintComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'course-hint',
    });
  }

  /** The courses are already in memory, so the next cards show right away. */
  loadMoreMobileCourses(): void {
    if (!this.hasMoreMobileCourses()) {
      return;
    }
    this.setMobileCount(this.mobileCount() + MOBILE_BATCH_SIZE);
    // The observer reports on the next frame, after the new cards render, so it sees the trigger's new position.
    const trigger = this.mobileTriggerEl;
    if (trigger && this.mobileObserver) {
      this.mobileObserver.unobserve(trigger);
      this.mobileObserver.observe(trigger);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.state.filter = filterValue;
    this.filter.set(normalizeFilter(filterValue));
    this.dataSource.filter = this.filter();
    this.setMobileCount(MOBILE_BATCH_SIZE);
    this.dataSource.paginator?.firstPage();
  }

  private setMobileCount(count: number): void {
    this.mobileCount.set(count);
    this.state.mobileCount = count;
  }

}

/** The table's filter text: what the data source compares against. */
function normalizeFilter(value: string): string {
  return value.trim().toLowerCase();
}
