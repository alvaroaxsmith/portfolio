import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ProjectsService } from './services/projects.service';
import { Project } from './Project';
import { TranslateService } from '@ngx-translate/core';

// Largura mínima do card no grid: precisa acompanhar o minmax do
// portfolio.component.scss para o cálculo de colunas bater com a tela
const GRID_MIN_CARD_WIDTH = 300;
// Lotes pequenos para o carregamento infinito ser percebido: a cada lote o
// fim da lista mostra os skeletons no layout atual antes dos cards chegarem
const GRID_ROWS_PER_PAGE = 2;
const LIST_ITEMS_PER_PAGE = 4;
// Tempo de exibição do skeleton a cada lote: os dados já estão em memória,
// sem ele os placeholders nem chegariam a aparecer
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
    standalone: false
})
export class PortfolioComponent implements OnInit, OnDestroy {
  allProjects: Project[] = [];
  projects: Project[] = [];
  processedProjects: Project[] = [];

  initialLoading: boolean = true;
  loadError = false;
  loadingMore: boolean = false;
  allProjectsLoaded: boolean = false;
  // Recalculado conforme a tela e a visualização (ver updatePageSize)
  pageSize = 6;
  // Colunas do grid na largura atual (1 na lista)
  columns = 1;
  // Índice do primeiro item do último lote, para escalonar só a animação dele
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
    private translate: TranslateService
  ) { }

  /** Quantidade de skeletons ao carregar mais: exatamente o que vai chegar. */
  get loadingMoreCount(): number {
    return Math.min(this.nextBatchSize(), this.processedProjects.length - this.projects.length);
  }

  /** Tamanho do próximo lote, completando a última linha do grid se as colunas mudaram. */
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
    this.projectsService.getProjects().subscribe(
      (fetchedProjects) => {
        this.allProjects = fetchedProjects;
        this.availableTechs = [...new Set(this.allProjects.map(p => p.tech).filter(t => t))].sort();

        // Se a tecnologia selecionada anteriormente não estiver mais na lista de tecnologias disponíveis (após a filtragem),
        // reseta o selectedTech para null para evitar um estado de filtro inconsistente.
        if (this.selectedTech && !this.availableTechs.includes(this.selectedTech)) {
          this.selectedTech = null;
        }

        this.initialLoading = false;
        this.applyFiltersAndSorting();
      },
      () => {
        this.loadError = true;
        this.allProjects = [];
        this.availableTechs = [];
        this.initialLoading = false;
        this.projects = [];
        this.processedProjects = [];
        this.allProjectsLoaded = true;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    clearTimeout(this.loadMoreTimer);
    this.observer?.disconnect();
  }

  /**
   * Ajusta o lote ao layout: no grid, linhas completas com as colunas que
   * cabem na largura; na lista, uma quantidade fixa de itens.
   */
  updatePageSize(): void {
    if (this.currentView === 'grid') {
      const width = this.pageRef?.nativeElement.clientWidth || window.innerWidth;
      // Mesmo gap do SCSS: clamp(0.75rem, 1.5vw, 1rem)
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

    // Dispara só quando o fim da lista entra na tela, para os skeletons do
    // próximo lote aparecerem à vista do usuário
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

    // A primeira página entra na hora (os dados já chegaram); as próximas
    // passam pelo skeleton em loadMore
    this.appendNextPage();
  }

  /** Mostra o skeleton e, em seguida, acrescenta a próxima página. */
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

    // Recria o observer depois de renderizar: se o gatilho continuar visível
    // (tela alta ou lote pequeno), o observer novo dispara de imediato e
    // carrega mais até preencher a tela
    this.setupIntersectionObserver();
  }

  // Uses the optional `repo.<name>` translation when present, otherwise the GitHub description
  descriptionFor(project: Project): string {
    const key = `repo.${project.name}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : project.description;
  }

  filterByTech(tech: string | null): void {
    this.selectedTech = tech;
    this.applyFiltersAndSorting();
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder = order;
    this.applyFiltersAndSorting();
  }

  getAnimationParams(index: number) {
    let delay = 0;
    if (this.projectListAnimationState === 'viewToggle') {
      delay = Math.min(index, 8) * 60;
    } else if (index >= this.batchStart) {
      // Só o lote recém-chegado entra escalonado
      delay = Math.min(index - this.batchStart, 8) * 70;
    }
    return { value: 'in', params: { delay: delay.toString() } };
  }

  toggleView(): void {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
    this.projectListAnimationState = 'viewToggle';
    this.updatePageSize();
    this.cdr.detectChanges();
  }
}
