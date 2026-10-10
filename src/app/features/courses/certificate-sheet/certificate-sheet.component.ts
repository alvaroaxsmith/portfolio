import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Course } from '../course.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-certificate-sheet',
    templateUrl: './certificate-sheet.component.html',
    styleUrls: ['./certificate-sheet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconButton, MatIcon, SkeletonComponent, TranslateModule]
})
export class CertificateSheetComponent implements OnInit {
  readonly rowData = signal(inject<Course>(MAT_BOTTOM_SHEET_DATA));
  private bottomSheetRef = inject<MatBottomSheetRef<CertificateSheetComponent>>(MatBottomSheetRef);
  private domSanitizer = inject(DomSanitizer);
  private analytics = inject(AnalyticsService);

  readonly safeUrl = signal<SafeResourceUrl | null>(null);
  readonly externalUrl = signal<string | null>(null);
  readonly isFrameLoaded = signal(false);
  /** The link is not a certificate the site can embed, so there is nothing to wait for. */
  readonly unavailable = signal(false);

  trackOpenNewTab(): void {
    this.analytics.track('certificate_open_new_tab', { course: this.rowData().name });
  }

  ngOnInit(): void {
    this.loadCourseData();
  }

  loadCourseData(): void {
    this.setUrls(this.rowData().link);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onFrameLoad(event: Event): void {
    if (showsBlankPage(event.target as HTMLIFrameElement)) {
      return;
    }
    this.isFrameLoaded.set(true);
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  private setUrls(link: string): void {
    if (!isCertificateUrl(link)) {
      this.unavailable.set(true);
      return;
    }
    this.safeUrl.set(this.getSafeUrl(link));
    this.externalUrl.set(link.replace('/preview', '/view'));
  }
}

const CERTIFICATE_HOST = 'drive.google.com';

/** Links come from an external API and bypass Angular's sanitizer, so only Google Drive over HTTPS is trusted. */
function isCertificateUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname === CERTIFICATE_HOST;
  } catch {
    return false;
  }
}

/**
 * Browsers report a load for the iframe's initial blank page, sometimes only after the certificate address is set.
 * Once the certificate is in, the frame is cross-origin and reading its location throws.
 */
function showsBlankPage(iframe: HTMLIFrameElement): boolean {
  try {
    return iframe.contentWindow?.location.href === 'about:blank';
  } catch {
    return false;
  }
}
