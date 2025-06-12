import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef
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
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('{{ delay }}ms ease-in-out', style({ opacity: 0, transform: 'translateX(20px)' })),
      ], { params: { delay: 0 } }),
    ]),
  ],
})
export class PortfolioComponent implements OnInit {
  allProjects: Project[] = [];
  projects: Project[] = [];
  loading: boolean = false;
  viewportWidth: number = window.innerWidth;
  currentView: 'list' | 'grid' = 'list';

  availableTechs: string[] = [];
  selectedTech: string | null = null;
  currentSortOrder: 'recent' | 'oldest' = 'recent';

  projectListAnimationState: 'initial' | 'filtering' | 'sorting' | 'viewToggle' = 'initial';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewportWidth = event.target.innerWidth;
  }

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef // Injetar ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.projectListAnimationState = 'initial'; // Define o estado para a animação de carregamento inicial
    this.loadProjects();
  }

  loadProjects() {
    if (this.loading && this.allProjects.length > 0) {
      return;
    }
    this.loading = true;
    // projectListAnimationState já é 'initial' de ngOnInit,
    // então applyFiltersAndSorting usará a animação escalonada.
    this.projectsService.getProjects().subscribe((fetchedProjects) => {
      this.allProjects = fetchedProjects.filter(project => project.description !== 'No description');
      this.extractAvailableTechs();
      this.applyFiltersAndSorting();
      this.loading = false;
    });
  }

  extractAvailableTechs(): void {
    const techs = new Set<string>();
    this.allProjects.forEach(project => {
      if (project.tech && project.tech !== 'N/A') {
        techs.add(project.tech);
      }
    });
    this.availableTechs = Array.from(techs).sort();
  }

  applyFiltersAndSorting(): void {
    let filteredResult = [...this.allProjects];

    if (this.selectedTech) {
      filteredResult = filteredResult.filter(project => project.tech === this.selectedTech);
    }

    if (this.currentSortOrder === 'recent') {
      filteredResult.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
    } else {
      filteredResult.sort((a, b) => new Date(a.pushed_at).getTime() - new Date(b.pushed_at).getTime());
    }

    this.projects = filteredResult;

    // REMOVIDO: O bloco setTimeout que redefinia projectListAnimationState.
    // O estado agora persistirá até ser explicitamente alterado por outra ação.
  }

  filterByTech(tech: string | null): void {
    this.selectedTech = tech;
    this.projectListAnimationState = 'filtering'; // Define o estado para animação instantânea
    this.cdr.detectChanges(); // Forçar a detecção de alterações
    this.applyFiltersAndSorting();
  }

  sortByDate(order: 'recent' | 'oldest'): void {
    this.currentSortOrder = order;
    this.projectListAnimationState = 'sorting'; // Define o estado para animação instantânea
    this.cdr.detectChanges(); // Forçar a detecção de alterações
    this.applyFiltersAndSorting();
  }

  getAnimationDelay(index: number): string {
    if (this.projectListAnimationState === 'filtering' || this.projectListAnimationState === 'sorting') {
      return '0'; // Animação instantânea para filtragem ou ordenação
    }
    // Animação escalonada para 'initial' ou 'viewToggle'
    return `${index * 200}`;
  }

  toggleView(): void {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
    this.projectListAnimationState = 'viewToggle'; // Define o estado para animação escalonada
    // Se a alternância de visualização precisar atualizar a lista de projetos (o que não parece ser o caso aqui),
    // applyFiltersAndSorting() seria chamado.
  }
}