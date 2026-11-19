import { Component, OnInit, ElementRef, OnDestroy, Renderer2, ChangeDetectionStrategy, Injector, afterNextRender, afterRenderEffect, inject, signal, untracked, viewChildren } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { Mermaid } from 'mermaid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MATCH_MEDIA } from '../../../../core/media/media-query';

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
    TranslatePipe,
    MatTooltipModule
],
    templateUrl: './professional-timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./professional-timeline.component.scss']
})
export class ProfessionalTimelineComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly mermaidJourneyContainers = viewChildren<ElementRef<HTMLElement>>('mermaidJourneyContainer');

  constructor() {
    // Draws the diagram on screen after render: when the journey opens, when the visitor moves to another one, and
    // when a language switch rewrites the text (the containers are tracked by id, so they stay).
    afterRenderEffect(() => {
      this.mermaidJourneyContainers();
      this.timelineDefinitions();
      this.journeyCurrentIndex();
      untracked(() => this.renderVisibleDiagram());
    });

    // On small screens the card contents scroll inside the card; a mouse can drag them too (touch scrolls natively).
    // Runs again when the screen becomes small, not only when the page opens.
    afterRenderEffect(() => {
      const contents = this.cardContents();
      if (this.isMobile()) {
        untracked(() => contents.forEach(({ nativeElement }) => this.setupDragScroll(nativeElement)));
      }
    });

    // The diagram text is written once in the current language; rebuild it when the visitor switches language,
    // and the effect above draws it again.
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.isJourneyVisible()) {
        this.generateAllMermaidTimelines();
      }
    });
  }

  readonly cardContents = viewChildren<ElementRef<HTMLElement>>('cardContent');
  private readonly careerCards = viewChildren('careerCard', { read: ElementRef<HTMLElement> });
  private readonly journeyCards = viewChildren('journeyCard', { read: ElementRef<HTMLElement> });

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

  private readonly mobileQuery = inject(MATCH_MEDIA)('(max-width: 480px)');
  readonly isMobile = signal(this.mobileQuery.matches);

  ngOnInit(): void {
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
    this.keepFocusIn(this.journeyCards, selectedIndex);
  }

  closeJourney(): void {
    this.isJourneyVisible.set(false);
    this.keepFocusIn(this.careerCards, this.currentIndex());
  }

  /**
   * The view being left becomes inert, which would drop focus to the page. When focus was on the timeline, move it
   * to the matching card of the view that opens; without scrolling, so the page stays where the visitor left it.
   */
  private keepFocusIn(cards: () => readonly ElementRef<HTMLElement>[], index: number): void {
    if (!this.host.nativeElement.contains(document.activeElement)) {
      return;
    }
    afterNextRender(() => cards()[index]?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
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

  private mermaid?: Promise<Mermaid>;

  /**
   * Mermaid is large and only draws the journey, so it is downloaded the first time a journey opens, not with the
   * page. A failed download is retried on the next drawing.
   */
  private loadMermaid(): Promise<Mermaid> {
    this.mermaid ??= import('mermaid').then(
      ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'strict',
        });
        return mermaid;
      },
      (error: unknown) => {
        this.mermaid = undefined;
        throw error;
      }
    );
    return this.mermaid;
  }

  /** Counts the drawings started; a drawing stops as soon as a newer one starts (new text, e.g. a language switch). */
  private drawing = 0;
  /** The text each diagram was last drawn from, so a diagram already on screen is not drawn again. */
  private readonly drawn = new Map<number, string>();

  /** Draws only the diagram on screen: the others are drawn when the visitor moves to them. */
  async renderVisibleDiagram(): Promise<void> {
    if (!this.isJourneyVisible()) {
      return;
    }
    const timelineDef = this.timelineDefinitions()[this.journeyCurrentIndex()];
    const container = this.mermaidJourneyContainers()
      .map((ref) => ref.nativeElement)
      .find((element) => element.dataset['experienceId'] === String(timelineDef?.id));
    if (!timelineDef || !container || this.drawn.get(timelineDef.id) === timelineDef.definition) {
      return;
    }

    const run = ++this.drawing;
    try {
      container.innerHTML = '';
      const mermaid = await this.loadMermaid();
      const { svg } = await mermaid.render(`mermaid-graph-${timelineDef.id}-${Date.now()}`, timelineDef.definition);
      if (run !== this.drawing) {
        return;
      }
      container.innerHTML = svg;
      this.drawn.set(timelineDef.id, timelineDef.definition);
    } catch (e) {
      console.error(`Error rendering Mermaid for ID ${timelineDef.id}:`, e);
      container.innerHTML = `<p>${this.translate.instant('timeline.mermaid.error')}</p>`;
    }
  }

  /** Elements that already follow a mouse drag, so a second pass does not stack their listeners. */
  private readonly draggable = new WeakSet<HTMLElement>();

  /**
   * Lets a mouse drag scroll a card's content. Touch is left to the browser: adding the finger's movement on top of
   * its own scrolling made the card jump about twice as far as the finger.
   */
  private setupDragScroll(element: HTMLElement): void {
    if (this.draggable.has(element)) {
      return;
    }
    this.draggable.add(element);
    let isDown = false;
    let startY = 0;
    let scrollTop = 0;

    const start = (e: MouseEvent) => {
      isDown = true;
      this.renderer.addClass(element, 'grabbing');
      startY = e.pageY - element.offsetTop;
      scrollTop = element.scrollTop;
      e.preventDefault();
    };

    const end = () => {
      isDown = false;
      this.renderer.removeClass(element, 'grabbing');
    };

    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const walk = (e.pageY - element.offsetTop - startY) * 2;
      element.scrollTop = scrollTop - walk;
    };

    this.renderer.listen(element, 'mousedown', start);
    this.renderer.listen(element, 'mouseleave', end);
    this.renderer.listen(element, 'mouseup', end);
    this.renderer.listen(element, 'mousemove', move);
  }
}
