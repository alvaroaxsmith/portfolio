import { Component, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onWindowEvent } from './window-events';

@Component({ template: '' })
class ListenerComponent {
  changed = false;
  readonly calls: boolean[] = [];

  constructor() {
    onWindowEvent('resize', () => {
      this.calls.push(NgZone.isInAngularZone());
      return this.changed;
    });
  }
}

describe('onWindowEvent', () => {
  it('runs the update outside Angular and enters Angular only when it reports a change', () => {
    const fixture = TestBed.createComponent(ListenerComponent);
    const run = spyOn(TestBed.inject(NgZone), 'run').and.callThrough();

    window.dispatchEvent(new Event('resize'));
    expect(fixture.componentInstance.calls).toEqual([false]);
    expect(run).not.toHaveBeenCalled();

    fixture.componentInstance.changed = true;
    window.dispatchEvent(new Event('resize'));
    // Entering Angular lets it render; it may also schedule its own tick through the zone.
    expect(run).toHaveBeenCalled();
  });

  it('stops listening when its owner is destroyed', () => {
    const fixture = TestBed.createComponent(ListenerComponent);
    fixture.destroy();

    window.dispatchEvent(new Event('resize'));

    expect(fixture.componentInstance.calls).toEqual([]);
  });
});
