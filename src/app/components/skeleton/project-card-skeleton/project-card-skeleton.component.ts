import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

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
