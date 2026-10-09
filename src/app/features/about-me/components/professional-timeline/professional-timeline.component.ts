import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy, Renderer2, ChangeDetectionStrategy, effect, inject, signal, untracked, viewChildren } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import mermaid from 'mermaid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Experience {
  id: number;
  role: string;
  company: string;
  tooltip?: string;
  period: string;
  duration?: string;
  description: string;
  activities: string[];
  technologies: string[];
  skills: string[];
}

interface TimelineDefinition {
  id: number;
  definition: string;
}

@Component({
    selector: 'app-professional-timeline',
    imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatTooltipModule
],
    templateUrl: './professional-timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./professional-timeline.component.scss']
})
export class ProfessionalTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  translate = inject(TranslateService);
  private readonly renderer = inject(Renderer2);

  readonly mermaidJourneyContainers = viewChildren<ElementRef<HTMLElement>>('mermaidJourneyContainer');

  constructor() {
    // Draws the journey diagrams whenever their containers appear, i.e. when the journey opens.
    effect(() => {
      this.mermaidJourneyContainers();
      untracked(() => this.renderAllMermaidDiagrams());
    });
  }

  readonly cardContents = viewChildren<ElementRef<HTMLElement>>('cardContent');

  experiences: Experience[] = [
    {
      id: 1,
      role: 'Estagiário em Engenharia de Produção',
      company: 'Metrô de São Paulo',
      period: 'abr de 2019 - abr de 2021',
      duration: '2 anos e 1 mês',
      description: 'timeline.metro.description',
      activities: ['timeline.metro.activity1', 'timeline.metro.activity2'],
      technologies: [
        'Power BI',
        'Excel',
        'SAP ERP',
        'Análise de Dados',
        'Cronoanálise',
      ],
      skills: ['Análise de Processos', 'Dados Operacionais', 'Melhoria Contínua'],
    },
    {
      id: 2,
      role: 'Desenvolvedor Back-end',
      company: 'Gama Academy',
      period: 'ago de 2022 - set de 2022',
      duration: '2 meses',
      description: 'timeline.gama.description',
      activities: ['timeline.gama.activity1', 'timeline.gama.activity2'],
      technologies: [
        'NestJS',
        'REST',
        'TypeScript',
        'PostgreSQL',
        'Docker Compose',
        'Swagger',
        'TypeORM',
        'GitHub',
        'CI/CD',
      ],
      skills: ['Spec Driven Development', 'API Design', 'Clean Code', 'Scrum'],
    },
    {
      id: 3,
      role: 'Desenvolvedor Full Stack',
      company: 'V.tal',
      period: 'out de 2022 - out de 2023',
      duration: '1 ano e 1 mês',
      description: 'timeline.vtal.description',
      activities: [
        'timeline.vtal.activity1',
        'timeline.vtal.activity2',
        'timeline.vtal.activity3',
      ],
      technologies: [
        'Vue2',
        'Vuex',
        'React',
        'TypeScript',
        'NestJS',
        'Java Spring Boot',
        'OracleDB',
        'Redis',
        'MongoDB',
        'Azure DevOps',
      ],
      skills: ['CI/CD', 'TDD', 'Clean Architecture', 'SOLID', 'Jest'],
    },
    {
      id: 4,
      role: 'Desenvolvedor Full Stack',
      company: 'Xmart Solutions',
      period: 'jan de 2024 - abr de 2024',
      duration: '4 meses',
      description: 'timeline.xmart.description',
      activities: [
        'timeline.xmart.activity1',
        'timeline.xmart.activity2',
        'timeline.xmart.activity3',
      ],
      technologies: [
        'React',
        'Shadcn/ui',
        'Tailwind',
        'Context API',
        'Python',
        'FastAPI',
        'MySQL',
        'MariaDB',
        'Jenkins',
        'Docker',
        'AWS Cloud',
        'Lambda',
      ],
      skills: [
        'Clean Architecture',
        'TDD',
        'BFF',
        'Microserviços',
        'DevSecOps',
        'AppSec',
      ],
    },
    {
      id: 5,
      role: 'Desenvolvedor Front-end',
      company: 'Marttech Desenvolvimento de Software',
      period: 'mai de 2024 - jun de 2024',
      duration: '2 meses',
      description: 'timeline.marttech.description',
      activities: [
        'timeline.marttech.activity1',
        'timeline.marttech.activity2',
        'timeline.marttech.activity3',
      ],
      technologies: [
        'TypeScript',
        'React',
        'Material UI',
        'React Hooks',
        'Context API',
        'Azure DevOps',
      ],
      skills: ['TDD', 'Clean Architecture', 'Revisão de código'],
    },
    {
      id: 6,
      role: 'Desenvolvedor Full Stack',
      company: 'Mutant',
      period: 'jun de 2024 - out de 2025',
      duration: '1 ano e 5 meses',
      description: 'timeline.mutantFs.description',
      activities: ['timeline.mutantFs.activity1', 'timeline.mutantFs.activity2'],
      technologies: [
        'Java',
        'Spring Boot',
        'Node.js',
        'NestJS',
        'React',
        'Micro Front-Ends',
        'BFF',
        'Azure DevOps',
        'Docker',
        'Redis',
        'MongoDB',
      ],
      skills: ['TDD', 'Jest', 'Cypress', 'Clean Code', 'Arquitetura de Software'],
    },
    {
      id: 7,
      role: 'Tech Lead Cross',
      company: 'Mutant (Alocado na Telefônica Vivo)',
      tooltip: 'Mutant',
      period: 'out de 2025 - o momento',
      description: 'timeline.mutantLead.description',
      activities: [
        'timeline.mutantLead.activity1',
        'timeline.mutantLead.activity2',
        'timeline.mutantLead.activity3',
        'timeline.mutantLead.activity4',
      ],
      technologies: [
        'Node.js',
        'React',
        'Java',
        'Spring Boot',
        'Micro Front-Ends',
        'BFFs',
        'Agentic AI',
        'Prompt Engineering',
        'Azure DevOps',
      ],
      skills: ['Spec Driven Development', 'Arquitetura de Software', 'Boas Práticas', 'Code Review'],
    },
  ];

  readonly timelineDefinitions = signal<TimelineDefinition[]>([]);
  readonly currentIndex = signal(0);
  readonly journeyCurrentIndex = signal(0);
  readonly isJourneyVisible = signal(false);

  private readonly mobileQuery = window.matchMedia('(max-width: 480px)');
  readonly isMobile = signal(this.mobileQuery.matches);

  ngOnInit(): void {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'strict',
    });

    this.mobileQuery.addEventListener('change', this.onScreenChange);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.onScreenChange);
  }

  private readonly onScreenChange = (event: MediaQueryListEvent): void => {
    this.isMobile.set(event.matches);
    if (this.isMobile()) {
      this.isJourneyVisible.set(false);
    }
  };

  ngAfterViewInit(): void {
    if (window.innerWidth <= 480) {
      this.cardContents().forEach((contentRef) => {
        this.setupDragScroll(contentRef.nativeElement);
      });
    }
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  openJourney(experience: Experience): void {
    if (this.isMobile()) {
      return;
    }
    const selectedIndex = this.experiences.findIndex(
      (exp) => exp.id === experience.id
    );
    this.currentIndex.set(selectedIndex);
    this.journeyCurrentIndex.set(selectedIndex);

    this.generateAllMermaidTimelines();
    this.isJourneyVisible.set(true);
  }

  closeJourney(): void {
    this.isJourneyVisible.set(false);
  }

  handleIconClickInJourneyView(clickedExperience: Experience): void {
    const newIndex = this.experiences.findIndex(
      (exp) => exp.id === clickedExperience.id
    );
    this.journeyCurrentIndex.set(newIndex);
  }

  handleActionKey(event: KeyboardEvent, action: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  generateAllMermaidTimelines(): void {
    this.timelineDefinitions.set(this.experiences.map((startExp) => {
      let mermaidText = `timeline\n \n`;

      const startIndex = this.experiences.findIndex(
        (exp) => exp.id === startExp.id
      );
      const journeyExperiences = this.experiences.slice(startIndex);

      journeyExperiences.forEach((exp) => {
        const period = this.translate.instant(exp.period) || exp.period;
        const role = this.translate.instant(exp.role) || exp.role;
        mermaidText += `  ${period} : ${role} @ ${exp.company}\n`;
      });

      return { id: startExp.id, definition: mermaidText };
    }));
  }

  async renderAllMermaidDiagrams(): Promise<void> {
    if (!this.isJourneyVisible()) {
      return;
    }

    const containers = this.mermaidJourneyContainers();
    for (const mermaidContainer of containers) {
      const container = mermaidContainer.nativeElement;
      const experienceId = container.dataset['experienceId'];
      const timelineDef = this.timelineDefinitions().find(
        (def) => def.id.toString() === experienceId
      );

      if (timelineDef && container) {
        try {
          container.innerHTML = '';
          const uniqueId = `mermaid-graph-${experienceId}-${Date.now()}`;
          const { svg } = await mermaid.render(
            uniqueId,
            timelineDef.definition
          );
          container.innerHTML = svg;
        } catch (e) {
          console.error(`Error rendering Mermaid for ID ${experienceId}:`, e);
          container.innerHTML = `<p>${this.translate.instant(
            'timeline.mermaid.error'
          )}</p>`;
        }
      }
    }
  }

  private setupDragScroll(element: HTMLElement): void {
    let isDown = false;
    let startY: number;
    let scrollTop: number;

    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      this.renderer.addClass(element, 'grabbing');
      const pageY = e instanceof MouseEvent ? e.pageY : e.touches[0].pageY;
      startY = pageY - element.offsetTop;
      scrollTop = element.scrollTop;
      if (e instanceof MouseEvent) e.preventDefault();
    };

    const end = () => {
      isDown = false;
      this.renderer.removeClass(element, 'grabbing');
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      if (e instanceof MouseEvent) e.preventDefault();
      const pageY = e instanceof MouseEvent ? e.pageY : e.touches[0].pageY;
      const y = pageY - element.offsetTop;
      const walk = (y - startY) * 2;
      element.scrollTop = scrollTop - walk;
    };

    this.renderer.listen(element, 'mousedown', start);
    this.renderer.listen(element, 'mouseleave', end);
    this.renderer.listen(element, 'mouseup', end);
    this.renderer.listen(element, 'mousemove', move);

    this.renderer.listen(element, 'touchstart', start);
    this.renderer.listen(element, 'touchend', end);
    this.renderer.listen(element, 'touchmove', move);
  }
}
