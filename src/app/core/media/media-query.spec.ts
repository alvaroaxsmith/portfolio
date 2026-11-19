import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fakeMatchMedia } from '../../testing/fake-match-media';
import { MATCH_MEDIA, mediaQuery } from './media-query';

const QUERY = '(max-width: 767px)';

@Component({ template: '' })
class HostComponent {
  readonly phone = mediaQuery(QUERY);
}

describe('mediaQuery', () => {
  function render(media: ReturnType<typeof fakeMatchMedia>) {
    TestBed.configureTestingModule({ providers: [{ provide: MATCH_MEDIA, useValue: media.matchMedia }] });
    return TestBed.createComponent(HostComponent);
  }

  it('starts with what the screen matches now', () => {
    expect(render(fakeMatchMedia({ [QUERY]: true })).componentInstance.phone()).toBeTrue();
  });

  it('follows the screen when it changes', () => {
    const media = fakeMatchMedia();
    const host = render(media).componentInstance;

    media.set(QUERY, true);

    expect(host.phone()).toBeTrue();
  });

  it('stops listening when its owner goes away', () => {
    const media = fakeMatchMedia();
    const fixture = render(media);
    expect(media.listening(QUERY)).toBe(1);

    fixture.destroy();

    expect(media.listening(QUERY)).toBe(0);
  });
});
