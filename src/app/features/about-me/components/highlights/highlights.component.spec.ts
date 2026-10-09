import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeIntersectionObserver } from '../../../../testing/fake-intersection-observer';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightsComponent } from './highlights.component';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('HighlightsComponent', () => {
  let component: HighlightsComponent;
  let fixture: ComponentFixture<HighlightsComponent>;

  const items = () => Array.from(fixture.nativeElement.querySelectorAll('.timeline-item') as NodeListOf<HTMLElement>);
  const timeline = () => fixture.nativeElement.querySelector('.timeline') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('parallax while scrolling', () => {
    let viewport: ReturnType<typeof fakeIntersectionObserver>;

    beforeEach(() => {
      fixture.destroy();
      viewport = fakeIntersectionObserver();
      fixture = TestBed.createComponent(HighlightsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('follows the page scroll only while the timeline is on screen', () => {
      const added = spyOn(window, 'addEventListener').and.callThrough();
      const removed = spyOn(window, 'removeEventListener').and.callThrough();

      viewport.report(true);
      expect(added).toHaveBeenCalledWith('scroll', jasmine.any(Function), jasmine.objectContaining({ capture: true }));

      viewport.report(false);
      expect(removed).toHaveBeenCalledWith('scroll', jasmine.any(Function), jasmine.objectContaining({ capture: true }));
    });
  });

  it('lists every highlight in chronological order', () => {
    const titles = items().map((item) => item.querySelector('p')?.textContent?.trim());

    expect(items().length).toBe(component.highlights.length);
    expect(titles[0]).toBe(component.highlights[0].description);
    expect(titles[titles.length - 1]).toBe(component.highlights[component.highlights.length - 1].description);
  });

  it('shows the end of the date range next to the start', () => {
    const firstHeading = items()[0].querySelector('h4')?.textContent?.replace(/\s+/g, ' ').trim();

    expect(firstHeading).toBe('2014 to 2018');
  });

  it('keeps the items hidden until the section is opened', () => {
    expect(items().some((item) => item.classList.contains('is-visible'))).toBeFalse();
  });

  it('reveals the items in view and draws the track when started outside an expansion panel', async () => {
    component.start();
    await nextFrame();

    expect(items()[0].classList).toContain('is-visible');
    expect(timeline().style.getPropertyValue('--track')).not.toBe('');
  });

  it('hides everything again and clears the track when stopped', async () => {
    component.start();
    await nextFrame();

    component.stop();

    expect(items().some((item) => item.classList.contains('is-visible') || item.classList.contains('is-reached'))).toBeFalse();
    expect(timeline().style.getPropertyValue('--track')).toBe('');
    expect(timeline().style.getPropertyValue('--fill')).toBe('');
  });

  it('stops listening to scroll when destroyed', () => {
    const removed = spyOn(window, 'removeEventListener').and.callThrough();

    fixture.destroy();

    expect(removed).toHaveBeenCalledWith('scroll', jasmine.any(Function), jasmine.objectContaining({ capture: true }));
  });
});
