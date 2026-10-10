import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { fakeIntersectionObserver } from '../../testing/fake-intersection-observer';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { CoursesComponent } from './courses.component';
import { CourseService } from './services/courses.service';
import { CoursesStateService } from './services/courses-state.service';
import { Course } from './course.model';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CertificateSheetComponent } from './certificate-sheet/certificate-sheet.component';
import { CourseHintComponent } from './course-hint/course-hint.component';

const courses = Array.from({ length: 23 }, (_, i) => ({
  field: i % 2 ? 'Java' : 'Frontend',
  name: `Course ${String(i).padStart(2, '0')}`,
  school: 'School',
  time: `${i}h`,
  date: '2024',
})) as unknown as Course[];

describe('CoursesComponent', () => {
  let fixture: ComponentFixture<CoursesComponent>;
  let component: CoursesComponent;
  let state: CoursesStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), CoursesComponent],
    providers: [
        { provide: CourseService, useValue: { getCourses: () => of(courses) } },
        { provide: MatBottomSheet, useValue: { open: () => null } },
        { provide: MatSnackBar, useValue: { openFromComponent: () => null } },
    ],
}).compileComponents();

    state = TestBed.inject(CoursesStateService);
  });

  async function render() {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should create', async () => {
    await render();
    expect(component).toBeTruthy();
  });

  describe('when the courses cannot be loaded', () => {
    beforeEach(() => {
      spyOn(TestBed.inject(CourseService), 'getCourses').and.returnValue(throwError(() => new Error('API down')));
    });

    it('stops loading instead of showing the placeholders forever', async () => {
      await render();

      expect(component.isLoading()).toBeFalse();
      expect(fixture.nativeElement.querySelector('app-courses-skeleton')).toBeNull();
    });

    it('tells the visitor, in the table and in the mobile list', async () => {
      await render();

      const alerts = Array.from(fixture.nativeElement.querySelectorAll('[role="alert"]') as NodeListOf<HTMLElement>);
      expect(alerts.length).toBe(2);
      for (const alert of alerts) {
        expect(alert.textContent).toContain('courses.error');
      }
      expect(fixture.nativeElement.textContent).not.toContain('courses.noData');
      expect(fixture.nativeElement.textContent).not.toContain('courses.emptyState');
    });
  });

  it('restores the saved page and page size', async () => {
    state.pageIndex = 2;
    state.pageSize = 5;

    await render();

    expect(component.paginator().pageIndex).toBe(2);
    expect(component.dataSource.filteredData.length).toBe(23);
    const firstName = fixture.nativeElement.querySelector('td.mat-column-name').textContent.trim();
    expect(firstName).toBe('Course 10');
  });

  it('restores the filter and sort together with the page', async () => {
    state.filter = 'java';
    state.sortActive = 'name';
    state.sortDirection = 'desc';
    state.pageIndex = 1;
    state.pageSize = 5;

    await render();

    expect(component.dataSource.filteredData.length).toBe(11);
    expect(component.paginator().pageIndex).toBe(1);
    expect(component.sort().active).toBe('name');
    expect(component.sort().direction).toBe('desc');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('java');
  });

  it('clamps a saved page that no longer exists to the last one', async () => {
    state.pageIndex = 50;
    state.pageSize = 10;

    await render();

    expect(component.paginator().pageIndex).toBe(2);
  });

  it('tells the user when the search matches no course', async () => {
    await render();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = 'quantum';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const noData = fixture.nativeElement.querySelector('.desktop-table tr.mat-row:not(.course-row)') as HTMLElement;
    expect(noData.textContent?.replace(/\s+/g, ' ').trim()).toBe('courses.noData "quantum"');
  });

  it('saves page changes into the state service', async () => {
    await render();

    component.paginator().nextPage();

    expect(state.pageIndex).toBe(1);
  });
});

describe('CoursesComponent behavior', () => {
  let fixture: ComponentFixture<CoursesComponent>;
  let component: CoursesComponent;
  let state: CoursesStateService;
  let bottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let analytics: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    bottomSheet = jasmine.createSpyObj<MatBottomSheet>('MatBottomSheet', ['open']);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    await startApp();
  });

  /** Configures a brand-new app: what a full page reload gives the visitor. */
  async function startApp() {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), CoursesComponent],
    providers: [
        { provide: CourseService, useValue: { getCourses: () => of(courses) } },
        { provide: MatBottomSheet, useValue: bottomSheet },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: AnalyticsService, useValue: analytics }
    ]
}).compileComponents();
    state = TestBed.inject(CoursesStateService);
  }

  function render() {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('certificates', () => {
    it('opens the certificate of a course in a bottom sheet', () => {
      render();

      component.openDialog(courses[3]);

      expect(bottomSheet.open as jasmine.Spy).toHaveBeenCalledOnceWith(CertificateSheetComponent, {
        data: courses[3],
        panelClass: 'certificate-sheet',
        ariaLabel: courses[3].name
      });
    });

    it('tracks which certificate was opened', () => {
      render();

      component.openDialog(courses[3]);

      expect(analytics.track).toHaveBeenCalledWith('certificate_open', { course: 'Course 03', school: 'School' });
    });
  });

  describe('hint notification', () => {
    it('shows the hint in the top right corner on the first visit', () => {
      render();

      expect(snackBar.openFromComponent as jasmine.Spy).toHaveBeenCalledOnceWith(CourseHintComponent, {
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: 'course-hint'
      });
    });

    it('does not show the hint again when coming back to the page in the same visit', () => {
      render();
      fixture.destroy();

      render();

      expect(snackBar.openFromComponent).toHaveBeenCalledTimes(1);
    });

    it('shows the hint again after a full reload, since nothing is saved in the browser', async () => {
      render();
      fixture.destroy();

      TestBed.resetTestingModule();
      await startApp();
      render();

      expect(snackBar.openFromComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('mobile infinite loading', () => {
    it('loads the next 5 cards when the end of the list comes into view', fakeAsync(() => {
      const viewport = fakeIntersectionObserver();
      render();
      fixture.detectChanges();

      viewport.report(true);
      tick(600);

      expect(component.mobileCourses.length).toBe(10);
    }));

    it('starts with a first batch of 5 cards', () => {
      render();

      expect(component.mobileCourses.length).toBe(5);
      expect(component.hasMoreMobileCourses).toBeTrue();
    });

    it('shows skeleton cards for the next batch, then the cards', fakeAsync(() => {
      render();

      component.loadMoreMobileCourses();
      fixture.detectChanges();
      expect(component.mobileLoadingMore()).toBeTrue();
      expect(fixture.nativeElement.querySelectorAll('.mobile-course-list app-courses-skeleton .course-card').length).toBe(5);

      tick(600);
      fixture.detectChanges();
      expect(component.mobileLoadingMore()).toBeFalse();
      expect(component.mobileCourses.length).toBe(10);
    }));

    it('loads every course and then says the list is over', fakeAsync(() => {
      render();

      while (component.hasMoreMobileCourses) {
        component.loadMoreMobileCourses();
        tick(600);
      }
      fixture.detectChanges();

      expect(component.mobileCourses.length).toBe(23);
      expect(component.mobileSkeletonCount).toBeLessThanOrEqual(0);
      expect(fixture.nativeElement.querySelector('.mobile-course-list .end-of-list')).not.toBeNull();
    }));

    it('only shows skeletons for the courses that are left', fakeAsync(() => {
      state.mobileCount = 20;
      render();

      component.loadMoreMobileCourses();
      fixture.detectChanges();

      expect(component.mobileSkeletonCount).toBe(3);
      tick(600);
    }));

    it('keeps the loaded cards when coming back to the page', () => {
      state.mobileCount = 15;

      render();

      expect(component.mobileCourses.length).toBe(15);
    });

    it('starts over from the first batch when the search changes', fakeAsync(() => {
      render();
      component.loadMoreMobileCourses();
      tick(600);

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.value = 'java';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(state.mobileCount).toBe(5);
      expect(component.mobileCourses.every((c) => c.field === 'Java')).toBeTrue();
    }));
  });
});
