import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton.component';

@Component({
    selector: 'app-courses-skeleton',
    templateUrl: './courses-skeleton.component.html',
    styleUrls: ['./courses-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'aria-hidden': 'true', '[class.cards]': "layout() === 'cards'" },
    imports: [SkeletonComponent]
})
export class CoursesSkeletonComponent {
  readonly layout = input<'table' | 'cards'>('table');
  readonly count = input(5);
  readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  nameWidth(index: number): string {
    return ['78%', '64%', '88%', '70%', '58%'][index % 5];
  }
}
