import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from './Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(public http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('https://api-fk-portfolio-server.herokuapp.com/projects');
  }

}