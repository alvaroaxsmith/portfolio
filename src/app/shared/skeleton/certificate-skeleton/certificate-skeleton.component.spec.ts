import { TestBed } from '@angular/core/testing';
import { CertificateSkeletonComponent } from './certificate-skeleton.component';

describe('CertificateSkeletonComponent', () => {
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(CertificateSkeletonComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('draws a certificate: title, name, two lines, two signatures and a seal', () => {
    const host = render();
    const count = (selector: string) => host.querySelectorAll(selector).length;

    expect(count('app-skeleton.title')).toBe(1);
    expect(count('app-skeleton.name')).toBe(1);
    expect(count('app-skeleton.line')).toBe(2);
    expect(count('app-skeleton.signature')).toBe(2);
    expect(count('app-skeleton.seal')).toBe(1);
  });

  it('is hidden from assistive technology', () => {
    expect(render().getAttribute('aria-hidden')).toBe('true');
  });
});
