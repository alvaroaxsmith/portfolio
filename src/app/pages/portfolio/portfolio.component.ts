import { Project } from './Project';
import { Component, OnInit } from '@angular/core';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  projectList: Project[] | null = null;

  constructor(
    private projectsService: ProjectsService) {

  }

  ngOnInit(): void {
    this.projectsService.getProjects().subscribe((projects) => {
      this.projectList = projects;
    });
  }




}
