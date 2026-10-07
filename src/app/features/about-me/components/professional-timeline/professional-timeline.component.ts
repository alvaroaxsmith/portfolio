import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy, Renderer2, ChangeDetectionStrategy, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import mermaid from 'mermaid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Experiencia {
  id: number;
  cargo: string;
  empresa: string;
  tooltip?: string;
  periodo: string;
  duracao?: string;
  local: string;
  remoto: boolean;
  descricao: string;
  atividades: string[];
  tecnologias: string[];
  competencias: string[];
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
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./professional-timeline.component.scss']
})
export class ProfessionalTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  translate = inject(TranslateService);
  private readonly renderer = inject(Renderer2);

  @ViewChildren('mermaidJourneyContainer')
  mermaidJourneyContainers!: QueryList<ElementRef>;

  @ViewChildren('cardContent') cardContents!: QueryList<
    ElementRef<HTMLElement>
  >;

  experiencias: Experiencia[] = [
    {
      id: 1,
      cargo: 'Estagiário em Engenharia de Produção',
      empresa: 'Metrô de São Paulo',
      periodo: 'abr de 2019 - abr de 2021',
      duracao: '2 anos e 1 mês',
      local: 'São Paulo, Brasil',
      remoto: false,
      descricao: 'timeline.metro.description',
      atividades: ['timeline.metro.activity1', 'timeline.metro.activity2'],
      tecnologias: [
        'Power BI',
        'Excel',
        'SAP ERP',
        'Análise de Dados',
        'Cronoanálise',
      ],
      competencias: ['Análise de Processos', 'Dados Operacionais', 'Melhoria Contínua'],
    },
    {
      id: 2,
      cargo: 'Desenvolvedor Back-end',
      empresa: 'Gama Academy',
      periodo: 'ago de 2022 - set de 2022',
      duracao: '2 meses',
      local: 'São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.gama.description',
      atividades: ['timeline.gama.activity1', 'timeline.gama.activity2'],
      tecnologias: [
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
      competencias: ['Spec Driven Development', 'API Design', 'Clean Code', 'Scrum'],
    },
    {
      id: 3,
      cargo: 'Desenvolvedor Full Stack',
      empresa: 'V.tal',
      periodo: 'out de 2022 - out de 2023',
      duracao: '1 ano e 1 mês',
      local: 'São Paulo, São Paulo, Brasil',
      remoto: false,
      descricao: 'timeline.vtal.description',
      atividades: [
        'timeline.vtal.activity1',
        'timeline.vtal.activity2',
        'timeline.vtal.activity3',
      ],
      tecnologias: [
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
      competencias: ['CI/CD', 'TDD', 'Clean Architecture', 'SOLID', 'Jest'],
    },
    {
      id: 4,
      cargo: 'Desenvolvedor Full Stack',
      empresa: 'Xmart Solutions',
      periodo: 'jan de 2024 - abr de 2024',
      duracao: '4 meses',
      local: 'São Paulo, Brasil',
      remoto: false,
      descricao: 'timeline.xmart.description',
      atividades: [
        'timeline.xmart.activity1',
        'timeline.xmart.activity2',
        'timeline.xmart.activity3',
      ],
      tecnologias: [
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
      competencias: [
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
      cargo: 'Desenvolvedor Front-end',
      empresa: 'Marttech Desenvolvimento de Software',
      periodo: 'mai de 2024 - jun de 2024',
      duracao: '2 meses',
      local: 'São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.marttech.description',
      atividades: [
        'timeline.marttech.activity1',
        'timeline.marttech.activity2',
        'timeline.marttech.activity3',
      ],
      tecnologias: [
        'TypeScript',
        'React',
        'Material UI',
        'React Hooks',
        'Context API',
        'Azure DevOps',
      ],
      competencias: ['TDD', 'Clean Architecture', 'Revisão de código'],
    },
    {
      id: 6,
      cargo: 'Desenvolvedor Full Stack',
      empresa: 'Mutant',
      periodo: 'jun de 2024 - out de 2025',
      duracao: '1 ano e 5 meses',
      local: 'São Paulo, São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.mutantFs.description',
      atividades: ['timeline.mutantFs.activity1', 'timeline.mutantFs.activity2'],
      tecnologias: [
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
      competencias: ['TDD', 'Jest', 'Cypress', 'Clean Code', 'Arquitetura de Software'],
    },
    {
      id: 7,
      cargo: 'Tech Lead Cross',
      empresa: 'Mutant (Alocado na Telefônica Vivo)',
      tooltip: 'Mutant',
      periodo: 'out de 2025 - o momento',
      local: 'São Paulo, São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.mutantLead.description',
      atividades: [
        'timeline.mutantLead.activity1',
        'timeline.mutantLead.activity2',
        'timeline.mutantLead.activity3',
        'timeline.mutantLead.activity4',
      ],
      tecnologias: [
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
      competencias: ['Spec Driven Development', 'Arquitetura de Software', 'Boas Práticas', 'Code Review'],
    },
  ];

  timelineDefinitions: TimelineDefinition[] = [];
  currentIndex = 0;
  journeyCurrentIndex = 0;
  isJourneyVisible = false;

  private readonly mobileQuery = window.matchMedia('(max-width: 480px)');
  isMobile = this.mobileQuery.matches;

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
    this.isMobile = event.matches;
    if (this.isMobile) {
      this.isJourneyVisible = false;
    }
    this.cdr.markForCheck();
  };

  ngAfterViewInit(): void {
    this.mermaidJourneyContainers.changes.subscribe(() => {
      this.renderAllMermaidDiagrams();
    });

    if (window.innerWidth <= 480) {
      this.cardContents.forEach((contentRef) => {
        this.setupDragScroll(contentRef.nativeElement);
      });
    }
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }

  selecionarExperiencia(experiencia: Experiencia): void {
    if (this.isMobile) {
      return;
    }
    const selectedIndex = this.experiencias.findIndex(
      (exp) => exp.id === experiencia.id
    );
    this.currentIndex = selectedIndex;
    this.journeyCurrentIndex = selectedIndex;

    this.generateAllMermaidTimelines();
    this.isJourneyVisible = true;
  }

  voltarParaTimeline(): void {
    this.isJourneyVisible = false;
  }

  handleIconClickInJourneyView(clickedExperience: Experiencia): void {
    const newIndex = this.experiencias.findIndex(
      (exp) => exp.id === clickedExperience.id
    );
    this.journeyCurrentIndex = newIndex;
  }

  handleActionKey(event: KeyboardEvent, action: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  generateAllMermaidTimelines(): void {
    this.timelineDefinitions = this.experiencias.map((startExp) => {
      let mermaidText = `timeline\n \n`;

      const startIndex = this.experiencias.findIndex(
        (exp) => exp.id === startExp.id
      );
      const experienciasParaTimeline = this.experiencias.slice(startIndex);

      experienciasParaTimeline.forEach((exp) => {
        const periodo = this.translate.instant(exp.periodo) || exp.periodo;
        const cargo = this.translate.instant(exp.cargo) || exp.cargo;
        mermaidText += `  ${periodo} : ${cargo} @ ${exp.empresa}\n`;
      });

      return { id: startExp.id, definition: mermaidText };
    });
  }

  async renderAllMermaidDiagrams(): Promise<void> {
    if (!this.isJourneyVisible || !this.mermaidJourneyContainers) {
      return;
    }

    const containers = this.mermaidJourneyContainers.toArray();
    for (const mermaidContainer of containers) {
      const container = mermaidContainer.nativeElement;
      const experienceId = container.dataset.experienceId;
      const timelineDef = this.timelineDefinitions.find(
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
    this.cdr.detectChanges();
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
