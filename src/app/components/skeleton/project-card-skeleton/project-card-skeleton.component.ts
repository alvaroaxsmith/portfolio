import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

/**
 * Placeholder com a mesma estrutura do card de projeto da página de portfólio.
 * No layout de lista o card é largo e baixo: textos mais curtos em proporção
 * e uma linha a menos de descrição.
 */
@Component({
    selector: 'app-project-card-skeleton',
    templateUrl: './project-card-skeleton.component.html',
    styleUrls: ['./project-card-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    host: { 'aria-hidden': 'true' }
})
export class ProjectCardSkeletonComponent {
  @Input() layout: 'grid' | 'list' = 'grid';

  @HostBinding('class.is-list') get isList(): boolean {
    return this.layout === 'list';
  }
}
