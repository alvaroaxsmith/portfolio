import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
  HostBinding,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  // Evento emitido quando a animação de saída termina
  @Output() animationFinished = new EventEmitter<void>();

  // Referência ao container da grade no HTML
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef;

  // Controla a classe 'hide' no elemento host <app-splash-screen>
  @HostBinding('class.hide') isHidden = false;

  // Controla a visibilidade do logo
  showLogo = false;

  // Array para guardar referências aos elementos da grade
  private gridItems: HTMLElement[] = [];
  // Assinatura do intervalo de troca de cores para poder cancelá-lo
  private colorChangeSubscription?: Subscription;
  // Referências para os timeouts para poder limpá-los
  private startTimeout: any;
  private hideTimeout: any;

  // Array para armazenar todos os intervalos ativos para limpeza no destroy
  private activeIntervals: any[] = [];

  constructor(private renderer: Renderer2) {}

  /**
   * Remove a splash screen inicial do index.html
   */
  private removeInitialSplash(): void {
    // Verifica se a função global existe e a chama
    if (typeof (window as any).removeInitialSplash === 'function') {
      (window as any).removeInitialSplash();
    }
  }

  ngOnInit(): void {
    // Remove a splash screen inicial do index.html
    this.removeInitialSplash();

    this.createGrid();

    // Mostra o logo imediatamente sem delay
    this.showLogo = true;

    this.startColorChangeAnimation(); // Inicia a troca de cores
    this.startExitAnimation(); // Agenda a animação de saída

    // Adiciona padrões de iluminação dinâmica imediatamente
    // this.startDynamicLightingPatterns();
  }

  ngOnDestroy(): void {
    // Limpa a assinatura e os timeouts para evitar vazamentos de memória
    if (this.colorChangeSubscription) {
      this.colorChangeSubscription.unsubscribe();
    }
    clearTimeout(this.startTimeout);
    clearTimeout(this.hideTimeout);

    // Limpa todos os intervalos ativos
    this.activeIntervals.forEach((interval) => clearInterval(interval));
    this.activeIntervals = [];

    // Limpa will-change e classes de iluminação para liberar recursos
    this.gridItems.forEach((item) => {
      this.renderer.removeStyle(item, 'will-change');
      this.removeAllLightingClasses(item);
    });
  }

  /**
   * Cria a grade de 200 quadrados dinamicamente.
   */
  private createGrid(): void {
    const totalItems = 200; // 20x10
    const colors = [
      // Tons de cinza muito escuros
      '#0a0a0a',
      '#111111',
      '#181818',
      '#1e1e1e',
      // Tons de cinza escuros
      '#252525',
      '#2c2c2c',
      '#333333',
      '#3a3a3a',
      // Tons de cinza escuro-médios
      '#414141',
      '#484848',
      '#4f4f4f',
      '#565656',
      // Tons de cinza médios
      '#5d5d5d',
      '#646464',
      '#6b6b6b',
      '#727272',
      // Tons de cinza médio-claros
      '#797979',
      '#808080',
      '#878787',
      '#8e8e8e',
      // Tons de cinza claros
      '#959595',
      '#9c9c9c',
      '#a3a3a3',
      '#aaaaaa',
      // Tons de cinza muito claros
      '#b1b1b1',
      '#b8b8b8',
      '#bfbfbf',
      '#c6c6c6',
      // Tons de cinza quase brancos
      '#cdcdcd',
      '#d4d4d4',
      '#dbdbdb',
      '#e2e2e2',
      '#e9e9e9',
      '#f0f0f0',
      '#f7f7f7',
      '#fefefe',
    ];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < totalItems; i++) {
      const gridItem = this.renderer.createElement('div');
      this.renderer.addClass(gridItem, 'grid-item');

      const color = colors[Math.floor(Math.random() * colors.length)];
      this.renderer.setStyle(gridItem, 'background-color', color);

      // Otimizações para melhor performance
      this.renderer.setStyle(
        gridItem,
        'will-change',
        'background-color, box-shadow'
      );

      fragment.appendChild(gridItem);
      this.gridItems.push(gridItem); // Guarda a referência
    }

    // Adiciona todos os elementos de uma vez para evitar múltiplos reflows
    this.gridContainer.nativeElement.appendChild(fragment);

    // Anima a entrada dos itens da grade
    this.animateGridEntrance();
  }
  /**
   * Anima a entrada dos itens da grade imediatamente
   */
  private animateGridEntrance(): void {
    // Todos os itens aparecem imediatamente
    this.gridItems.forEach((item) => {
      this.renderer.addClass(item, 'fade-in');
    });

    // Inicia ondas de iluminação imediatamente
    this.startLightingWaves();
  }

  /**
   * Cria ondas de iluminação suaves que se propagam pelo grid
   */
  private startLightingWaves(): void {
    const createWave = () => {
      // Ponto de origem aleatório
      const originX = Math.floor(Math.random() * 20);
      const originY = Math.floor(Math.random() * 10);

      this.gridItems.forEach((item, index) => {
        const x = index % 20;
        const y = Math.floor(index / 20);
        const distance = Math.sqrt(
          Math.pow(x - originX, 2) + Math.pow(y - originY, 2)
        );

        setTimeout(() => {
          const lightingClasses = [
            'light-top-left',
            'light-top-right',
            'light-bottom-left',
            'light-bottom-right',
            'light-center',
            'light-top',
            'light-bottom',
            'light-left',
            'light-right',
          ];
          const randomClass =
            lightingClasses[Math.floor(Math.random() * lightingClasses.length)];

          // Aplica cor da luz baseada na cor do quadrado
          const currentColor = getComputedStyle(item).backgroundColor;
          const lightColor = this.getLightColorFromBackground(currentColor);
          this.renderer.setStyle(item, '--light-color', lightColor);

          this.renderer.addClass(item, randomClass);
          setTimeout(() => {
            this.renderer.removeClass(item, randomClass);
            this.renderer.removeStyle(item, '--light-color');
          }, 1600 + distance * 60); // Duração dobrada para maior suavidade
        }, distance * 30); // Propagação mais lenta - dobrada
      });
    };

    // Cria ondas menos frequentes (2-4 segundos) - velocidade reduzida pela metade
    const waveInterval = setInterval(() => {
      createWave();
    }, 2000 + Math.random() * 2000);

    // Armazena o intervalo para limpeza posterior
    this.activeIntervals.push(waveInterval);
  }

  /**
   * Cria padrões de iluminação vetorial dinâmica complexos
   */
  // private startDynamicLightingPatterns(): void {
  //   // Padrão em espiral com iluminação diagonal vetorial
  //   const spiralPattern = () => {
  //     const centerX = 10;
  //     const centerY = 5;
  //     const points: Array<{ x: number; y: number; distance: number }> = [];

  //     for (let row = 0; row < 10; row++) {
  //       for (let col = 0; col < 20; col++) {
  //         const distance = Math.sqrt(
  //           Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
  //         );
  //         const angle = Math.atan2(row - centerY, col - centerX);
  //         points.push({ x: col, y: row, distance: distance + angle * 1.5 });
  //       }
  //     }

  //     points.sort((a, b) => a.distance - b.distance);

  //     points.forEach((point, i) => {
  //       setTimeout(() => {
  //         const index = point.y * 20 + point.x;
  //         if (index < this.gridItems.length) {
  //           const item = this.gridItems[index];
  //           // Escolhe direção baseada na posição relativa ao centro
  //           const lightDirection =
  //             point.x < centerX && point.y < centerY
  //               ? 'light-top-left'
  //               : point.x >= centerX && point.y < centerY
  //               ? 'light-top-right'
  //               : point.x < centerX && point.y >= centerY
  //               ? 'light-bottom-left'
  //               : 'light-bottom-right';
  //           this.renderer.addClass(item, lightDirection);
  //           setTimeout(() => {
  //             this.renderer.removeClass(item, lightDirection);
  //           }, 80);
  //         }
  //       }, i * 8);
  //     });
  //   };

  //   // Padrão de explosão com iluminação central irradiante
  //   const explosionPattern = () => {
  //     const centerX = 10;
  //     const centerY = 5;

  //     this.gridItems.forEach((item, index) => {
  //       const x = index % 20;
  //       const y = Math.floor(index / 20);
  //       const distance = Math.sqrt(
  //         Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
  //       );
  //       const delay = distance * 15;

  //       setTimeout(() => {
  //         this.renderer.addClass(item, 'light-center');
  //         setTimeout(() => {
  //           this.renderer.removeClass(item, 'light-center');
  //           // Adiciona iluminação secundária baseada na direção
  //           const secondaryLight = x < centerX ? 'light-left' : 'light-right';
  //           this.renderer.addClass(item, secondaryLight);
  //           setTimeout(() => {
  //             this.renderer.removeClass(item, secondaryLight);
  //           }, 40);
  //         }, 80);
  //       }, delay);
  //     });
  //   };

  //   // Executa os padrões vetoriais em sequência mais espaçada
  //   const executePatterns = () => {
  //     const patterns = [spiralPattern, explosionPattern];
  //     let currentPattern = 0;

  //     const runNextPattern = () => {
  //       patterns[currentPattern]();
  //       currentPattern = (currentPattern + 1) % patterns.length;

  //       // Próximo padrão em 6-10 segundos (velocidade reduzida pela metade)
  //       setTimeout(runNextPattern, 6000 + Math.random() * 4000);
  //     };

  //     runNextPattern();
  //   };

  //   executePatterns();
  // }

  /**
   * Inicia um intervalo que troca a cor de quadrados aleatórios.
   */
  private startColorChangeAnimation(): void {
    // A cada 240ms, troca a cor de 3 a 6 quadrados para movimento mais suave
    this.colorChangeSubscription = interval(240)
      .pipe(
        // O intervalo para quando a animação de saída é emitida
        takeUntil(this.animationFinished)
      )
      .subscribe(() => {
        const squaresToChange = Math.floor(Math.random() * 4) + 3; // de 3 a 6

        // Usa requestAnimationFrame para sincronizar com o refresh rate
        requestAnimationFrame(() => {
          for (let i = 0; i < squaresToChange; i++) {
            const randomIndex = Math.floor(
              Math.random() * this.gridItems.length
            );
            const item = this.gridItems[randomIndex];
            const newColor = this.getRandomColor();

            // Remove classes anteriores de iluminação
            this.removeAllLightingClasses(item);

            // Adiciona nova cor
            this.renderer.setStyle(item, 'background-color', newColor);

            // Adiciona efeito de iluminação suave
            this.addRandomLightingEffect(item);
          }
        });
      });
  }

  /**
   * Remove todas as classes de iluminação de um item
   */
  private removeAllLightingClasses(item: HTMLElement): void {
    const lightingClasses = [
      'light-top-left',
      'light-top-right',
      'light-bottom-left',
      'light-bottom-right',
      'light-center',
      'light-top',
      'light-bottom',
      'light-left',
      'light-right',
    ];

    lightingClasses.forEach((className) => {
      this.renderer.removeClass(item, className);
    });
  }

  /**
   * Adiciona um efeito de iluminação vetorial suave e colorido
   */
  private addRandomLightingEffect(item: HTMLElement): void {
    const lightingEffects = [
      'light-top-left',
      'light-top-right',
      'light-bottom-left',
      'light-bottom-right',
      'light-center',
      'light-top',
      'light-bottom',
      'light-left',
      'light-right',
    ];

    // Aplica apenas um efeito por vez para suavidade
    const randomEffect =
      lightingEffects[Math.floor(Math.random() * lightingEffects.length)];

    // Obtém a cor atual do quadrado para criar luz compatível
    const currentColor = getComputedStyle(item).backgroundColor;
    const lightColor = this.getLightColorFromBackground(currentColor);

    // Aplica a cor da luz dinamicamente
    this.renderer.setStyle(item, '--light-color', lightColor);

    // Timing mais suave e consistente - velocidade reduzida pela metade
    const duration = 1200 + Math.random() * 800; // 1200-2000ms para suavidade

    this.renderer.addClass(item, randomEffect);
    setTimeout(() => {
      this.renderer.removeClass(item, randomEffect);
      this.renderer.removeStyle(item, '--light-color');
    }, duration);
  }

  /**
   * Gera uma cor de luz idêntica à cor de fundo do quadrado para efeitos triangulares
   */
  private getLightColorFromBackground(backgroundColor: string): string {
    // Converte rgb para valores individuais se necessário
    let r = 128,
      g = 128,
      b = 128; // valores padrão

    if (backgroundColor.includes('rgb')) {
      const matches = backgroundColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      }
    } else if (backgroundColor.includes('#')) {
      // Converte hex para rgb
      const hex = backgroundColor.replace('#', '');
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }

    // Retorna a mesma cor com opacidade para criar o efeito triangular vetorial
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  /**
   * Agenda e executa a animação de saída sem transições de tela preta.
   */
  private startExitAnimation(): void {
    // Define um tempo total para a splash screen antes de sair
    const totalDisplayTime = 3000; // 3 segundos no total

    // 1. Agenda o desaparecimento do logo
    this.startTimeout = setTimeout(() => {
      this.showLogo = false;
    }, 1800);

    // 2. Agenda o fim do componente sem animação de grade
    this.hideTimeout = setTimeout(() => {
      // Remove imediatamente sem animação de cascata
      this.isHidden = true; // Aplica a classe 'hide' ao host

      // Emite o evento imediatamente
      this.animationFinished.emit();
    }, totalDisplayTime);
  }

  /**
   * Retorna uma cor aleatória da paleta de tons de cinza.
   */
  private getRandomColor(): string {
    const colors = [
      // Tons de preto e cinza muito escuro
      '#000000',
      '#080808',
      '#101010',
      '#171717',
      // Tons de cinza escuros variados
      '#1f1f1f',
      '#262626',
      '#2e2e2e',
      '#353535',
      // Tons de cinza escuro-médios variados
      '#3d3d3d',
      '#444444',
      '#4c4c4c',
      '#535353',
      // Tons de cinza médios variados
      '#5b5b5b',
      '#626262',
      '#6a6a6a',
      '#717171',
      // Tons de cinza médio-claros variados
      '#797979',
      '#818181',
      '#888888',
      '#909090',
      // Tons de cinza claros variados
      '#979797',
      '#9f9f9f',
      '#a6a6a6',
      '#aeaeae',
      // Tons de cinza muito claros variados
      '#b5b5b5',
      '#bdbdbd',
      '#c4c4c4',
      '#cccccc',
      // Tons de cinza quase brancos variados
      '#d3d3d3',
      '#dbdbdb',
      '#e2e2e2',
      '#eaeaea',
      '#f1f1f1',
      '#f9f9f9',
      '#ffffff',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
