import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Placeholder da lista de cursos: linhas da tabela no desktop ou cards no
 * mobile, espelhando os dois layouts da página de cursos.
 */
@Component({
    selector: 'app-courses-skeleton',
    templateUrl: './courses-skeleton.component.html',
    styleUrls: ['./courses-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    host: { 'aria-hidden': 'true', '[class.cards]': "layout === 'cards'" }
})
export class CoursesSkeletonComponent {
  @Input() layout: 'table' | 'cards' = 'table';
  // Mesmo tamanho de página padrão do paginator de cursos
  @Input() set count(value: number) {
    this.items = Array.from({ length: value }, (_, i) => i);
  }

  items = Array.from({ length: 5 }, (_, i) => i);

  // Varia as larguras entre linhas para não parecer um bloco repetido
  nameWidth(index: number): string {
    return ['78%', '64%', '88%', '70%', '58%'][index % 5];
  }
}
