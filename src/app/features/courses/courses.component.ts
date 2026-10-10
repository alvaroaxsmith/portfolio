import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, DestroyRef, ElementRef, afterRenderEffect, computed, inject, viewChild, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { providePaginatorIntl } from '../../core/i18n/paginator-intl';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { CourseService } from './services/courses.service';
import { Course } from './course.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CertificateSheetComponent } from './certificate-sheet/certificate-sheet.component';
import { CourseHintComponent } from './course-hint/course-hint.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoursesStateService } from './services/courses-state.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CoursesSkeletonComponent } from '../../shared/skeleton/courses-skeleton/courses-skeleton.component';
import { TranslateModule } from '@ngx-translate/core';

const MOBILE_BATCH_SIZE = 5;
const MOBILE_LOAD_DELAY_MS = 600;
@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MatInput, MatIcon, MatSuffix, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, CoursesSkeletonComponent, MatPaginator, TranslateModule],
    // Translated paginator texts, provided here so the paginator stays out of the initial bundle.
    providers: [providePaginatorIntl()]
})
export class CoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly courseService = inject(CourseService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly snackBar = inject(MatSnackBar);
  private readonly analytics = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = inject(CoursesStateService);

  protected readonly displayedColumns = ['field', 'name', 'time', 'school', 'date'];
  readonly dataSource = new MatTableDataSource<Course>();
  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  /** The table filters through the data source; the mobile list reads the same courses and filter as signals. */
  private readonly courses = signal<Course[]>([]);
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
  readonly mobileSkeletonCount = computed(() => Math.min(MOBILE_BATCH_SIZE, this.visibleCourses().length - this.mobileCount()));

  readonly mobileLoadingMore = signal(false);
  private mobileLoadTimer?: ReturnType<typeof setTimeout>;
  private mobileObserver?: IntersectionObserver;
  private mobileTriggerEl?: HTMLElement;

  private readonly mobileLoadTrigger = viewChild<ElementRef<HTMLElement>>('mobileLoadTrigger');

  constructor() {
    afterRenderEffect(() => this.observeMobileTrigger(this.mobileLoadTrigger()?.nativeElement));
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

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  openDialog = (rowData: Course): void => {
    this.analytics.track('certificate_open', { course: rowData.name, school: rowData.school });
    this.bottomSheet.open(CertificateSheetComponent, {
      data: rowData,
      panelClass: 'certificate-sheet',
      ariaLabel: rowData.name
    });
  }

  ngOnInit() {
    const sort = this.sort();
    const paginator = this.paginator();
    sort.active = this.state.sortActive;
    sort.direction = this.state.sortDirection;
    paginator.pageSize = this.state.pageSize;
    paginator.pageIndex = this.state.pageIndex;

    sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ active, direction }) => {
      this.state.sortActive = active;
      this.state.sortDirection = direction;
    });
    paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ pageIndex, pageSize }) => {
      this.state.pageIndex = pageIndex;
      this.state.pageSize = pageSize;
    });

    this.loadData();
  }

  ngAfterViewInit() {
    this.showSnackbar();
  }

  ngOnDestroy() {
    clearTimeout(this.mobileLoadTimer);
    this.mobileObserver?.disconnect();
  }

  showSnackbar() {
    if (this.state.hintShown) {
      return;
    }
    this.state.hintShown = true;
    this.snackBar.openFromComponent(CourseHintComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'course-hint',
    });
  }

  loadMoreMobileCourses(): void {
    if (this.mobileLoadingMore() || !this.hasMoreMobileCourses()) {
      return;
    }
    this.mobileLoadingMore.set(true);

    this.mobileLoadTimer = setTimeout(() => {
      this.setMobileCount(this.mobileCount() + MOBILE_BATCH_SIZE);
      this.mobileLoadingMore.set(false);
      // The observer reports on the next frame, after the new cards render, so it sees the trigger's new position.
      const trigger = this.mobileTriggerEl;
      if (trigger && this.mobileObserver) {
        this.mobileObserver.unobserve(trigger);
        this.mobileObserver.observe(trigger);
      }
    }, MOBILE_LOAD_DELAY_MS);
  }

  loadData() {
    this.isLoading.set(true);
    this.loadError.set(false);
    this.courseService.getCourses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: courses => {
        this.dataSource.data = courses;
        this.courses.set(courses);
        this.dataSource.filter = this.filter();
        this.dataSource.sort = this.sort();
        this.dataSource.paginator = this.paginator();
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.state.filter = filterValue;
    this.filter.set(normalizeFilter(filterValue));
    this.dataSource.filter = this.filter();
    clearTimeout(this.mobileLoadTimer);
    this.mobileLoadingMore.set(false);
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
