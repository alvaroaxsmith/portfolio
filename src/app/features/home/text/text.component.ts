import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    // The word disappears at once, and the next one slides in from the left, fully visible, inside its own window:
    // the clip keeps it from passing over the text before it. The pause button sits after the word, out of the
    // layout, and shows only on hover, keyboard focus, or while the visitor keeps the word paused.
    styles: `
      :host {
        position: relative;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
      }
      .word-window {
        clip-path: inset(-0.5em -1em -0.5em 0);
      }
      .rotating-word {
        opacity: 0;
        transform: translateX(-100%);
      }
      .rotating-word.shown {
        opacity: 1;
        transform: none;
        transition: transform 1.5s;
      }
      .rotation-toggle {
        position: absolute;
        top: 50%;
        left: calc(100% + 0.4rem);
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
        opacity: 0;
        transform: translateY(-50%);
        transition: opacity 0.2s;
      }
      :host(:hover) .rotation-toggle,
      .rotation-toggle:focus-visible,
      .rotation-toggle[aria-pressed='true'] {
        opacity: 1;
      }
      .rotation-toggle mat-icon {
        width: 1.1rem;
        height: 1.1rem;
        font-size: 1.1rem;
      }
      @media (prefers-reduced-motion: reduce) {
        .rotating-word.shown,
        .rotation-toggle {
          transition: none;
        }
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(pointerenter)': 'onPointer($event, true)',
        '(pointerleave)': 'onPointer($event, false)',
        '(focusin)': 'onFocusIn($event)',
        '(focusout)': 'setFocused(false)',
        // A tap on the word toggles too: on touch screens the button only shows once the word is paused.
        '(click)': 'togglePause()'
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
