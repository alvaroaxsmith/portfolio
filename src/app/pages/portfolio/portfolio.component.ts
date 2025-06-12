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
  private observer!: IntersectionObserver;

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
        this.availableTechs = [...new Set(this.allProjects.map(p => p.tech))];

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
    this.projectListAnimationState = 'initial'; // Reset para animação escalonada
    let result = [...this.allProjects];

    if (this.selectedTech) {
      result = result.filter(p => p.tech === this.selectedTech);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.currentSortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    this.processedProjects = result;
    this.currentPage = 1;
    this.projects = [];
    this.allProjectsLoaded = false;

    // Desconecta o observer temporariamente se ele existir e estiver observando
    if (this.observer && this.loadMoreTrigger?.nativeElement) {
      this.observer.unobserve(this.loadMoreTrigger.nativeElement);
    } else if (this.observer) {
      // Se o trigger não existe mais mas o observer sim, desconecte para evitar erros.
      this.observer.disconnect();
      this.observer = undefined!; // Força a recriação se necessário
    }


    if (this.processedProjects.length > 0) {
      this.loadNextPage(); // Carrega a primeira página dos projetos processados
    } else {
      this.allProjectsLoaded = true; // Nenhum projeto para carregar
    }

    this.cdr.detectChanges(); // Garante que o DOM reflita as mudanças (ex: #loadMoreTrigger)

    // Re-ativa o observer se necessário e se ele existir (ou recria se foi desconectado)
    if (!this.allProjectsLoaded && this.processedProjects.length > 0) {
      if (!this.observer) { // Se foi desconectado e limpo
        setTimeout(() => this.setupIntersectionObserver(), 0); // Recria e observa
      } else if (this.loadMoreTrigger?.nativeElement) { // Se existe e o trigger também
        this.observer.observe(this.loadMoreTrigger.nativeElement);
      }
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