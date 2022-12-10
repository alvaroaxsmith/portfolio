import { Res } from './Response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from './Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  projectsObject = this.http.get<Res>('/api/projects').pipe(map((response) => response.projects));

  constructor(public http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.projectsObject;
  }

}