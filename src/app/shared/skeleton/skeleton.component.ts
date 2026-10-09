import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { applySkeletonNoise } from './skeleton-noise';

@Component({
    selector: 'app-skeleton',
    template: '',
    styleUrls: ['./skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'aria-hidden': 'true',
        '[style.width]': 'width()',
        '[style.height]': 'height()',
        '[style.border-radius]': 'radius()'
    }
})
export class SkeletonComponent {
  readonly width = input<string | null>(null);
  readonly height = input<string | null>(null);
  readonly radius = input<string | null>(null);

  constructor() {
    applySkeletonNoise();
  }
}
