import { Project } from './Project';
import { ProjectsService } from './services/projects.service';
import { trigger, style, transition, animate } from '@angular/animations'
import { Component, OnInit, HostListener } from '@angular/core';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate('{{ delay }}ms', style({ opacity: 1, transform: 'translateX(0)' })),
      ], { params: { delay: 0 } }),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('{{ delay }}ms', style({ opacity: 0, transform: 'translateX(100%)' })),
      ], { params: { delay: 0 } }),
    ]),
  ],
})
export class PortfolioComponent implements OnInit {
  projectList: Project[] | null = null;
  viewportWidth: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewportWidth = event.target.innerWidth;
  }

  constructor(private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.projectsService.getProjects().subscribe((projects) => {
      this.projectList = projects;
    });
  }

  getAnimationDelay(index: number): string {
    return `${index * 1200}`;
  }
}
