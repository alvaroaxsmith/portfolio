import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsService } from './services/projects.service';
import { Project } from './Project';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { ProjectCardSkeletonComponent } from '../../components/skeleton/project-card-skeleton/project-card-skeleton.component';

const GRID_MIN_CARD_WIDTH = 300;
const GRID_ROWS_PER_PAGE = 2;
const LIST_ITEMS_PER_PAGE = 4;
const LOAD_MORE_DELAY_MS = 600;

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss'],
    animations: [
        trigger('fadeInLeft', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-20px)' }),
                animate('300ms {{ delay }}ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
            ], { params: { delay: 0 } }),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatIconButton, MatTooltip, MatIcon, NgClass, MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatButton, MatCardContent, ProjectCardSkeletonComponent, DatePipe, TranslateModule]
})
export class PortfolioComponent implements OnInit, OnDestroy {
  allProjects: Project[] = [];
  projects: Project[] = [];
  processedProjects: Project[] = [];

  initialLoading = true;
  loadError = false;
  loadingMore = false;
  allProjectsLoaded = false;
  pageSize = 6;
  columns = 1;
  private batchStart = 0;
  private loadMoreTimer?: ReturnType<typeof setTimeout>;

  viewportWidth: number = window.innerWidth;
  currentView: 'list' | 'grid' = 'list';

  availableTechs: string[] = [];
  selectedTech: string | null = null;
  currentSortOrder: 'recent' | 'oldest' = 'recent';

  projectListAnimationState: 'initial' | 'viewToggle' | 'stable' = 'initial';

  @ViewChild('page', { static: true }) pageRef!: ElementRef<HTMLElement>;
  @ViewChild('loadMoreTrigger', { static: false }) loadMoreTrigger?: ElementRef<HTMLElement>;
  private observer: IntersectionObserver | undefined;

  @HostListener('window:resize')
  onResize() {
    this.viewportWidth = window.innerWidth;
    this.updatePageSize();
  }

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private analytics: AnalyticsService,
    private destroyRef: DestroyRef
  ) { }

  trackRepo(project: Project): void {
    this.analytics.track('repo_click', { repo: project.name, tech: project.tech || 'none', view: this.currentView });
  }

  get loadingMoreCount(): number {
    return Math.min(this.nextBatchSize(), this.processedProjects.length - this.projects.length);
  }

  private nextBatchSize(): number {
    if (this.projects.length === 0) {
      return this.pageSize;
    }
    const missingInRow = (this.columns - (this.projects.length % this.columns)) % this.columns;
    return this.pageSize + missingInRow;
  }

  get initialSkeletons(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  get loadingMoreSkeletons(): number[] {
    return Array.from({ length: this.loadingMoreCount }, (_, i) => i);
  }

  ngOnInit(): void {
    this.updatePageSize();
    this.initialLoading = true;
    this.projectListAnimationState = 'initial';
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fetchedProjects) => {
        this.allProjects = fetchedProjects;
        this.availableTechs = [...new Set(this.allProjects.map(p => p.tech).filter(t => t))].sort();

        if (this.selectedTech && !this.availableTechs.includes(this.selectedTech)) {
          this.selectedTech = null;
        }

        this.initialLoading = false;
        this.applyFiltersAndSorting();
      },
      error: () => {
        this.loadError = true;
        this.allProjects = [];
        this.availableTechs = [];
        this.initialLoading = false;
        this.projects = [];
        this.processedProjects = [];
        this.allProjectsLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.loadMoreTimer);
    this.observer?.disconnect();
  }

  updatePageSize(): void {
    if (this.currentView === 'grid') {
      const width = this.pageRef?.nativeElement.clientWidth || window.innerWidth;
      const gap = Math.min(16, Math.max(12, window.innerWidth * 0.015));
      this.columns = Math.max(1, Math.floor((width + gap) / (GRID_MIN_CARD_WIDTH + gap)));
      this.pageSize = this.columns * GRID_ROWS_PER_PAGE;
    } else {
      this.columns = 1;
      this.pageSize = LIST_ITEMS_PER_PAGE;
    }
  }

  private setupIntersectionObserver(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    if (!this.loadMoreTrigger?.nativeElement || this.allProjectsLoaded) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.loadMore();
      }
    });

    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  applyFiltersAndSorting(): void {
    this.projectListAnimationState = 'initial';
    let result = [...this.allProjects];

    if (this.selectedTech) {
      result = result.filter(p => p.tech === this.selectedTech);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();

      const validA = !isNaN(timeA);
      const validB = !isNaN(timeB);

      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      if (!validA && !validB) return 0;

      return this.currentSortOrder === 'recent' ? timeB - timeA : timeA - timeB;
    });

    clearTimeout(this.loadMoreTimer);
    this.loadingMore = false;
    this.processedProjects = result;
    this.projects = [];
    this.batchStart = 0;
    this.allProjectsLoaded = result.length === 0;

    this.appendNextPage();
  }

  loadMore(): void {
    if (this.loadingMore || this.allProjectsLoaded) {
      return;
    }
    this.loadingMore = true;
    this.cdr.detectChanges();

    this.loadMoreTimer = setTimeout(() => {
      this.loadingMore = false;
      this.appendNextPage();
    }, LOAD_MORE_DELAY_MS);
  }

  private appendNextPage(): void {
    const next = this.processedProjects.slice(this.projects.length, this.projects.length + this.nextBatchSize());

    this.batchStart = this.projects.length;
    this.projects = [...this.projects, ...next];
    this.allProjectsLoaded = this.projects.length >= this.processedProjects.length;
    if (this.allProjectsLoaded && this.projectListAnimationState === 'initial') {
      this.projectListAnimationState = 'stable';
    }
    this.cdr.detectChanges();

    this.setupIntersectionObserver();
  }

  descriptionFor(project: Project): string {
    const key = `repo.${project.name}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : project.description;
  }

  filterByTech(tech: string | null): void {
    this.selectedTech = tech;
    this.analytics.track('projects_filter', { tech: tech ?? 'all' });
    this.applyFiltersAndSorting();
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder = order;
    this.analytics.track('projects_sort', { sort: order });
    this.applyFiltersAndSorting();
  }

  getAnimationParams(index: number) {
    let delay = 0;
    if (this.projectListAnimationState === 'viewToggle') {
      delay = Math.min(index, 8) * 60;
    } else if (index >= this.batchStart) {
      delay = Math.min(index - this.batchStart, 8) * 70;
    }
    return { value: 'in', params: { delay: delay.toString() } };
  }

  toggleView(): void {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
    this.analytics.track('projects_view_toggle', { view: this.currentView });
    this.projectListAnimationState = 'viewToggle';
    this.updatePageSize();
    this.cdr.detectChanges();
  }
}
