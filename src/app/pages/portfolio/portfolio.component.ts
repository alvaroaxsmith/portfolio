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
  projects: Project[] = [];
  loading: boolean = false;
  viewportWidth: number = window.innerWidth;
  currentView: 'list' | 'grid' = 'list';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewportWidth = event.target.innerWidth;
  }

  constructor(private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    if (this.loading && this.projects.length > 0) {
      return;
    }

    this.loading = true;

    this.projectsService.getProjects().subscribe((allProjects) => {
      this.projects = allProjects.filter(project => project.description !== 'No description');
      this.loading = false;
    });
  }

  getAnimationDelay(index: number): string {
    return `${index * 200}`;
  }

  toggleView(): void {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
  }
}