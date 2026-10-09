import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

@Component({
  imports: [SkeletonComponent],
  template: `
    <app-skeleton id="sized" width="70%" height="1rem" radius="999px" />
    <app-skeleton id="default" />
  `
})
class HostComponent {}

describe('SkeletonComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  }

  it('takes the size and corner radius it is given', () => {
    const skeleton = render()('sized');

    expect(skeleton.style.width).toBe('70%');
    expect(skeleton.style.height).toBe('1rem');
    expect(skeleton.style.borderRadius).toBe('999px');
  });

  it('leaves the size to the stylesheet when none is given', () => {
    const skeleton = render()('default');

    expect(skeleton.getAttribute('style') ?? '').toBe('');
  });

  it('is hidden from assistive technology', () => {
    expect(render()('default').getAttribute('aria-hidden')).toBe('true');
  });

  it('makes the shared shimmer texture available to the page', () => {
    render();

    expect(document.documentElement.style.getPropertyValue('--skeleton-noise')).toContain('data:image/svg+xml');
  });
});
