import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { AboutMeComponent } from './about-me.component';
import { AboutMeModule } from './about-me.module';
import { HighlightsComponent } from './components/highlights/highlights.component';

describe('AboutMeComponent', () => {
  let component: AboutMeComponent;
  let fixture: ComponentFixture<AboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideRouter([])]
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

  it('starts the highlights animation when that section opens and stops it when it closes', () => {
    const highlightsPanel = fixture.debugElement.queryAll(By.directive(MatExpansionPanel))[2].componentInstance as MatExpansionPanel;
    const highlights = fixture.debugElement.query(By.directive(HighlightsComponent)).componentInstance as HighlightsComponent;
    const start = spyOn(highlights, 'start');
    const stop = spyOn(highlights, 'stop');

    highlightsPanel.afterExpand.emit();
    highlightsPanel.afterCollapse.emit();

    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('links to the chess.com profile in a new tab', () => {
    const link = fixture.nativeElement.querySelector('a[href*="chess.com"]') as HTMLAnchorElement;

    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });
});
