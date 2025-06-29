import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatTooltipModule,
  ],
  templateUrl: './professional-timeline.component.html',
  styleUrls: ['./professional-timeline.component.scss'],
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
      id: 5,
      cargo: 'Desenvolvedor back end',
      empresa: 'Gama Academy',
      periodo: 'ago de 2022 - set de 2022',
      duracao: '2 meses',
      local: 'São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.gama.description',
      atividades: ['timeline.gama.activity1', 'timeline.gama.activity2'],
      tecnologias: [
        'Nestjs',
        'REST',
        'Typescript',
        'Postgresql',
        'Docker-Compose',
        'Swagger',
        'Typeorm',
        'Github',
        'CI/CD',
      ],
      competencias: ['Conventional Commits', 'Eslint', 'Prettier', 'Gitflow'],
    },
    {
      id: 4,
      cargo: 'Desenvolvedor full stack',
      empresa: 'V.tal',
      periodo: 'out de 2022 - out de 2023',
      duracao: '1 ano 1 mês',
      local: 'São Paulo, São Paulo, Brasil',
      remoto: false,
      descricao: 'timeline.vtal.description',
      atividades: [
        'timeline.vtal.activity1',
        'timeline.vtal.activity2',
        'timeline.vtal.activity3',
        'timeline.vtal.activity4',
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
      id: 3,
      cargo: 'Desenvolvedor full stack',
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
      id: 2,
      cargo: 'Desenvolvedor front end',
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
      id: 1,
      cargo: 'Desenvolvedor full stack',
      empresa: 'Mutant',
      periodo: 'jun de 2024 - o momento',
      local: 'São Paulo, São Paulo, Brasil',
      remoto: true,
      descricao: 'timeline.mutant.description',
      atividades: ['timeline.mutant.activity1', 'timeline.mutant.activity2'],
      tecnologias: [
        'Java',
        'Spring Boot',
        'Node.js com TypeScript',
        'NestJS',
        'React',
        'Vue2',
        'Hooks',
        'Redux',
        'Context API',
        'Azure DevOps',
        'Docker',
        'Redis',
        'MongoDB',
      ],
      competencias: ['TDD', 'Stryker', 'Cypress', 'Jest', 'Clean Code'],
    },
  ];

  // State properties
  timelineDefinitions: TimelineDefinition[] = [];
  currentIndex = 0; // For experience carousel
  journeyCurrentIndex = 0; // For journey view carousel
  isJourneyVisible = false;

  constructor(
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private renderer: Renderer2
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

  /** Generates all possible timeline definitions from the experiences array. */
  generateAllMermaidTimelines(): void {
    this.timelineDefinitions = this.experiencias.map((startExp) => {
      const title = this.translate.instant('timeline.mermaid.title', {
        empresa: startExp.empresa,
      });
      let mermaidText = `timeline\n  title ${title}\n`;

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
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i].nativeElement;
      const experienceId = container.dataset.experienceId;
      const timelineDef = this.timelineDefinitions.find(
        (def) => def.id.toString() === experienceId
      );

      if (timelineDef && container) {
        try {
          // Ensure the container is empty before rendering
          container.innerHTML = '';
          const uniqueId = `mermaid-graph-${experienceId}-${new Date().getTime()}`;
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
