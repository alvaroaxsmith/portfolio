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

  getProjects(page: number, pageSize: number): Observable<Project[]> {
    const url = `${this.apiUrl}?_page=${page}&_limit=${pageSize}`;
    return this.http.get<Res>(url).pipe(map((res) => res.projects));
  }
}
