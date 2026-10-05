import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** API exposta pelo motor da splash no index.html. */
interface SplashEngine {
  startedAt: number;
  finish(): Promise<void>;
}

// Tempo mínimo de exibição, contado desde o primeiro quadro da grade
// (index.html), antes da saída
const MIN_DISPLAY_MS = 3000;
const FALLBACK_TEXT = 'Carregando';

/**
 * Texto e saída da splash. A grade é desenhada pelo canvas do index.html desde
 * antes do JavaScript do app; este componente adota essa grade: põe por cima o
 * "Carregando…" traduzido e, passado o tempo mínimo, dispara a saída.
 * As traduções já estão carregadas aqui (APP_INITIALIZER no AppModule).
 */
@Component({
    selector: 'app-splash-screen',
    templateUrl: './splash-screen.component.html',
    styleUrls: ['./splash-screen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    host: { 'aria-busy': 'true' }
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  // Emitido quando a saída termina e o fundo do site está à mostra
  @Output() animationFinished = new EventEmitter<void>();

  @HostBinding('class.is-leaving') leaving = false;
  @HostBinding('class.is-done') done = false;

  text = FALLBACK_TEXT;
  letters: string[] = [];

  private exitTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone
  ) {}

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
    // O texto some junto com o início da dissolução dos quadrados
    this.leaving = true;
    this.cdr.markForCheck();

    const finished = engine ? engine.finish() : Promise.resolve();
    // A Promise do motor nasce antes do zone.js (index.html): volta para a
    // zona do Angular para a detecção de mudanças enxergar o fim
    void finished.then(() => this.zone.run(() => {
      this.done = true;
      this.cdr.markForCheck();
      this.animationFinished.emit();
    }));
  }
}
