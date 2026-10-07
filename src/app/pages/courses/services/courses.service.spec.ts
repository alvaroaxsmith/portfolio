import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CourseService } from './courses.service';

const API = 'https://json-server-vercel-beta-six.vercel.app/courses';
const course = { field: 'TI', name: 'Java Full Stack', link: 'https://drive/x', time: 640, school: 'Soul Code', date: '2022/05' };

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CourseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns the list of courses from the API', () => {
    let names: string[] = [];
    service.getCourses().subscribe((courses) => (names = courses.map((c) => c.name)));

    http.expectOne(API).flush({ courses: [course] });

    expect(names).toEqual(['Java Full Stack']);
  });

  it('reuses the courses within the session, so coming back to the page is instant', () => {
    service.getCourses().subscribe();
    http.expectOne(API).flush({ courses: [course] });

    let again = 0;
    service.getCourses().subscribe((courses) => (again = courses.length));

    http.expectNone(API);
    expect(again).toBe(1);
  });

  it('tries again on the next visit after a failed request', () => {
    service.getCourses().subscribe({ error: () => undefined });
    http.expectOne(API).flush('down', { status: 503, statusText: 'Unavailable' });

    let count = 0;
    service.getCourses().subscribe((courses) => (count = courses.length));
    http.expectOne(API).flush({ courses: [course] });

    expect(count).toBe(1);
  });
});
