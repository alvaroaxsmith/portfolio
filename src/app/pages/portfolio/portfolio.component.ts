import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core'; // Importar ChangeDetectorRef, ViewChild, ElementRef, OnDestroy
import { trigger, style, transition, animate } from '@angular/animations';
import { ProjectsService } from './services/projects.service';
import { Project } from './Project';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('{{ delay }}ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ], { params: { delay: 0 } }),
      // A transição :leave pode ser removida se não for mais necessária com o scroll infinito
      // transition(':leave', [
      //   style({ opacity: 1, transform: 'translateX(0)' }),
      //   animate('{{ delay }}ms ease-in-out', style({ opacity: 0, transform: 'translateX(20px)' })),
      // ], { params: { delay: 0 } }),
    ]),
  ],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  allProjects: Project[] = [];
  projects: Project[] = [];
  processedProjects: Project[] = [];

  initialLoading: boolean = true;
  loadingMore: boolean = false;
  allProjectsLoaded: boolean = false;
  pageSize = 6;
  currentPage = 1;

  viewportWidth: number = window.innerWidth;
  currentView: 'list' | 'grid' = 'list';

  availableTechs: string[] = [];
  selectedTech: string | null = null;
  currentSortOrder: 'recent' | 'oldest' = 'recent';

  projectListAnimationState: 'initial' | 'viewToggle' | 'stable' = 'initial';

  @ViewChild('loadMoreTrigger', { static: false }) loadMoreTrigger!: ElementRef;
  private observer: IntersectionObserver | undefined;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewportWidth = event.target.innerWidth;
  }

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initialLoading = true;
    this.projectListAnimationState = 'initial';
    this.projectsService.getProjects().subscribe(
      (fetchedProjects) => {
        this.allProjects = fetchedProjects;

        // Filtra os projetos de acordo com os critérios do pipe antes de definir as tecnologias disponíveis
        const displayableProjects = this.allProjects.filter(project => {
          const hasValidDescription = project.description !== 'No description';
          const hasValidTech = project.tech && project.tech !== 'N/A' && project.tech.trim() !== '';
          return hasValidDescription && hasValidTech;
        });

        // Popula availableTechs apenas com tecnologias de projetos "exibíveis"
        this.availableTechs = [...new Set(displayableProjects.map(p => p.tech).filter(t => t))].sort(); // Adiciona .filter(t => t) para remover nulos/undefined e .sort() para ordenar

        // Se a tecnologia selecionada anteriormente não estiver mais na lista de tecnologias disponíveis (após a filtragem),
        // reseta o selectedTech para null para evitar um estado de filtro inconsistente.
        if (this.selectedTech && !this.availableTechs.includes(this.selectedTech)) {
          this.selectedTech = null;
        }

        this.applyFiltersAndSorting(); // Processa e carrega a primeira página via loadNextPage

        this.initialLoading = false;
        this.cdr.detectChanges(); // Crucial: atualiza o DOM ANTES de configurar o observer

        // Configura o observer apenas se houver projetos processados e nem todos foram carregados na primeira chamada
        if (this.processedProjects.length > 0 && !this.allProjectsLoaded) {
          // Usar setTimeout para garantir que loadMoreTrigger esteja no DOM após detectChanges
          setTimeout(() => this.setupIntersectionObserver(), 0);
        } else if (this.processedProjects.length === 0) {
          this.allProjectsLoaded = true; // Garante que se não há projetos, é marcado como carregado
          this.cdr.detectChanges();
        }
      },
      () => {
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
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(): void {
    if (!this.loadMoreTrigger?.nativeElement) {
      // Se o elemento gatilho não estiver no DOM (ex: todos os itens carregados na primeira página), não há o que observar.
      return;
    }
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loadingMore && !this.allProjectsLoaded) { // initialLoading não é mais verificado aqui
          this.loadNextPage();
        }
      });
    }, options);

    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  applyFiltersAndSorting(): void {
    this.projectListAnimationState = 'initial';
    let result = [...this.allProjects];

    // A lógica de filtragem por selectedTech permanece,
    // mas selectedTech agora é baseado em availableTechs que já considera projetos válidos.
    if (this.selectedTech) {
      result = result.filter(p => p.tech === this.selectedTech);
    }

    // A ordenação permanece a mesma
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

    // Importante: processedProjects agora são os projetos que correspondem ao selectedTech (se houver)
    // E que também atendem aos critérios de descrição/tech do pipe, pois availableTechs foi baseado nisso.
    // O pipe no template fará a filtragem final na lista 'projects' que é derivada de 'processedProjects'.
    this.processedProjects = result;
    this.currentPage = 1;
    this.projects = []; // Limpa os projetos atualmente exibidos
    this.allProjectsLoaded = false; // Reseta o status de carregamento

    // Desconecta e limpa completamente o observer antigo antes de recarregar os dados
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined; // Define como undefined para permitir a recriação
    }

    if (this.processedProjects.length > 0) {
      this.loadNextPage(); // Carrega a primeira página dos projetos processados e ordenados
    } else {
      this.allProjectsLoaded = true; // Nenhum projeto para carregar
    }

    this.cdr.detectChanges(); // Garante que o DOM (incluindo #loadMoreTrigger) seja atualizado

    // Reconfigura o IntersectionObserver APÓS o DOM ser atualizado e a primeira página carregada,
    // e somente se houver mais projetos para carregar.
    if (!this.allProjectsLoaded && this.processedProjects.length > 0) {
      // Usar setTimeout para garantir que #loadMoreTrigger esteja no DOM,
      // especialmente se sua renderização for condicional.
      setTimeout(() => {
        // setupIntersectionObserver já verifica se loadMoreTrigger.nativeElement existe
        this.setupIntersectionObserver();
      }, 0);
    }
  }

  loadNextPage(): void {
    // Removida a verificação de 'this.initialLoading'
    if (this.loadingMore || this.allProjectsLoaded) {
      return;
    }

    this.loadingMore = true;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const newProjects = this.processedProjects.slice(startIndex, endIndex);

    if (newProjects.length > 0) {
      this.projects = [...this.projects, ...newProjects];
      this.currentPage++;
    }

    this.allProjectsLoaded = this.projects.length >= this.processedProjects.length;
    this.loadingMore = false;

    if (this.allProjectsLoaded) {
      if (this.observer && this.loadMoreTrigger?.nativeElement) {
        this.observer.unobserve(this.loadMoreTrigger.nativeElement);
      }
      if (this.projectListAnimationState === 'initial') {
        this.projectListAnimationState = 'stable';
      }
    }
    this.cdr.detectChanges();
  }

  filterByTech(tech: string | null): void {
    this.selectedTech = tech;
    this.applyFiltersAndSorting();
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder = order;
    this.applyFiltersAndSorting();
  }

  getAnimationParams(indexInProjectsArray: number) {
    let delay = 0;
    if (this.projectListAnimationState === 'initial' || this.projectListAnimationState === 'viewToggle') {
      if (this.projectListAnimationState === 'initial' && (this.currentPage - 1) === 1) {
        delay = indexInProjectsArray * 100;
      } else if (this.projectListAnimationState === 'viewToggle') {
        delay = indexInProjectsArray * 100;
      }
      else if (this.projectListAnimationState === 'initial' && (this.currentPage - 1) > 1) {
        delay = (indexInProjectsArray % this.pageSize) * 100;
      }
    }
    return { value: 'in', params: { delay: delay.toString() } };
  }

  toggleView(): void {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
    this.projectListAnimationState = 'viewToggle';
    this.cdr.detectChanges();
    // setTimeout(() => this.projectListAnimationState = 'stable', this.projects.length * 100 + 500);
  }
}