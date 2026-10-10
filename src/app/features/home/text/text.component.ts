import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    // The word disappears at once, and the next one slides in from the left.
    styles: `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      .rotating-word {
        opacity: 0;
        transform: translateX(-100px);
      }
      .rotating-word.shown {
        opacity: 1;
        transform: none;
        transition: opacity 1.5s, transform 1.5s;
      }
      .rotation-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        border: 1px solid var(--color-border);
        border-radius: 50%;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
      }
      .rotation-toggle mat-icon {
        width: 1.1rem;
        height: 1.1rem;
        font-size: 1.1rem;
      }
      @media (prefers-reduced-motion: reduce) {
        .rotating-word.shown {
          transition: none;
        }
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(pointerenter)': 'onPointer($event, true)',
        '(pointerleave)': 'onPointer($event, false)',
        '(focusin)': 'onFocusIn($event)',
        '(focusout)': 'setFocused(false)'
    },
    imports: [MatIcon, TranslateModule]
})
export class TextComponent implements OnInit, OnDestroy {
  words: string[] = ['Full Cycle Development', 'GenAI'];
  readonly animationState = signal('hidden');
  readonly currentIndex = signal(0);

  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Paused with the button; stays paused until pressed again. Visitors who ask for less motion start paused. */
  readonly pinned = signal(this.reducedMotion);
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  private readonly paused = computed(() => this.pinned() || this.hovered() || this.focused());
  /** The word was due to change while paused; it changes as soon as the pause ends. */
  private advanceDue = false;

  private timer?: ReturnType<typeof setTimeout>;
  private frame?: number;

  ngOnInit() {
    if (this.reducedMotion) {
      this.animationState.set('shown');
    }
    this.timer = setTimeout(() => {
      this.advance();
    }, 1000);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }
  }

  togglePause() {
    this.pinned.update((pinned) => !pinned);
    this.resumeIfDue();
  }

  /** Only a real mouse hovers; a touch screen emulates hover on tap, which would never end. */
  onPointer(event: PointerEvent, over: boolean) {
    if (event.pointerType === 'mouse') {
      this.hovered.set(over);
      this.resumeIfDue();
    }
  }

  /** Keyboard focus pauses; the focus a tap gives the button does not, or a second tap could not resume. */
  onFocusIn(event: FocusEvent) {
    this.setFocused((event.target as HTMLElement).matches(':focus-visible'));
  }

  setFocused(focused: boolean) {
    this.focused.set(focused);
    this.resumeIfDue();
  }

  showNextWord() {
    this.animationState.set('hidden');
    this.timer = setTimeout(() => {
      this.currentIndex.set((this.currentIndex() + 1) % this.words.length);
      this.animationState.set('shown');

      this.frame = requestAnimationFrame(() => {
        this.timer = setTimeout(() => {
          this.advance();
        }, 4000);
      });
    }, 100);
  }

  private advance() {
    if (this.paused()) {
      // Paused before the first word slid in: show it, rather than leave the space empty.
      this.animationState.set('shown');
      this.advanceDue = true;
      return;
    }
    this.animationState.set('hidden');
    this.showNextWord();
  }

  private resumeIfDue() {
    if (this.advanceDue && !this.paused()) {
      this.advanceDue = false;
      this.advance();
    }
  }
}
