import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { Course, CourseList } from '../interfaces/courses.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'https://json-server-vercel-beta-six.vercel.app/courses';
  private courses$?: Observable<Course[]>;

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    if (!this.courses$) {
      this.courses$ = this.http.get<CourseList>(this.apiUrl).pipe(
        map(res => res.courses),
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
