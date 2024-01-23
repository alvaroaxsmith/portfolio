import { Component, OnInit, HostListener } from '@angular/core';
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
  projectList: Project[] = [];
  isLoading: boolean = false;
  page: number = 1;
  pageSize: number = 1;
  maxProjects: number = 6;
  scrollDistance = 5;
  scrollUpDistance = 5;
  viewportWidth: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewportWidth = event.target.innerWidth;
  }

  constructor(private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    if (!this.isLoading && this.projectList.length < this.maxProjects) {
      this.isLoading = true;
      this.projectsService.getProjects(this.page, this.pageSize).subscribe((projects) => {
        const remainingProjects = Math.min(projects.length, this.maxProjects - this.projectList.length);

        if (this.projectList.length < 3) {
          // Adiciona apenas dois itens inicialmente
          const initialProjects = projects.slice(0, 3);
          this.projectList = this.projectList.concat(initialProjects);
        } else {
          // Adiciona os projetos restantes conforme o scroll, começando do quarto índice
          const newProjects = projects.slice(3, 3 + remainingProjects);
          this.projectList = this.projectList.concat(newProjects);
        }

        this.isLoading = false;

        if (this.projectList.length >= this.maxProjects) {
          // Se atingir ou ultrapassar o limite, pare de carregar mais projetos
          return;
        }

        this.page++;
      });
    }
  }



  getAnimationDelay(index: number): string {
    return `${index * 1200}`;
  }
}
