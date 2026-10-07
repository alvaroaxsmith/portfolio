import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { Project } from './Project';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioModule } from './portfolio.module';
import { ProjectsService } from './services/projects.service';

function makeProjects(count: number): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `project-${i + 1}`,
    tech: ['TypeScript', 'Java', 'Python'][i % 3],
    description: `Description ${i + 1}`,
    repo: `https://github.com/a/project-${i + 1}`,
    date: new Date(2026, 0, i + 1).toISOString()
  }));
}

describe('PortfolioComponent', () => {
  let fixture: ComponentFixture<PortfolioComponent>;
  let component: PortfolioComponent;
  let analytics: jasmine.SpyObj<AnalyticsService>;

  function render(projects$: Observable<Project[]>) {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    TestBed.configureTestingModule({
      imports: [PortfolioModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: { getProjects: () => projects$ } },
        { provide: AnalyticsService, useValue: analytics }
      ]
    });
    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const cards = () => fixture.nativeElement.querySelectorAll('.project-card').length;
  const skeletons = () => fixture.nativeElement.querySelectorAll('.portfolio-cards-area app-project-card-skeleton').length;
  const cardNames = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.project-card mat-card-title') as NodeListOf<HTMLElement>).map((el) => el.textContent!.trim());

  describe('list view (default)', () => {
    it('shows the first batch of 4 projects', () => {
      render(of(makeProjects(10)));

      expect(component.currentView).toBe('list');
      expect(cards()).toBe(4);
    });

    it('orders projects from the most recently updated', () => {
      render(of(makeProjects(3)));

      expect(cardNames()).toEqual(['project-3', 'project-2', 'project-1']);
    });

    it('shows skeletons for exactly the next batch while it loads, then the projects', fakeAsync(() => {
      render(of(makeProjects(10)));

      component.loadMore();
      fixture.detectChanges();
      expect(component.loadingMore).toBeTrue();
      expect(skeletons()).toBe(4);
      expect(cards()).toBe(4);

      tick(600);
      fixture.detectChanges();
      expect(skeletons()).toBe(0);
      expect(cards()).toBe(8);
    }));

    it('only shows as many skeletons as projects that are left', fakeAsync(() => {
      render(of(makeProjects(10)));
      component.loadMore();
      tick(600);

      component.loadMore();
      fixture.detectChanges();

      expect(skeletons()).toBe(2);
      tick(600);
    }));

    it('announces the end of the list once every project is shown', fakeAsync(() => {
      render(of(makeProjects(6)));
      expect(fixture.nativeElement.querySelector('.end-of-list')).toBeNull();

      component.loadMore();
      tick(600);
      fixture.detectChanges();

      expect(component.allProjectsLoaded).toBeTrue();
      expect(fixture.nativeElement.querySelector('.end-of-list')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.load-more-trigger')).toBeNull();
    }));

    it('does not start a second load while one is in progress', fakeAsync(() => {
      render(of(makeProjects(20)));

      component.loadMore();
      component.loadMore();
      tick(600);
      fixture.detectChanges();

      expect(cards()).toBe(8);
    }));
  });

  describe('grid view', () => {
    function useGridWith(width: number) {
      spyOnProperty(component.pageRef.nativeElement, 'clientWidth').and.returnValue(width);
      component.toggleView();
      fixture.detectChanges();
    }

    it('loads two full rows based on how many columns fit the screen', () => {
      render(of(makeProjects(20)));

      useGridWith(950);

      expect(component.columns).toBe(3);
      expect(component.pageSize).toBe(6);
    });

    it('uses a single column on narrow screens', () => {
      render(of(makeProjects(20)));

      useGridWith(320);

      expect(component.columns).toBe(1);
      expect(component.pageSize).toBe(2);
    });

    it('completes the last row when switching from list to grid', () => {
      render(of(makeProjects(20)));

      useGridWith(950);

      expect(component.projects.length).toBe(4);
      expect(component.loadingMoreCount).toBe(8);
    });
  });

  describe('filters and sorting', () => {
    it('filters by technology and starts over from the first batch', () => {
      render(of(makeProjects(12)));

      component.filterByTech('Java');
      fixture.detectChanges();

      expect(component.processedProjects.every((p) => p.tech === 'Java')).toBeTrue();
      expect(component.processedProjects.length).toBe(4);
      expect(cards()).toBe(4);
    });

    it('lists the available technologies without duplicates, sorted', () => {
      render(of(makeProjects(12)));

      expect(component.availableTechs).toEqual(['Java', 'Python', 'TypeScript']);
    });

    it('can show the oldest projects first', () => {
      render(of(makeProjects(3)));

      component.sortByDate('oldest');
      fixture.detectChanges();

      expect(cardNames()).toEqual(['project-1', 'project-2', 'project-3']);
    });

    it('keeps projects with an invalid date at the end', () => {
      const projects = makeProjects(3);
      projects[2].date = 'not-a-date';
      render(of(projects));

      expect(cardNames()[2]).toBe('project-3');
    });
  });

  describe('errors and empty states', () => {
    it('shows a message with a link to GitHub when the API fails', () => {
      render(throwError(() => new Error('rate limited')));

      const message: HTMLElement = fixture.nativeElement.querySelector('.no-projects-message');
      expect(component.loadError).toBeTrue();
      expect(message.querySelector('a')?.getAttribute('href')).toBe('https://github.com/alvaroaxsmith');
    });

    it('tells the visitor when there are no projects', () => {
      render(of([]));

      expect(fixture.nativeElement.querySelector('.no-projects-message')).not.toBeNull();
      expect(cards()).toBe(0);
    });
  });

  describe('analytics', () => {
    it('tracks repository clicks with the project, technology and view', () => {
      render(of(makeProjects(3)));

      component.trackRepo(component.projects[0]);

      expect(analytics.track).toHaveBeenCalledWith('repo_click', { repo: 'project-3', tech: 'Python', view: 'list' });
    });

    it('tracks filter, sort and view changes', () => {
      render(of(makeProjects(3)));

      component.filterByTech(null);
      component.sortByDate('oldest');
      component.toggleView();

      expect(analytics.track).toHaveBeenCalledWith('projects_filter', { tech: 'all' });
      expect(analytics.track).toHaveBeenCalledWith('projects_sort', { sort: 'oldest' });
      expect(analytics.track).toHaveBeenCalledWith('projects_view_toggle', { view: 'grid' });
    });
  });

  describe('when the page is left before the projects arrive', () => {
    it('ignores the projects that arrive later', () => {
      const response = new Subject<Project[]>();
      render(response);

      fixture.destroy();
      response.next(makeProjects(3));

      expect(component.allProjects).toEqual([]);
    });

    it('ignores a failure that arrives later', () => {
      const response = new Subject<Project[]>();
      render(response);

      fixture.destroy();
      response.error(new Error('offline'));

      expect(component.loadError).toBeFalse();
    });
  });
});
