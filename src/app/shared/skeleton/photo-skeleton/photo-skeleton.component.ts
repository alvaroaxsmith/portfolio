import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../skeleton.component';

/** The home photo while it loads: the photo card with its name tag and a portrait, in placeholder grey. */
@Component({
  selector: 'app-photo-skeleton',
  templateUrl: './photo-skeleton.component.html',
  styleUrl: './photo-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  imports: [SkeletonComponent]
})
export class PhotoSkeletonComponent {}
