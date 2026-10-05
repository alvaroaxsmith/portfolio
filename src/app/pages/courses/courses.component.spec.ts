import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CoursesComponent } from './courses.component';
import { CourseService } from './services/courses.service';
import { CoursesStateService } from './services/courses-state.service';
import { Course } from './interfaces/courses.interface';
import { MaterialModule } from '../../material/material.module';
import { SkeletonModule } from '../../components/skeleton/skeleton.module';

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
      declarations: [CoursesComponent],
      imports: [MaterialModule, SkeletonModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        // of() emite de forma síncrona, como o cache do CourseService ao voltar à página
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

  it('restores the saved page and page size', async () => {
    state.pageIndex = 2;
    state.pageSize = 5;

    await render();

    expect(component.paginator.pageIndex).toBe(2);
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
    expect(component.paginator.pageIndex).toBe(1);
    expect(component.sort.active).toBe('name');
    expect(component.sort.direction).toBe('desc');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('java');
  });

  it('clamps a saved page that no longer exists to the last one', async () => {
    state.pageIndex = 50;
    state.pageSize = 10;

    await render();

    expect(component.paginator.pageIndex).toBe(2);
  });

  it('saves page changes into the state service', async () => {
    await render();

    component.paginator.nextPage();

    expect(state.pageIndex).toBe(1);
  });
});
