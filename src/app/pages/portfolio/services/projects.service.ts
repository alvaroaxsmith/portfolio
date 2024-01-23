import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../Project';
import { Res } from '../Response';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private apiUrl = 'https://json-server-vercel-beta-six.vercel.app/projects';

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Res>(this.apiUrl).pipe(
      map(res => res.projects)
    );

  }
}