import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Renderer2,
  ChangeDetectionStrategy
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import mermaid from 'mermaid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Interface for professional experience
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

// Interface for the generated timeline definitions
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
export class ProfessionalTimelineComponent implements OnInit, AfterViewInit {
  // Using ViewChildren to get all mermaid containers in the journey view
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

  // State properties
  timelineDefinitions: TimelineDefinition[] = [];
  currentIndex = 0; // For experience carousel
  journeyCurrentIndex = 0; // For journey view carousel
  isJourneyVisible = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private readonly renderer: Renderer2
  ) {}

  ngOnInit(): void {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
    });
  }

  ngAfterViewInit(): void {
    // Render diagrams when the list of containers changes (e.g., after entering journey view)
    this.mermaidJourneyContainers.changes.subscribe(() => {
      this.renderAllMermaidDiagrams();
    });

    // A lógica de arrastar só deve funcionar em telas de celular
    if (window.innerWidth <= 480) {
      this.cardContents.forEach((contentRef) => {
        this.setupDragScroll(contentRef.nativeElement);
      });
    }
  }

  /** Navigates the main experience carousel. */
  goTo(index: number): void {
    this.currentIndex = index;
  }

  /**
   * Switches to the journey view, generating all timelines.
   * @param experiencia The starting experience.
   */
  selecionarExperiencia(experiencia: Experiencia): void {
    const selectedIndex = this.experiencias.findIndex(
      (exp) => exp.id === experiencia.id
    );
    this.currentIndex = selectedIndex;
    this.journeyCurrentIndex = selectedIndex;

    this.generateAllMermaidTimelines();
    this.isJourneyVisible = true;
    // Rendering is now triggered by ngAfterViewInit/changes
  }

  /** Returns to the main experience carousel view. */
  voltarParaTimeline(): void {
    this.isJourneyVisible = false;
  }

  /**
   * Handles icon clicks within the journey view to slide between timeline cards.
   * @param clickedExperience The experience of the clicked icon.
   */
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

  /** Generates all possible timeline definitions from the experiences array. */
  generateAllMermaidTimelines(): void {
    this.timelineDefinitions = this.experiencias.map((startExp) => {
      let mermaidText = `timeline\n \n`;

      const startIndex = this.experiencias.findIndex(
        (exp) => exp.id === startExp.id
      );
      // LÓGICA AJUSTADA: Com o array já invertido, removemos o .reverse() para manter a ordem cronológica correta
      const experienciasParaTimeline = this.experiencias.slice(startIndex);

      experienciasParaTimeline.forEach((exp) => {
        const periodo = this.translate.instant(exp.periodo) || exp.periodo;
        const cargo = this.translate.instant(exp.cargo) || exp.cargo;
        mermaidText += `  ${periodo} : ${cargo} @ ${exp.empresa}\n`;
      });

      return { id: startExp.id, definition: mermaidText };
    });
  }

  /** Renders each generated timeline into its respective container. */
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
          // Ensure the container is empty before rendering
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
      const walk = (y - startY) * 2; // O multiplicador aumenta a velocidade da rolagem
      element.scrollTop = scrollTop - walk;
    };

    // Eventos do Mouse
    this.renderer.listen(element, 'mousedown', start);
    this.renderer.listen(element, 'mouseleave', end);
    this.renderer.listen(element, 'mouseup', end);
    this.renderer.listen(element, 'mousemove', move);

    // Eventos de Toque
    this.renderer.listen(element, 'touchstart', start);
    this.renderer.listen(element, 'touchend', end);
    this.renderer.listen(element, 'touchmove', move);
  }
}
