import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';
import { provideTranslateService } from '@ngx-translate/core';
import { AboutMeComponent } from './about-me.component';
import { HighlightsComponent } from './components/highlights/highlights.component';

describe('AboutMeComponent', () => {
  let component: AboutMeComponent;
  let fixture: ComponentFixture<AboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeComponent],
      providers: [provideTranslateService(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the Bio, Professional, Highlights and Hobbies sections, in that order', () => {
    const titles = Array.from(fixture.nativeElement.querySelectorAll('mat-panel-title') as NodeListOf<HTMLElement>)
      .map((title) => title.textContent?.trim());

    expect(titles).toEqual(['Bio', 'Professional', 'Highlights', 'Hobbies']);
  });

  it('opens with only the Professional section expanded', () => {
    const panels = Array.from(fixture.nativeElement.querySelectorAll('mat-expansion-panel') as NodeListOf<HTMLElement>);

    expect(panels.map((panel) => panel.classList.contains('mat-expanded'))).toEqual([false, true, false, false]);
  });

  const panel = (index: number) => fixture.debugElement.queryAll(By.directive(MatExpansionPanel))[index].componentInstance as MatExpansionPanel;
  function open(index: number) {
    panel(index).open();
    fixture.detectChanges();
  }

  it('renders a closed section only when it opens', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.bio-margin')).toBeNull();
    expect(host.querySelector('app-highlights')).toBeNull();
    expect(host.querySelector('a[href*="chess.com"]')).toBeNull();
    expect(host.querySelector('app-professional-timeline')).not.toBeNull();

    open(2);

    expect(host.querySelector('app-highlights')).not.toBeNull();
  });

  it('starts the highlights animation when that section opens and stops it when it closes', () => {
    open(2);
    const highlightsPanel = panel(2);
    const highlights = fixture.debugElement.query(By.directive(HighlightsComponent)).componentInstance as HighlightsComponent;
    const start = spyOn(highlights, 'start');
    const stop = spyOn(highlights, 'stop');

    highlightsPanel.afterExpand.emit();
    highlightsPanel.afterCollapse.emit();

    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('links to the chess.com profile in a new tab', () => {
    open(3);
    const link = fixture.nativeElement.querySelector('a[href*="chess.com"]') as HTMLAnchorElement;

    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('keeps the heading levels in order: hobbies are h3 under the page h1', () => {
    open(3);
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelectorAll('h4').length).toBe(0);
    expect(page.querySelectorAll('.hobbies h3').length).toBe(3);
  });
});
