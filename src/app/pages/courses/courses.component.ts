import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CourseService } from '../courses/services/courses.service';
import { Course } from '../courses/interfaces/courses.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DialogComponent } from './dialog/dialog.component';
import { SnackBarComponent } from './snack-bar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoursesStateService } from './services/courses-state.service';
import { AnalyticsService } from '../../services/analytics.service';

const MOBILE_BATCH_SIZE = 5;
const MOBILE_LOAD_DELAY_MS = 600;
@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  displayedColumns: string[] = ['field', 'name', 'time', 'school', 'date'];
  dataSource = new MatTableDataSource<Course>();
  isLoading = true;

  get visibleCourses(): Course[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data;
  }

  mobileLoadingMore = false;
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

  @ViewChild('mobileLoadTrigger') set mobileLoadTrigger(ref: ElementRef<HTMLElement> | undefined) {
    if (this.mobileTriggerEl) {
      this.mobileObserver?.unobserve(this.mobileTriggerEl);
    }
    this.mobileTriggerEl = ref?.nativeElement;
    if (this.mobileTriggerEl) {
      this.mobileObserver ??= new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.loadMoreMobileCourses();
        }
      });
      this.mobileObserver.observe(this.mobileTriggerEl);
    }
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private courseService: CourseService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private analytics: AnalyticsService,
    readonly state: CoursesStateService
  ) { }

  openDialog = (rowData: Course): void => {
    this.analytics.track('certificate_open', { course: rowData.name, school: rowData.school });
    this.bottomSheet.open(DialogComponent, {
      data: rowData,
      panelClass: 'certificate-sheet',
      ariaLabel: rowData.name
    });
  }

  ngOnInit() {
    this.sort.active = this.state.sortActive;
    this.sort.direction = this.state.sortDirection;
    this.paginator.pageSize = this.state.pageSize;
    this.paginator.pageIndex = this.state.pageIndex;

    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(({ active, direction }) => {
      this.state.sortActive = active;
      this.state.sortDirection = direction;
    });
    this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe(({ pageIndex, pageSize }) => {
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
    this.snackBar.openFromComponent(SnackBarComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'course-hint',
    });
  }

  loadMoreMobileCourses(): void {
    if (this.mobileLoadingMore || !this.hasMoreMobileCourses) {
      return;
    }
    this.mobileLoadingMore = true;
    this.cdr.detectChanges();

    this.mobileLoadTimer = setTimeout(() => {
      this.state.mobileCount += MOBILE_BATCH_SIZE;
      this.mobileLoadingMore = false;
      this.cdr.detectChanges();
      const trigger = this.mobileTriggerEl;
      if (trigger && this.mobileObserver) {
        this.mobileObserver.unobserve(trigger);
        this.mobileObserver.observe(trigger);
      }
    }, MOBILE_LOAD_DELAY_MS);
  }

  loadData() {
    this.isLoading = true;
    this.courseService.getCourses().pipe(takeUntil(this.destroy$)).subscribe(courses => {
      this.dataSource.data = courses;
      this.dataSource.filter = this.state.filter.trim().toLowerCase();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoading = false;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.state.filter = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    clearTimeout(this.mobileLoadTimer);
    this.mobileLoadingMore = false;
    this.state.mobileCount = MOBILE_BATCH_SIZE;
    this.dataSource.paginator?.firstPage();
  }

}