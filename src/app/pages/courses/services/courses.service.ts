import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Course, CourseList } from '../interfaces/courses.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'https://json-server-vercel-beta-six.vercel.app/courses';

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    return this.http.get<CourseList>(this.apiUrl).pipe(map(res => res.courses));
  }
}
