import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  // Fetch up to 100 repos, ordered by last update, owned by the user
  private apiUrl =
    'https://api.github.com/users/alvaroaxsmith/repos?per_page=100&sort=updated&direction=desc&type=owner';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((repos) =>
        repos.map((repo) => {
          return {
            id: repo.id,
            name: repo.name,
            // Keep placeholders that the pipe uses to hide items without language
            tech: repo.language || 'N/A',
            // Keep placeholder that the pipe uses to hide items without description
            description: repo.description || 'No description',
            repo: repo.html_url,
            pushed_at: repo.pushed_at,
            date: repo.pushed_at,
          } as Project;
        })
      )
    );
  }
}
