import { Component, ChangeDetectionStrategy, HostBinding, HostListener, OnDestroy, AfterViewInit, ElementRef, signal, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export const COURSE_HINT_DURATION_MS = 5000;
const LEAVE_ANIMATION_MS = 280;

@Component({
    selector: 'snack-bar',
    imports: [MatButtonModule, MatIconModule, TranslateModule],
    template: `
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
  private readonly snackBarRef = inject<MatSnackBarRef<SnackBarComponent>>(MatSnackBarRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly ready = signal(false);
  private readonly leaving = signal(false);
  private readonly paused = signal(false);
  private fallbackTimer?: ReturnType<typeof setTimeout>;
  private readyFrame?: number;
  private readyDeadline = 0;

  @HostBinding('class.is-ready') get isReady(): boolean {
    return this.ready();
  }

  @HostBinding('class.is-leaving') get isLeaving(): boolean {
    return this.leaving();
  }

  @HostBinding('class.is-paused') get isPaused(): boolean {
    return this.paused();
  }

  ngAfterViewInit(): void {
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
