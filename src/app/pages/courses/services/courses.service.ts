import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { Course, CourseList } from '../interfaces/courses.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly apiUrl = environment.coursesApiUrl;
  private courses$?: Observable<Course[]>;

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    if (!this.courses$) {
      this.courses$ = this.http.get<Partial<CourseList> | null>(this.apiUrl).pipe(
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

/** The API is external, so its shape is checked at runtime instead of trusted. */
function isCourse(value: unknown): value is Course {
  const course = value as Partial<Record<keyof Course, unknown>> | null;
  return (
    typeof course === 'object' &&
    course !== null &&
    ['field', 'name', 'link', 'school', 'date'].every((key) => typeof course[key as keyof Course] === 'string') &&
    ['number', 'string'].includes(typeof course.time)
  );
}
