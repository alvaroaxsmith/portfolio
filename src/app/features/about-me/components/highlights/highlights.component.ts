import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, inject, viewChild, viewChildren } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { HIGHLIGHTS } from '../../data/highlights';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MATCH_MEDIA, REDUCED_MOTION } from '../../../../core/media/media-query';


@Component({
    selector: 'app-highlights',
    imports: [TranslatePipe],
    templateUrl: './highlights.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./highlights.component.scss']
})
export class HighlightsComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly highlights = HIGHLIGHTS;

  readonly timelineRef = viewChild.required<ElementRef<HTMLElement>>('timeline');
  readonly itemRefs = viewChildren<ElementRef<HTMLElement>>('timelineItem');

  private frame: number | null = null;
  private active = false;
  private activateTimer?: ReturnType<typeof setTimeout>;
  private readonly activate = () => {
    this.cancelPendingActivation();
    this.active = true;
    this.scheduleUpdate();
  };
  /** Read once when the component starts, so no listener is needed. */
  private readonly reducedMotion = inject(MATCH_MEDIA)(REDUCED_MOTION).matches;
  private intersection?: IntersectionObserver;
  private resize?: ResizeObserver;
  private readonly onScroll = () => this.scheduleUpdate();

  constructor() {
    // Rendered only once its section opens, it follows that section itself: the animation runs while it is open.
    const panel = inject(MatExpansionPanel, { optional: true });
    panel?.afterExpand.pipe(takeUntilDestroyed()).subscribe(() => this.start());
    panel?.afterCollapse.pipe(takeUntilDestroyed()).subscribe(() => this.stop());
  }

  ngAfterViewInit(): void {
    if (this.reducedMotion) {
      return;
    }

    // Plain DOM work, outside any rendering: the listeners and observers change no signal.
    this.timelineRef().nativeElement.classList.add('is-parallax');

    this.intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
        window.addEventListener('resize', this.onScroll, { passive: true });
        this.scheduleUpdate();
      } else {
        this.detachScroll();
      }
    });
    this.intersection.observe(this.host.nativeElement);

    this.resize = new ResizeObserver(() => this.scheduleUpdate());
    this.resize.observe(this.host.nativeElement);
  }

  start(): void {
    const panel = this.host.nativeElement.closest('mat-expansion-panel');
    const scrollMargin = panel ? Number.parseFloat(getComputedStyle(panel).scrollMarginTop) || 0 : 0;
    const distance = panel ? Math.abs(panel.getBoundingClientRect().top - scrollMargin) : 0;
    if (!panel || distance < 2) {
      this.activate();
      return;
    }

    window.addEventListener('scrollend', this.activate, { capture: true });
    this.activateTimer = setTimeout(this.activate, 900);
    panel.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  stop(): void {
    this.cancelPendingActivation();
    this.active = false;
    this.reset();
  }

  ngOnDestroy(): void {
    this.cancelPendingActivation();
    this.detachScroll();
    this.intersection?.disconnect();
    this.resize?.disconnect();
  }

  private cancelPendingActivation(): void {
    clearTimeout(this.activateTimer);
    window.removeEventListener('scrollend', this.activate, { capture: true });
  }

  private detachScroll(): void {
    window.removeEventListener('scroll', this.onScroll, { capture: true });
    window.removeEventListener('resize', this.onScroll);
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private scheduleUpdate(): void {
    if (this.frame === null) {
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.update();
      });
    }
  }

  /**
   * Runs once per scroll frame. Every position is read first, then every style is written: reading after a write
   * would make the browser lay the page out again for each item.
   */
  private update(): void {
    const viewport = window.innerHeight;
    const center = viewport / 2;
    const timeline = this.timelineRef().nativeElement;

    const timelineRect = timeline.getBoundingClientRect();
    const items = this.itemRefs().map(({ nativeElement: item }) => ({
      item,
      rect: item.getBoundingClientRect(),
      offsetTop: item.offsetTop,
      visible: item.classList.contains('is-visible')
    }));

    let batch = 0;
    let lastVisible = -1;
    const revealed: { item: HTMLElement; delay: number }[] = [];
    const depths = items.map(({ item, rect, visible }, index) => {
      if (this.active && !visible && rect.top < viewport * 0.9) {
        revealed.push({ item, delay: batch++ * 90 });
        visible = true;
      }
      if (visible) {
        lastVisible = index;
      }
      return this.clamp((rect.top + rect.height / 2 - center) / center, -1, 1);
    });

    const dotOffset = 25;
    let track = 0;
    if (lastVisible === items.length - 1) {
      track = timelineRect.height;
    } else if (lastVisible >= 0) {
      track = items[lastVisible].offsetTop + dotOffset + 10;
    }
    const fillY = timelineRect.bottom <= viewport * 0.95
      ? track
      : this.clamp(viewport * 0.6 - timelineRect.top, 0, track);

    items.forEach(({ item }, index) => item.style.setProperty('--depth', depths[index].toFixed(4)));
    revealed.forEach(({ item, delay }) => {
      item.style.setProperty('--delay', `${delay}ms`);
      item.classList.add('is-visible');
    });
    timeline.style.setProperty('--track', `${track}px`);
    timeline.style.setProperty('--fill', `${fillY}px`);
    items.forEach(({ item, offsetTop }) => item.classList.toggle('is-reached', offsetTop + dotOffset <= fillY));
  }

  private reset(): void {
    const timeline = this.timelineRef().nativeElement;
    timeline.style.removeProperty('--track');
    timeline.style.removeProperty('--fill');
    this.itemRefs().forEach(({ nativeElement: item }) => {
      item.classList.remove('is-visible', 'is-reached');
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
