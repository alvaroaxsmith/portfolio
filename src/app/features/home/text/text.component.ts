import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    // The word disappears at once, and the next one slides in from the left.
    styles: `
      .rotating-word {
        opacity: 0;
        transform: translateX(-100px);
      }
      .rotating-word.shown {
        opacity: 1;
        transform: none;
        transition: opacity 1.5s, transform 1.5s;
      }
      @media (prefers-reduced-motion: reduce) {
        .rotating-word.shown {
          transition: none;
        }
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule]
})
export class TextComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);

  words: string[] = ['Full Cycle Development', 'GenAI'];
  readonly animationState = signal('hidden');
  readonly currentIndex = signal(0);
  private timer?: ReturnType<typeof setTimeout>;
  private frame?: number;

  ngOnInit() {
    this.timer = setTimeout(() => {
      this.showNextWord();
    }, 1000);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }
  }

  showNextWord() {
    this.animationState.set('hidden');
    this.timer = setTimeout(() => {
      this.currentIndex.set((this.currentIndex() + 1) % this.words.length);
      this.animationState.set('shown');

      this.frame = requestAnimationFrame(() => {
        this.timer = setTimeout(() => {
          this.animationState.set('hidden');
          this.showNextWord();
        }, 4000);
      });
    }, 100);
  }

}
