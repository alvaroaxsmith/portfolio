import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { Project } from '../project.model';
import { environment } from '../../../../environments/environment';

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
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.githubApiUrl}/users/${environment.githubUser}/repos?per_page=100&type=owner&sort=pushed`;
  private readonly portfolioTopic = 'portfolio-project';
  private readonly cacheKey = 'portfolio:github-projects';
  private readonly cacheTtlMs = 60 * 60 * 1000;

  getProjects(): Observable<Project[]> {
    const cached = this.readCache();
    if (cached) {
      return of(cached);
    }

    return this.http.get<unknown>(this.apiUrl).pipe(
      map((repos) =>
        (Array.isArray(repos) ? repos.filter(isGithubRepo) : [])
          .filter((repo) => repo.topics?.includes(this.portfolioTopic))
          .map((repo) => ({
            id: repo.id,
            name: repo.name,
            tech: repo.language?.trim() ?? '',
            description: repo.description?.trim() ?? '',
            repo: repo.html_url,
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
    }
  }
}

/** GitHub's answer is external, so its shape is checked at runtime instead of trusted. */
function isGithubRepo(value: unknown): value is GithubRepo {
  const repo = value as Partial<Record<keyof GithubRepo, unknown>> | null;
  const optionalText = (field: unknown) => field === undefined || field === null || typeof field === 'string';
  return (
    typeof repo === 'object' &&
    repo !== null &&
    typeof repo.id === 'number' &&
    typeof repo.name === 'string' &&
    typeof repo.html_url === 'string' &&
    typeof repo.pushed_at === 'string' &&
    optionalText(repo.language) &&
    optionalText(repo.description) &&
    (repo.topics === undefined || (Array.isArray(repo.topics) && repo.topics.every((topic) => typeof topic === 'string')))
  );
}
