import { Component, OnInit, ElementRef, OnDestroy, ChangeDetectionStrategy, DestroyRef, effect, inject, untracked, viewChild, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsService } from './services/projects.service';
import { Project } from './project.model';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { ProjectCardSkeletonComponent } from '../../shared/skeleton/project-card-skeleton/project-card-skeleton.component';

const GRID_MIN_CARD_WIDTH = 300;
const GRID_ROWS_PER_PAGE = 2;
const LIST_ITEMS_PER_PAGE = 4;
const LOAD_MORE_DELAY_MS = 600;

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '(window:resize)': 'updatePageSize()' },
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatIconButton, MatTooltip, MatIcon, NgClass, MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatButton, MatCardContent, ProjectCardSkeletonComponent, DatePipe, TranslateModule]
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private projectsService = inject(ProjectsService);
  private translate = inject(TranslateService);
  private analytics = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);

  readonly allProjects = signal<Project[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly processedProjects = signal<Project[]>([]);

  readonly initialLoading = signal(true);
  readonly loadError = signal(false);
  readonly loadingMore = signal(false);
  readonly allProjectsLoaded = signal(false);
  readonly pageSize = signal(6);
  readonly columns = signal(1);
  private batchStart = 0;
  private loadMoreTimer?: ReturnType<typeof setTimeout>;

  readonly currentView = signal<'list' | 'grid'>('list');

  readonly availableTechs = signal<string[]>([]);
  readonly selectedTech = signal<string | null>(null);
  readonly currentSortOrder = signal<'recent' | 'oldest'>('recent');

  readonly projectListAnimationState = signal<'initial' | 'viewToggle' | 'stable'>('initial');

  readonly pageRef = viewChild.required<ElementRef<HTMLElement>>('page');
  readonly loadMoreTrigger = viewChild<ElementRef<HTMLElement>>('loadMoreTrigger');
  private observer: IntersectionObserver | undefined;

  constructor() {
    // Watches the end of the list again after every batch. The observer reports on the next frame,
    // after the new cards have rendered, so it sees where the end of the list is now.
    effect(() => {
      const trigger = this.loadMoreTrigger()?.nativeElement;
      this.projects();
      untracked(() => this.observeLoadMoreTrigger(trigger));
    });
  }

  trackRepo(project: Project): void {
    this.analytics.track('repo_click', { repo: project.name, tech: project.tech || 'none', view: this.currentView() });
  }

  get loadingMoreCount(): number {
    return Math.min(this.nextBatchSize(), this.processedProjects().length - this.projects().length);
  }

  private nextBatchSize(): number {
    if (this.projects().length === 0) {
      return this.pageSize();
    }
    const missingInRow = (this.columns() - (this.projects().length % this.columns())) % this.columns();
    return this.pageSize() + missingInRow;
  }

  get initialSkeletons(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  get loadingMoreSkeletons(): number[] {
    return Array.from({ length: this.loadingMoreCount }, (_, i) => i);
  }

  ngOnInit(): void {
    this.updatePageSize();
    this.initialLoading.set(true);
    this.projectListAnimationState.set('initial');
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fetchedProjects) => {
        this.allProjects.set(fetchedProjects);
        this.availableTechs.set([...new Set(this.allProjects().map(p => p.tech).filter(t => t))].sort());

        const selected = this.selectedTech();
        if (selected && !this.availableTechs().includes(selected)) {
          this.selectedTech.set(null);
        }

        this.initialLoading.set(false);
        this.applyFiltersAndSorting();
      },
      error: () => {
        this.loadError.set(true);
        this.allProjects.set([]);
        this.availableTechs.set([]);
        this.initialLoading.set(false);
        this.projects.set([]);
        this.processedProjects.set([]);
        this.allProjectsLoaded.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.loadMoreTimer);
    this.observer?.disconnect();
  }

  updatePageSize(): void {
    if (this.currentView() === 'grid') {
      const width = this.pageRef()?.nativeElement.clientWidth || window.innerWidth;
      const gap = Math.min(16, Math.max(12, window.innerWidth * 0.015));
      this.columns.set(Math.max(1, Math.floor((width + gap) / (GRID_MIN_CARD_WIDTH + gap))));
      this.pageSize.set(this.columns() * GRID_ROWS_PER_PAGE);
    } else {
      this.columns.set(1);
      this.pageSize.set(LIST_ITEMS_PER_PAGE);
    }
  }

  private observeLoadMoreTrigger(trigger: HTMLElement | undefined): void {
    this.observer?.disconnect();
    this.observer = undefined;
    if (!trigger || this.allProjectsLoaded()) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.loadMore();
      }
    });

    this.observer.observe(trigger);
  }

  applyFiltersAndSorting(): void {
    this.projectListAnimationState.set('initial');
    let result = [...this.allProjects()];

    if (this.selectedTech()) {
      result = result.filter(p => p.tech === this.selectedTech());
    }

    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();

      const validA = !isNaN(timeA);
      const validB = !isNaN(timeB);

      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      if (!validA && !validB) return 0;

      return this.currentSortOrder() === 'recent' ? timeB - timeA : timeA - timeB;
    });

    clearTimeout(this.loadMoreTimer);
    this.loadingMore.set(false);
    this.processedProjects.set(result);
    this.projects.set([]);
    this.batchStart = 0;
    this.allProjectsLoaded.set(result.length === 0);

    this.appendNextPage();
  }

  loadMore(): void {
    if (this.loadingMore() || this.allProjectsLoaded()) {
      return;
    }
    this.loadingMore.set(true);

    this.loadMoreTimer = setTimeout(() => {
      this.loadingMore.set(false);
      this.appendNextPage();
    }, LOAD_MORE_DELAY_MS);
  }

  private appendNextPage(): void {
    const next = this.processedProjects().slice(this.projects().length, this.projects().length + this.nextBatchSize());

    this.batchStart = this.projects().length;
    this.projects.set([...this.projects(), ...next]);
    this.allProjectsLoaded.set(this.projects().length >= this.processedProjects().length);
    if (this.allProjectsLoaded() && this.projectListAnimationState() === 'initial') {
      this.projectListAnimationState.set('stable');
    }
  }

  /** The date, or null when it cannot be parsed, so a bad value hides the line instead of breaking the list. */
  validDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  descriptionFor(project: Project): string {
    const key = `repo.${project.name}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : project.description;
  }

  filterByTech(tech: string | null): void {
    this.selectedTech.set(tech);
    this.analytics.track('projects_filter', { tech: tech ?? 'all' });
    this.applyFiltersAndSorting();
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder.set(order);
    this.analytics.track('projects_sort', { sort: order });
    this.applyFiltersAndSorting();
  }

  /** Milliseconds before a card slides in, so each batch enters one card after another. */
  enterDelay(index: number): number {
    if (this.projectListAnimationState() === 'viewToggle') {
      return Math.min(index, 8) * 60;
    }
    return index >= this.batchStart ? Math.min(index - this.batchStart, 8) * 70 : 0;
  }

  toggleView(): void {
    this.currentView.set(this.currentView() === 'list' ? 'grid' : 'list');
    this.analytics.track('projects_view_toggle', { view: this.currentView() });
    this.projectListAnimationState.set('viewToggle');
    this.updatePageSize();
  }
}
