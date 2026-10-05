import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { Course, CourseList } from '../interfaces/courses.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'https://json-server-vercel-beta-six.vercel.app/courses';
  // Cache da sessão: ao voltar para a página os cursos chegam na hora, sem
  // nova requisição nem skeleton
  private courses$?: Observable<Course[]>;

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    if (!this.courses$) {
      this.courses$ = this.http.get<CourseList>(this.apiUrl).pipe(
        map(res => res.courses),
        // Em caso de erro, descarta o cache para tentar de novo na próxima visita
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
