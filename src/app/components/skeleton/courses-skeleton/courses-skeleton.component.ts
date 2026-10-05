import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

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
  @Input() set count(value: number) {
    this.items = Array.from({ length: value }, (_, i) => i);
  }

  items = Array.from({ length: 5 }, (_, i) => i);

  nameWidth(index: number): string {
    return ['78%', '64%', '88%', '70%', '58%'][index % 5];
  }
}
