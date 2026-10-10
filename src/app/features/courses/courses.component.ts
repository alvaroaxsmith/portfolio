import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ElementRef, effect, inject, viewChild, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
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
    imports: [MatFormField, MatLabel, MatInput, MatIcon, MatSuffix, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, CoursesSkeletonComponent, MatPaginator, TranslateModule]
})
export class CoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  private courseService = inject(CourseService);
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);
  private analytics = inject(AnalyticsService);
  readonly state = inject(CoursesStateService);

  private readonly destroy$ = new Subject<void>();

  displayedColumns: string[] = ['field', 'name', 'time', 'school', 'date'];
  dataSource = new MatTableDataSource<Course>();
  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  get visibleCourses(): Course[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data;
  }

  readonly mobileLoadingMore = signal(false);
  private mobileLoadTimer?: ReturnType<typeof setTimeout>;
  private mobileObserver?: IntersectionObserver;
  private mobileTriggerEl?: HTMLElement;

  get mobileCourses(): Course[] {
    return this.visibleCourses.slice(0, this.state.mobileCount);
  }

  get hasMoreMobileCourses(): boolean {
    return this.state.mobileCount < this.visibleCourses.length;
  }

  get mobileSkeletonCount(): number {
    return Math.min(MOBILE_BATCH_SIZE, this.visibleCourses.length - this.state.mobileCount);
  }

  private readonly mobileLoadTrigger = viewChild<ElementRef<HTMLElement>>('mobileLoadTrigger');

  constructor() {
    effect(() => this.observeMobileTrigger(this.mobileLoadTrigger()?.nativeElement));
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

    sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(({ active, direction }) => {
      this.state.sortActive = active;
      this.state.sortDirection = direction;
    });
    paginator.page.pipe(takeUntil(this.destroy$)).subscribe(({ pageIndex, pageSize }) => {
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
    this.destroy$.next();
    this.destroy$.complete();
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
    if (this.mobileLoadingMore() || !this.hasMoreMobileCourses) {
      return;
    }
    this.mobileLoadingMore.set(true);

    this.mobileLoadTimer = setTimeout(() => {
      this.state.mobileCount += MOBILE_BATCH_SIZE;
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
    this.courseService.getCourses().pipe(takeUntil(this.destroy$)).subscribe({
      next: courses => {
        this.dataSource.data = courses;
        this.dataSource.filter = this.state.filter.trim().toLowerCase();
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
    this.dataSource.filter = filterValue.trim().toLowerCase();
    clearTimeout(this.mobileLoadTimer);
    this.mobileLoadingMore.set(false);
    this.state.mobileCount = MOBILE_BATCH_SIZE;
    this.dataSource.paginator?.firstPage();
  }

}