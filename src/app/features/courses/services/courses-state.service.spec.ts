import { TestBed } from '@angular/core/testing';
import { CoursesStateService } from './courses-state.service';

describe('CoursesStateService', () => {
  it('starts a visit on the first page of 5 courses, unsorted and unfiltered', () => {
    const state = TestBed.inject(CoursesStateService);

    expect(state.filter).toBe('');
    expect(state.sortActive).toBe('');
    expect(state.sortDirection).toBe('');
    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(5);
    expect(state.mobileCount).toBe(5);
    expect(state.hintShown).toBeFalse();
  });

  it('is shared by the whole app, so the courses page finds it as it was left', () => {
    TestBed.inject(CoursesStateService).pageIndex = 3;

    expect(TestBed.inject(CoursesStateService).pageIndex).toBe(3);
  });

  it('lives only in memory: a fresh app starts over', () => {
    TestBed.inject(CoursesStateService).hintShown = true;
    TestBed.resetTestingModule();

    expect(TestBed.inject(CoursesStateService).hintShown).toBeFalse();
  });
});
