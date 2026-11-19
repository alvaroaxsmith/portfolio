import { Component, OnInit, ElementRef, OnDestroy, ChangeDetectionStrategy, afterRenderEffect, computed, inject, linkedSignal, untracked, viewChild, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProjectsService } from './services/projects.service';
import { Project } from './project.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { onWindowEvent } from '../../core/window-events/window-events';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { ProjectCardSkeletonComponent } from '../../shared/skeleton/project-card-skeleton/project-card-skeleton.component';

const GRID_MIN_CARD_WIDTH = 300;
const GRID_ROWS_PER_PAGE = 2;
const LIST_ITEMS_PER_PAGE = 4;

/** What a card shows, worked out once per project instead of on every change detection. */
interface ProjectCard {
  project: Project;
  updated: Date | null;
  description: string;
  enterDelay: number;
}

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatIconButton, MatTooltip, MatIcon, MatCard, MatCardTitleGroup, MatCardTitle, MatCardSubtitle, MatButton, MatCardContent, ProjectCardSkeletonComponent, DatePipe, TranslatePipe]
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private readonly projectsService = inject(ProjectsService);
  private readonly translate = inject(TranslateService);
  private readonly analytics = inject(AnalyticsService);

  /** The projects from GitHub; loading and failure are part of the resource, and leaving the page cancels it. */
  private readonly source = rxResource({ stream: () => this.projectsService.getProjects() });

  readonly allProjects = computed(() => (this.source.hasValue() ? this.source.value() : []));
  readonly initialLoading = computed(() => this.source.isLoading());
  readonly loadError = computed(() => !!this.source.error());

  readonly pageSize = signal(6);
  readonly columns = signal(1);
  readonly currentView = signal<'list' | 'grid'>('list');

  readonly availableTechs = computed(() => [...new Set(this.allProjects().map((p) => p.tech).filter((t) => t))].sort());
  private readonly pickedTech = signal<string | null>(null);
  /** The technology filter, or none when the picked one is not among the projects. */
  protected readonly selectedTech = computed(() => {
    const picked = this.pickedTech();
    return picked && this.availableTechs().includes(picked) ? picked : null;
  });
  protected readonly currentSortOrder = signal<'recent' | 'oldest'>('recent');

  /** Every project that matches the filter, in the chosen order. */
  readonly processedProjects = computed(() => {
    const tech = this.selectedTech();
    const recentFirst = this.currentSortOrder() === 'recent';
    return this.allProjects()
      .filter((p) => !tech || p.tech === tech)
      .map((project) => ({ project, time: new Date(project.date).getTime() }))
      .sort((a, b) => {
        const validA = !Number.isNaN(a.time);
        const validB = !Number.isNaN(b.time);
        if (validA !== validB) return validA ? -1 : 1;
        if (!validA) return 0;
        return recentFirst ? b.time - a.time : a.time - b.time;
      })
      .map(({ project }) => project);
  });

  /** How many of them are on screen; a new filter or order starts again from the first batch. */
  private readonly shownCount = linkedSignal({ source: this.processedProjects, computation: () => untracked(this.pageSize) });
  readonly projects = computed(() => this.processedProjects().slice(0, this.shownCount()));
  readonly allProjectsLoaded = computed(() => this.projects().length >= this.processedProjects().length);

  /** Index of the first card of the batch being shown, where the entrance stagger starts again. */
  private readonly batchStart = linkedSignal({ source: this.processedProjects, computation: () => 0 });
  /** Whether the cards on screen came from switching view, which staggers all of them again. */
  private readonly viewToggled = linkedSignal({ source: this.processedProjects, computation: () => false });

  readonly pageRef = viewChild.required<ElementRef<HTMLElement>>('page');
  private readonly loadMoreTrigger = viewChild<ElementRef<HTMLElement>>('loadMoreTrigger');
  private observer: IntersectionObserver | undefined;

  /** The current language, so translated descriptions follow a language switch. */
  private readonly lang = this.translate.currentLang;

  protected readonly initialSkeletons = computed(() => Array.from({ length: this.pageSize() }, (_, i) => i));

  protected readonly cards = computed<ProjectCard[]>(() => {
    this.lang();
    return this.projects().map((project, index) => ({
      project,
      updated: validDate(project.date),
      description: this.descriptionFor(project),
      enterDelay: this.enterDelay(index)
    }));
  });

  constructor() {
    // Watches the end of the list again after every batch. The observer reports on the next frame,
    // after the new cards have rendered, so it sees where the end of the list is now.
    afterRenderEffect(() => {
      const trigger = this.loadMoreTrigger()?.nativeElement;
      this.projects();
      untracked(() => this.observeLoadMoreTrigger(trigger));
    });

    onWindowEvent('resize', () => this.updatePageSize());
  }

  trackRepo(project: Project): void {
    this.analytics.track('repo_click', { repo: project.name, tech: project.tech || 'none', view: this.currentView() });
  }

  private nextBatchSize(): number {
    if (this.projects().length === 0) {
      return this.pageSize();
    }
    const missingInRow = (this.columns() - (this.projects().length % this.columns())) % this.columns();
    return this.pageSize() + missingInRow;
  }

  ngOnInit(): void {
    this.updatePageSize();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Returns whether the layout changed, so a resize that changes nothing stays outside Angular. */
  updatePageSize(): boolean {
    let columns = 1;
    let pageSize = LIST_ITEMS_PER_PAGE;
    if (this.currentView() === 'grid') {
      const width = this.pageRef()?.nativeElement.clientWidth || window.innerWidth;
      const gap = Math.min(16, Math.max(12, window.innerWidth * 0.015));
      columns = Math.max(1, Math.floor((width + gap) / (GRID_MIN_CARD_WIDTH + gap)));
      pageSize = columns * GRID_ROWS_PER_PAGE;
    }
    const changed = columns !== this.columns() || pageSize !== this.pageSize();
    this.columns.set(columns);
    this.pageSize.set(pageSize);
    return changed;
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

  /** The projects are already in memory, so the next batch shows right away. */
  loadMore(): void {
    if (this.allProjectsLoaded()) {
      return;
    }
    this.appendNextPage();
  }

  private appendNextPage(): void {
    const shown = this.projects().length;
    this.batchStart.set(shown);
    this.shownCount.set(shown + this.nextBatchSize());
  }

  private descriptionFor(project: Project): string {
    const key = `repo.${project.name}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : project.description;
  }

  filterByTech(tech: string | null): void {
    this.pickedTech.set(tech);
    this.analytics.track('projects_filter', { tech: tech ?? 'all' });
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder.set(order);
    this.analytics.track('projects_sort', { sort: order });
  }

  /** Milliseconds before a card slides in, so each batch enters one card after another. */
  private enterDelay(index: number): number {
    if (this.viewToggled()) {
      return Math.min(index, 8) * 60;
    }
    const batchStart = this.batchStart();
    return index >= batchStart ? Math.min(index - batchStart, 8) * 70 : 0;
  }

  toggleView(): void {
    this.currentView.set(this.currentView() === 'list' ? 'grid' : 'list');
    this.analytics.track('projects_view_toggle', { view: this.currentView() });
    this.viewToggled.set(true);
    this.updatePageSize();
  }
}

/** The date, or null when it cannot be parsed, so a bad value hides the line instead of breaking the list. */
function validDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
