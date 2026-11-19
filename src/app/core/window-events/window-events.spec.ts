import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onWindowEvent } from './window-events';

@Component({ template: '' })
class ListenerComponent {
  calls = 0;

  constructor() {
    onWindowEvent('resize', () => {
      this.calls++;
    });
  }
}

describe('onWindowEvent', () => {
  it('runs the update on every event, through a passive listener that never blocks scrolling', () => {
    const added = spyOn(window, 'addEventListener').and.callThrough();
    const fixture = TestBed.createComponent(ListenerComponent);

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));

    expect(fixture.componentInstance.calls).toBe(2);
    expect(added).toHaveBeenCalledWith('resize', jasmine.any(Function), { passive: true });
  });

  it('stops listening when its owner is destroyed', () => {
    const fixture = TestBed.createComponent(ListenerComponent);
    fixture.destroy();

    window.dispatchEvent(new Event('resize'));

    expect(fixture.componentInstance.calls).toBe(0);
  });
});
