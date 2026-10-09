import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton.component';

@Component({
    selector: 'app-project-card-skeleton',
    templateUrl: './project-card-skeleton.component.html',
    styleUrls: ['./project-card-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'aria-hidden': 'true', '[class.is-list]': "layout() === 'list'" },
    imports: [SkeletonComponent]
})
export class ProjectCardSkeletonComponent {
  readonly layout = input<'grid' | 'list'>('grid');
}
