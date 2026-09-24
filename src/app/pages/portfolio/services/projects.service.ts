import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { Project } from '../Project';

interface GithubRepo {
  id: number;
  name: string;
  language: string | null;
  description: string | null;
  html_url: string;
  pushed_at: string;
  topics?: string[];
}

interface CachedProjects {
  savedAt: number;
  projects: Project[];
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly apiUrl =
    'https://api.github.com/users/alvaroaxsmith/repos?per_page=100&type=owner&sort=pushed';
  // Only repositories tagged with this topic on GitHub are shown on the page
  private readonly portfolioTopic = 'portfolio-project';
  private readonly cacheKey = 'portfolio:github-projects';
  // Unauthenticated GitHub API allows 60 requests/hour per IP, so responses are reused for an hour
  private readonly cacheTtlMs = 60 * 60 * 1000;

  constructor(private readonly http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    const cached = this.readCache();
    if (cached) {
      return of(cached);
    }

    return this.http.get<GithubRepo[]>(this.apiUrl).pipe(
      map((repos) =>
        repos
          .filter((repo) => repo.topics?.includes(this.portfolioTopic))
          .map((repo) => ({
            id: repo.id,
            name: repo.name,
            tech: repo.language?.trim() ?? '',
            description: repo.description?.trim() ?? '',
            repo: repo.html_url,
            pushed_at: repo.pushed_at,
            date: repo.pushed_at,
          }))
      ),
      tap((projects) => this.writeCache(projects))
    );
  }

  private readCache(): Project[] | null {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) {
        return null;
      }
      const cached: CachedProjects = JSON.parse(raw);
      return Date.now() - cached.savedAt < this.cacheTtlMs ? cached.projects : null;
    } catch {
      return null;
    }
  }

  private writeCache(projects: Project[]): void {
    try {
      const entry: CachedProjects = { savedAt: Date.now(), projects };
      localStorage.setItem(this.cacheKey, JSON.stringify(entry));
    } catch {
      // Storage may be unavailable (private mode, quota); the page still works without cache
    }
  }
}
