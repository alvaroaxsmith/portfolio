import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { applySkeletonNoise } from './skeleton-noise';

@Component({
    selector: 'app-skeleton',
    template: '',
    styleUrls: ['./skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'aria-hidden': 'true' }
})
export class SkeletonComponent {
  constructor() {
    applySkeletonNoise();
  }

  @Input() @HostBinding('style.width') width: string | null = null;
  @Input() @HostBinding('style.height') height: string | null = null;
  @Input() @HostBinding('style.border-radius') radius: string | null = null;
}
