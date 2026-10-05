// filepath: src/app/pages/about-me/components/highlights/highlights.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Highlight {
  date: string;
  dateRange?: string;
  description: string;
}

@Component({
    selector: 'app-highlights',
    imports: [
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
],
    templateUrl: './highlights.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./highlights.component.scss']
})
export class HighlightsComponent implements AfterViewInit, OnDestroy {
  highlights: Highlight[] = [
    { date: '2014 to', dateRange: '2018', description: 'UNESP - Energy Engineering (incomplete)' },
    { date: 'August 2018 to', dateRange: 'June 2023', description: 'Univesp Oficial - Bachelor\'s degree, Production Engineering' },
    { date: 'April 2019 to', dateRange: 'April 2021', description: 'Internship at Metro de São Paulo' },
    { date: 'July 2021 to', dateRange: 'October 2021', description: 'Bootcamp at Gama Academy' },
    { date: 'January 2022 to', dateRange: 'June 2022', description: 'Bootcamp at SoulCode Academy' },
    { date: 'March 2024 to', dateRange: 'December 2024', description: 'Instituto Federal do Sul de Minas Gerais - Postgraduate, Web Development' },
    { date: 'May 2025 to', dateRange: 'May 2027', description: 'Universidade Federal do ABC (UFABC) - Postgraduate, Information Technologies and Systems' }
  ];

  @ViewChild('timeline') timelineRef!: ElementRef<HTMLElement>;
  @ViewChildren('timelineItem') itemRefs!: QueryList<ElementRef<HTMLElement>>;

  private frame: number | null = null;
  // Só revela itens com o painel totalmente aberto (ver start/stop)
  private active = false;
  private activateTimer?: ReturnType<typeof setTimeout>;
  private readonly activate = () => {
    this.cancelPendingActivation();
    this.active = true;
    this.scheduleUpdate();
  };
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private intersection?: IntersectionObserver;
  private resize?: ResizeObserver;
  private readonly onScroll = () => this.scheduleUpdate();

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (this.reducedMotion) {
      return;
    }

    // O parallax só mexe em variáveis CSS: roda fora do Angular para não
    // disparar detecção de mudanças a cada frame de rolagem
    this.zone.runOutsideAngular(() => {
      this.timelineRef.nativeElement.classList.add('is-parallax');

      // Só escuta a rolagem enquanto a linha do tempo está na tela (o painel
      // começa fechado, então na maior parte do tempo nada roda)
      this.intersection = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
          window.addEventListener('resize', this.onScroll, { passive: true });
          this.scheduleUpdate();
        } else {
          this.detachScroll();
        }
      });
      this.intersection.observe(this.host.nativeElement);

      this.resize = new ResizeObserver(() => this.scheduleUpdate());
      this.resize.observe(this.host.nativeElement);
    });
  }

  /**
   * Chamado pelo painel ao terminar de abrir. Durante a animação do acordeão
   * (este painel abrindo e outro fechando) as posições mudam a cada frame e os
   * itens ainda estão recortados; revelar nesse momento faria tudo aparecer
   * de uma vez. Leva o topo do painel para o alto da tela, para que os itens
   * abaixo surjam conforme a rolagem, e só então libera a entrada.
   */
  start(): void {
    const panel = this.host.nativeElement.closest('mat-expansion-panel');
    const scrollMargin = panel ? Number.parseFloat(getComputedStyle(panel).scrollMarginTop) || 0 : 0;
    const distance = panel ? Math.abs(panel.getBoundingClientRect().top - scrollMargin) : 0;
    if (!panel || distance < 2) {
      this.activate();
      return;
    }

    // Revelar durante a rolagem suave faria a timeline inteira, passando pela
    // tela, aparecer de uma vez: espera a rolagem acabar (com um limite caso
    // o navegador não emita scrollend ou a rolagem seja interrompida)
    window.addEventListener('scrollend', this.activate, { capture: true });
    this.activateTimer = setTimeout(this.activate, 900);
    panel.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /** Chamado pelo painel ao fechar: a entrada volta ao início. */
  stop(): void {
    this.cancelPendingActivation();
    this.active = false;
    this.reset();
  }

  ngOnDestroy(): void {
    this.cancelPendingActivation();
    this.detachScroll();
    this.intersection?.disconnect();
    this.resize?.disconnect();
  }

  private cancelPendingActivation(): void {
    clearTimeout(this.activateTimer);
    window.removeEventListener('scrollend', this.activate, { capture: true });
  }

  private detachScroll(): void {
    window.removeEventListener('scroll', this.onScroll, { capture: true });
    window.removeEventListener('resize', this.onScroll);
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private scheduleUpdate(): void {
    if (this.frame === null) {
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.update();
      });
    }
  }

  private update(): void {
    const viewport = window.innerHeight;
    const center = viewport / 2;
    const timeline = this.timelineRef.nativeElement;
    const timelineRect = timeline.getBoundingClientRect();
    const items = this.itemRefs.map(ref => ref.nativeElement);

    // Cada item aparece uma única vez, ao entrar na tela. Os que entram no
    // mesmo frame (ex.: ao expandir o painel) aparecem em cascata
    let batch = 0;
    let lastVisible = -1;
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      // -1 (acima do centro) a 1 (abaixo): define o deslocamento do parallax
      const depth = this.clamp((rect.top + rect.height / 2 - center) / center, -1, 1);
      item.style.setProperty('--depth', depth.toFixed(4));

      if (this.active && !item.classList.contains('is-visible') && rect.top < viewport * 0.9) {
        item.style.setProperty('--delay', `${batch++ * 90}ms`);
        item.classList.add('is-visible');
      }
      if (item.classList.contains('is-visible')) {
        lastVisible = index;
      }
    });

    // A linha cinza só vai até o último item exibido, sem trecho vazio abaixo
    const dotOffset = 25;
    let track = 0;
    if (lastVisible === items.length - 1) {
      track = timelineRect.height;
    } else if (lastVisible >= 0) {
      track = items[lastVisible].offsetTop + dotOffset + 10;
    }
    timeline.style.setProperty('--track', `${track}px`);

    // O preenchimento acompanha ~60% da tela, ou vai até o fim quando o fim
    // da linha já está na tela (a página pode acabar antes)
    const fillY = timelineRect.bottom <= viewport * 0.95
      ? track
      : this.clamp(viewport * 0.6 - timelineRect.top, 0, track);
    timeline.style.setProperty('--fill', `${fillY}px`);

    items.forEach(item => {
      item.classList.toggle('is-reached', item.offsetTop + dotOffset <= fillY);
    });
  }

  /** Ao fechar o painel ou sair da tela, a animação de entrada volta ao início. */
  private reset(): void {
    const timeline = this.timelineRef.nativeElement;
    timeline.style.removeProperty('--track');
    timeline.style.removeProperty('--fill');
    this.itemRefs.forEach(({ nativeElement: item }) => {
      item.classList.remove('is-visible', 'is-reached');
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
