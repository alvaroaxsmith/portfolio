import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectsService } from './projects.service';

const API = 'https://api.github.com/users/alvaroaxsmith/repos?per_page=100&type=owner&sort=pushed';
const CACHE_KEY = 'portfolio:github-projects';

const repos = [
  { id: 1, name: 'app-gym', language: 'Dart', description: ' Gym app ', html_url: 'https://github.com/a/app-gym', pushed_at: '2026-01-17T00:00:00Z', topics: ['portfolio-project'] },
  { id: 2, name: 'private-notes', language: 'TypeScript', description: 'Not curated', html_url: 'https://github.com/a/notes', pushed_at: '2026-02-01T00:00:00Z', topics: [] },
  { id: 3, name: 'crawler', language: null, description: null, html_url: 'https://github.com/a/crawler', pushed_at: '2026-05-28T00:00:00Z', topics: ['portfolio-project', 'scraping'] },
  { id: 4, name: 'no-topics', language: 'Java', description: 'x', html_url: 'https://github.com/a/x', pushed_at: '2025-01-01T00:00:00Z' }
];

describe('ProjectsService', () => {
  let service: ProjectsService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(CACHE_KEY);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(CACHE_KEY);
  });

  it('lists only repositories tagged with the portfolio-project topic', () => {
    let names: string[] = [];
    service.getProjects().subscribe((projects) => (names = projects.map((p) => p.name)));

    http.expectOne(API).flush(repos);

    expect(names).toEqual(['app-gym', 'crawler']);
  });

  it('maps GitHub fields to what the cards show, trimming and defaulting empty values', () => {
    let result: unknown[] = [];
    service.getProjects().subscribe((projects) => (result = projects));

    http.expectOne(API).flush(repos);

    expect(result).toEqual([
      { id: 1, name: 'app-gym', tech: 'Dart', description: 'Gym app', repo: 'https://github.com/a/app-gym', date: '2026-01-17T00:00:00Z' },
      { id: 3, name: 'crawler', tech: '', description: '', repo: 'https://github.com/a/crawler', date: '2026-05-28T00:00:00Z' }
    ]);
  });

  it('drops repositories GitHub sends with missing or wrong fields', () => {
    let names: string[] = [];
    service.getProjects().subscribe((projects) => (names = projects.map((p) => p.name)));

    http.expectOne(API).flush([
      repos[0],
      null,
      { ...repos[2], id: 'three' },
      { ...repos[2], html_url: undefined },
      { ...repos[2], topics: 'portfolio-project' },
      { ...repos[2], name: 'valid-crawler' }
    ]);

    expect(names).toEqual(['app-gym', 'valid-crawler']);
  });

  it('treats an answer that is not a list as no projects', () => {
    let count = -1;
    service.getProjects().subscribe((projects) => (count = projects.length));

    http.expectOne(API).flush({ message: 'Not Found' });

    expect(count).toBe(0);
  });

  it('caches the response for one hour to respect the GitHub rate limit', () => {
    service.getProjects().subscribe();
    http.expectOne(API).flush(repos);

    let fromCache: string[] = [];
    service.getProjects().subscribe((projects) => (fromCache = projects.map((p) => p.name)));

    http.expectNone(API);
    expect(fromCache).toEqual(['app-gym', 'crawler']);
  });

  it('asks GitHub again once the cache is older than one hour', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now() - 61 * 60 * 1000, projects: [] }));

    service.getProjects().subscribe();

    http.expectOne(API).flush(repos);
  });

  it('still loads projects when localStorage is blocked', () => {
    spyOn(localStorage, 'getItem').and.throwError('blocked');
    spyOn(localStorage, 'setItem').and.throwError('blocked');
    let count = 0;

    service.getProjects().subscribe((projects) => (count = projects.length));
    http.expectOne(API).flush(repos);

    expect(count).toBe(2);
  });
});
