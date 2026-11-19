import { TestBed } from '@angular/core/testing';
import { PhotoSkeletonComponent } from './photo-skeleton.component';

describe('PhotoSkeletonComponent', () => {
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(PhotoSkeletonComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('draws the photo card: the name tag and a portrait', () => {
    const host = render();

    expect(host.querySelectorAll('app-skeleton.chip').length).toBe(1);
    expect(host.querySelectorAll('app-skeleton.head').length).toBe(1);
    expect(host.querySelectorAll('app-skeleton.shoulders').length).toBe(1);
  });

  it('is hidden from assistive technology', () => {
    expect(render().getAttribute('aria-hidden')).toBe('true');
  });
});
