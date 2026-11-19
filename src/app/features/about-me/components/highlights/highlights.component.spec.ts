import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeIntersectionObserver } from '../../../../testing/fake-intersection-observer';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import EN from '../../../../../assets/i18n/EN.json';
import { HighlightsComponent } from './highlights.component';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('HighlightsComponent', () => {
  let component: HighlightsComponent;
  let fixture: ComponentFixture<HighlightsComponent>;

  const items = () => Array.from(fixture.nativeElement.querySelectorAll('.timeline-item') as NodeListOf<HTMLElement>);
  const timeline = () => fixture.nativeElement.querySelector('.timeline') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightsComponent],
      providers: [provideTranslateService()]
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
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('EN', EN);
    translate.use('EN');
    fixture.detectChanges();
    const firstHeading = items()[0].querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim();

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

  it('reads every position before writing any style, so a scroll frame lays the page out only once', async () => {
    const log: string[] = [];
    // Only this component's DOM work counts: other views may render in the same task and are not under test.
    const host = fixture.nativeElement as HTMLElement;
    const mine = (el: Element | null) => !!el && (el === host || host.contains(el));
    const elements = () => [host, ...Array.from(host.querySelectorAll<HTMLElement>('*'))];
    const styles = new Set(elements().map((el) => el.style));
    const classLists = new Set(elements().map((el) => el.classList));
    const reading = <T>(el: Element, read: () => T) => {
      if (mine(el)) {
        log.push('read');
      }
      return read();
    };
    const writing = (target: object, set: Set<object>) => {
      if (set.has(target)) {
        log.push('write');
      }
    };
    const offsetTop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop')!.get!;
    const rect = Element.prototype.getBoundingClientRect;
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    const add = DOMTokenList.prototype.add;
    const toggle = DOMTokenList.prototype.toggle;
    spyOnProperty(HTMLElement.prototype, 'offsetTop', 'get').and.callFake(function (this: HTMLElement) {
      return reading(this, () => offsetTop.call(this));
    });
    spyOn(Element.prototype, 'getBoundingClientRect').and.callFake(function (this: Element) {
      return reading(this, () => rect.call(this));
    });
    spyOn(CSSStyleDeclaration.prototype, 'setProperty').and.callFake(function (this: CSSStyleDeclaration, ...args: Parameters<CSSStyleDeclaration['setProperty']>) {
      writing(this, styles);
      return setProperty.apply(this, args);
    });
    spyOn(DOMTokenList.prototype, 'add').and.callFake(function (this: DOMTokenList, ...tokens: string[]) {
      writing(this, classLists);
      return add.apply(this, tokens);
    });
    spyOn(DOMTokenList.prototype, 'toggle').and.callFake(function (this: DOMTokenList, ...args: Parameters<DOMTokenList['toggle']>) {
      writing(this, classLists);
      return toggle.apply(this, args);
    });

    component.start();
    await nextFrame();

    expect(log).toContain('write');
    expect(log.lastIndexOf('read')).withContext(log.join(' ')).toBeLessThan(log.indexOf('write'));
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

  it('titles each highlight with an h3, under the page h1', () => {
    expect(fixture.nativeElement.querySelectorAll('.timeline-content h4').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.timeline-content h3').length).toBe(items().length);
  });
});
