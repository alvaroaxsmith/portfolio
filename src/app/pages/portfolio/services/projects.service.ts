import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private apiUrl = 'https://api.github.com/users/alvaroaxsmith/repos';

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(repos => repos.map(repo => {
        return {
          id: repo.id,
          name: repo.name,
          tech: repo.language || 'N/A',
          description: repo.description || 'No description',
          repo: repo.html_url,
          pushed_at: repo.pushed_at
        } as Project;
      }))
    );
  }
}