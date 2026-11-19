import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { Course, CourseList } from '../course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly http = inject(HttpClient);

  /** Ships with the site (relative, like the translations), so the list loads with the page, not from a remote API. */
  private readonly url = 'assets/data/courses.json';
  private courses$?: Observable<Course[]>;

  getCourses(): Observable<Course[]> {
    if (!this.courses$) {
      this.courses$ = this.http.get<Partial<CourseList> | null>(this.url).pipe(
        map(res => (Array.isArray(res?.courses) ? res.courses.filter(isCourse) : [])),
        catchError((error) => {
          this.courses$ = undefined;
          return throwError(() => error);
        }),
        shareReplay(1)
      );
    }
    return this.courses$;
  }
}

/** The file is edited by hand, so its shape is checked at runtime instead of trusted. */
function isCourse(value: unknown): value is Course {
  const course = value as Partial<Record<keyof Course, unknown>> | null;
  return (
    typeof course === 'object' &&
    course !== null &&
    ['field', 'name', 'link', 'school', 'date'].every((key) => typeof course[key as keyof Course] === 'string') &&
    ['number', 'string'].includes(typeof course.time)
  );
}
