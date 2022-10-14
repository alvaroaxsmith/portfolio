import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent {

  projects = [
    {
      id: 1,
      name: 'Soul GYM',
      tech: 'HTML | CSS | JS',
      description: 'Responsive website of a fictional gym.',
      repo: 'https://github.com/alvaroaxsmith/academia-soulcode'
    },
    {
      id: 2, name: 'Mammography Data System',
      tech: 'Angular | Java',
      description: 'System for providing data on mammography exams performed by Brazilian women in the national territory.',
      repo: 'https://github.com/alvaroaxsmith/dados-mamografia'
    },
    {
      id: 3,
      name: 'Github User Finder',
      tech: 'Angular | Angular Material',
      description: 'This application does Github user searches using an official Github api.',
      repo: 'https://github.com/alvaroaxsmith/buscador-github'
    },
  ]

}
