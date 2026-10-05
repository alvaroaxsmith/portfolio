import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { applySkeletonNoise } from './skeleton-noise';

/**
 * Bloco base de skeleton: superfície neutra com o quadriculado das páginas,
 * cujos quadradinhos mudam de tom aleatoriamente (ver skeleton-noise.ts). Sem conteúdo, puramente decorativo — quem usa
 * deve anunciar o carregamento com um role="status".
 */
@Component({
    selector: 'app-skeleton',
    template: '',
    styleUrls: ['./skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    host: { 'aria-hidden': 'true' }
})
export class SkeletonComponent {
  constructor() {
    // Gera a textura compartilhada no primeiro skeleton criado
    applySkeletonNoise();
  }

  // Sem valor, cada dimensão fica a cargo do CSS (padrão ou classe de quem usa)
  @Input() @HostBinding('style.width') width: string | null = null;
  @Input() @HostBinding('style.height') height: string | null = null;
  @Input() @HostBinding('style.border-radius') radius: string | null = null;
}
