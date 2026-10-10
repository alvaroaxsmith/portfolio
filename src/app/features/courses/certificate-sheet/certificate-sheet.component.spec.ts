import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { Course } from '../course.model';
import { CertificateSheetComponent } from './certificate-sheet.component';

const course: Course = {
  field: 'Tecnologia',
  name: 'Java Full Stack',
  link: 'https://drive.google.com/file/d/abc/preview?usp=sharing',
  time: 640,
  school: 'Soul Code',
  date: '2022/05'
};

describe('CertificateSheetComponent', () => {
  let component: CertificateSheetComponent;
  let fixture: ComponentFixture<CertificateSheetComponent>;
  const sheetRef = { dismiss: jasmine.createSpy('dismiss') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), CertificateSheetComponent],
    providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: course },
        { provide: MatBottomSheetRef, useValue: sheetRef }
    ]
}).compileComponents();

    fixture = TestBed.createComponent(CertificateSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** Makes the frame look like it holds `document`, the way the browser exposes it to this page. */
  function frameShows(iframe: HTMLIFrameElement, document: 'blank page' | 'google drive') {
    const location =
      document === 'blank page'
        ? { href: 'about:blank' }
        : {
            get href(): string {
              throw new DOMException('Blocked a frame from accessing a cross-origin frame.', 'SecurityError');
            }
          };
    Object.defineProperty(iframe, 'contentWindow', { configurable: true, value: { location } });
  }

  it('keeps the skeleton until the certificate itself loads', () => {
    expect(component.isFrameLoaded()).toBeFalse();
    expect(fixture.nativeElement.querySelector('app-skeleton')).not.toBeNull();

    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
    frameShows(iframe, 'google drive');
    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(component.isFrameLoaded()).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
  });

  it('ignores the blank page load that some browsers report after the certificate address is set', () => {
    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
    frameShows(iframe, 'blank page');

    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(component.isFrameLoaded()).toBeFalse();
    expect(fixture.nativeElement.querySelector('app-skeleton')).not.toBeNull();
  });

  describe('with a certificate link that is not a Google Drive file', () => {
    function openCertificate(link: string) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), CertificateSheetComponent],
    providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { ...course, link } },
        { provide: MatBottomSheetRef, useValue: sheetRef }
    ]
});
      fixture = TestBed.createComponent(CertificateSheetComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }

    for (const [kind, link] of [
      ['a script', 'javascript:alert(document.cookie)'],
      ['another site', 'https://evil.example/drive.google.com/file/d/abc/preview'],
      ['a look-alike domain', 'https://drive.google.com.evil.example/file/d/abc/preview'],
      ['an insecure address', 'http://drive.google.com/file/d/abc/preview'],
      ['an invalid address', 'not a url']
    ]) {
      it(`does not embed or link ${kind}`, () => {
        openCertificate(link);

        expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
        expect(fixture.nativeElement.querySelector('a[href]')).toBeNull();
      });

      it(`stops loading and says the certificate cannot be shown, for ${kind}`, () => {
        openCertificate(link);

        expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('certificate.unavailable');
      });
    }
  });

  it('opens the full Google Drive viewer in a new tab', () => {
    expect(component.externalUrl()).toBe('https://drive.google.com/file/d/abc/view?usp=sharing');
  });

  it('shows the course name, school and date in the header', () => {
    const header = fixture.nativeElement.querySelector('.sheet-header') as HTMLElement;

    expect(header.querySelector('h2')?.textContent?.trim()).toBe('Java Full Stack');
    expect(header.querySelector('.meta')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Soul Code · 2022/05');
  });

  it('embeds the certificate preview in the frame', () => {
    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');

    expect(iframe.src).toBe(course.link);
    expect(iframe.title).toBe('Java Full Stack');
  });

  it('closes the sheet from the close button', () => {
    sheetRef.dismiss.calls.reset();
    const closeButton = Array.from(fixture.nativeElement.querySelectorAll('.actions button') as NodeListOf<HTMLButtonElement>).pop();

    closeButton?.click();

    expect(sheetRef.dismiss).toHaveBeenCalledTimes(1);
  });

  it('tracks when the certificate is opened in a new tab', () => {
    const track = spyOn(TestBed.inject(AnalyticsService), 'track');

    component.trackOpenNewTab();

    expect(track).toHaveBeenCalledWith('certificate_open_new_tab', { course: 'Java Full Stack' });
  });
});
