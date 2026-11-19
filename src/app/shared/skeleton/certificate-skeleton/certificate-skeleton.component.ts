import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../skeleton.component';

/** A certificate while it loads: a landscape sheet with title, name, text lines, signatures and a seal. */
@Component({
  selector: 'app-certificate-skeleton',
  templateUrl: './certificate-skeleton.component.html',
  styleUrl: './certificate-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  imports: [SkeletonComponent]
})
export class CertificateSkeletonComponent {}
