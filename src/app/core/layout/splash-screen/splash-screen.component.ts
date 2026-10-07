import { Component, OnInit, OnDestroy, HostBinding, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, inject, output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface SplashEngine {
  startedAt: number;
  finish(): Promise<void>;
}

const MIN_DISPLAY_MS = 3000;
const FALLBACK_TEXT = 'Carregando';

@Component({
    selector: 'app-splash-screen',
    templateUrl: './splash-screen.component.html',
    styleUrls: ['./splash-screen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'aria-busy': 'true' }
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  readonly animationFinished = output<void>();

  @HostBinding('class.is-leaving') leaving = false;
  @HostBinding('class.is-done') done = false;

  text = FALLBACK_TEXT;
  letters: string[] = [];

  private exitTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const translated = this.translate.instant('splash.loading');
    this.text = translated && translated !== 'splash.loading' ? translated : FALLBACK_TEXT;
    this.letters = [...this.text];

    const engine = (window as unknown as { __splash?: SplashEngine }).__splash;
    const elapsed = engine ? performance.now() - engine.startedAt : 0;
    this.exitTimer = setTimeout(() => this.exit(engine), Math.max(0, MIN_DISPLAY_MS - elapsed));
  }

  ngOnDestroy(): void {
    clearTimeout(this.exitTimer);
  }

  private exit(engine?: SplashEngine): void {
    this.leaving = true;
    this.cdr.markForCheck();

    const finished = engine ? engine.finish() : Promise.resolve();
    void finished.then(() => this.zone.run(() => {
      this.done = true;
      this.cdr.markForCheck();
      this.animationFinished.emit();
    }));
  }
}
