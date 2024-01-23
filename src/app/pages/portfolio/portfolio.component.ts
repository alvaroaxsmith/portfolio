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
    if (this.isLoading || this.projectList.length >= this.maxProjects) {
      return;
    }

    this.isLoading = true;

    this.projectsService.getProjects().subscribe((projects) => {
      const remainingProjects = Math.min(projects.length, this.maxProjects - this.projectList.length);
      const startIndex = this.projectList.length < 3 ? 0 : 3;
      const newProjects = projects.slice(startIndex, startIndex + remainingProjects);
      this.projectList = this.projectList.concat(newProjects);
      this.isLoading = false;

      if (this.projectList.length >= this.maxProjects) {
        return;
      }

      this.page++;
    });
  }

  getAnimationDelay(index: number): string {
    return `${index * 1200}`;
  }
}
