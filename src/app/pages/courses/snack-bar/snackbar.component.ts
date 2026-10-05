import { Component, ChangeDetectionStrategy, HostBinding, HostListener, OnDestroy, AfterViewInit, ElementRef, signal } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

// Tempo de exibição, em sincronia com a volta do ponteiro (--hint-duration no SCSS)
export const COURSE_HINT_DURATION_MS = 5000;
const LEAVE_ANIMATION_MS = 280;

/**
 * Notificação no canto superior direito com a dica da página de cursos.
 * O tempo de exibição é a própria animação do relógio: quando o ponteiro
 * completa a volta (animationend), a notificação sai. Assim, passar o mouse
 * ou focar a notificação pausa o relógio e o fechamento juntos.
 */
@Component({
    selector: 'snack-bar',
    imports: [MatButtonModule, MatIconModule, TranslateModule],
    template: `
    <!-- Sem role="status": o container do Material já é a região aria-live -->
    <div class="hint">
      <svg class="timer" viewBox="0 0 32 32" aria-hidden="true">
        <circle class="timer-track" cx="16" cy="16" r="13" />
        <circle class="timer-progress" cx="16" cy="16" r="13" pathLength="100" />
        <line class="timer-hand" x1="16" y1="16" x2="16" y2="6.5" (animationend)="onTimerEnd()" />
        <circle class="timer-pin" cx="16" cy="16" r="2" />
      </svg>

      <div class="hint-text">
        <span class="hint-label">{{ 'courseHint.label' | translate }}</span>
        <p>{{ 'courseCertificateMessage' | translate }}</p>
      </div>

      <button mat-icon-button type="button" class="hint-close" (click)="dismiss()"
        [attr.aria-label]="'courseHint.close' | translate">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
    styleUrls: ['./snack-bar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackBarComponent implements AfterViewInit, OnDestroy {
  private readonly ready = signal(false);
  private readonly leaving = signal(false);
  private readonly paused = signal(false);
  private fallbackTimer?: ReturnType<typeof setTimeout>;
  private readyFrame?: number;
  private readyDeadline = 0;

  // As animações (entrada e relógio) só começam depois que o Material move o
  // conteúdo para a região aria-live (~150ms após abrir). Mover um elemento
  // reinicia as animações CSS: começando antes, tudo tocaria duas vezes
  @HostBinding('class.is-ready') get isReady(): boolean {
    return this.ready();
  }

  @HostBinding('class.is-leaving') get isLeaving(): boolean {
    return this.leaving();
  }

  @HostBinding('class.is-paused') get isPaused(): boolean {
    return this.paused();
  }

  constructor(
    private readonly snackBarRef: MatSnackBarRef<SnackBarComponent>,
    private readonly host: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    // Limite caso o Material deixe de mover o conteúdo em alguma versão
    this.readyDeadline = performance.now() + 500;
    const check = () => {
      if (this.host.nativeElement.closest('[aria-live]') || performance.now() > this.readyDeadline) {
        this.start();
      } else {
        this.readyFrame = requestAnimationFrame(check);
      }
    };
    check();
  }

  private start(): void {
    this.ready.set(true);
    // Com movimento reduzido as animações são zeradas no styles.scss e o
    // animationend chegaria na hora: o tempo passa a ser contado por timer
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.fallbackTimer = setTimeout(() => this.dismiss(), COURSE_HINT_DURATION_MS);
    }
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  pause(): void {
    this.paused.set(true);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  resume(): void {
    this.paused.set(false);
  }

  onTimerEnd(): void {
    if (!this.fallbackTimer) {
      this.dismiss();
    }
  }

  dismiss(): void {
    if (this.leaving()) {
      return;
    }
    this.leaving.set(true);
    setTimeout(() => this.snackBarRef.dismiss(), LEAVE_ANIMATION_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.fallbackTimer);
    if (this.readyFrame) {
      cancelAnimationFrame(this.readyFrame);
    }
  }
}
