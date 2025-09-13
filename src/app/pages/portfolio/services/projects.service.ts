import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  // Fetch up to 100 repos. We still request sorted by "updated" descending, but
  // we'll enforce a local sort afterwards to guarantee consistency if the API
  // response order changes or pagination introduces anomalies.
  private apiUrl =
    'https://api.github.com/users/alvaroaxsmith/repos?per_page=100&sort=updated&direction=desc&type=owner';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((repos) => {
        const mapped = repos.map((repo) => {
          return {
            id: repo.id,
            name: repo.name,
            // Placeholder de tecnologia permanece 'N/A' para que o pipe existente possa
            // decidir ocultar, mas garantimos string sem espaços.
            tech:
              repo.language && repo.language.trim()
                ? repo.language.trim()
                : 'N/A',
            description: repo.description || 'No description',
            repo: repo.html_url,
            pushed_at: repo.pushed_at,
            date: repo.pushed_at, // Campo usado para ordenação no componente
          } as Project;
        });

        // Ordenação defensiva local (mais recentes primeiro) usando pushed_at / date
        return mapped.sort((a, b) => {
          const timeA = new Date(a.pushed_at).getTime();
          const timeB = new Date(b.pushed_at).getTime();
          if (isNaN(timeA) && isNaN(timeB)) return 0;
          if (isNaN(timeA)) return 1; // itens sem data vão para o fim
          if (isNaN(timeB)) return -1;
          return timeB - timeA; // descendente
        });
      })
    );
  }
}
