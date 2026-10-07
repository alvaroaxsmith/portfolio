import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ProfessionalTimelineComponent } from './professional-timeline.component';

describe('ProfessionalTimelineComponent', () => {
  let fixture: ComponentFixture<ProfessionalTimelineComponent>;
  let component: ProfessionalTimelineComponent;

  function render(mobile: boolean) {
    TestBed.configureTestingModule({
      imports: [ProfessionalTimelineComponent, TranslateModule.forRoot(), NoopAnimationsModule]
    });
    fixture = TestBed.createComponent(ProfessionalTimelineComponent);
    component = fixture.componentInstance;
    component.isMobile = mobile;
    spyOn(component, 'renderAllMermaidDiagrams').and.resolveTo();
    fixture.detectChanges();
  }

  const firstCard = () => fixture.nativeElement.querySelector('mat-card.timeline-content') as HTMLElement;

  it('starts on the first experience, with the carousel visible', () => {
    render(false);

    expect(component.currentIndex).toBe(0);
    expect(component.isJourneyVisible).toBeFalse();
  });

  it('moves the carousel when a number of the timeline is chosen', () => {
    render(false);

    component.goTo(3);

    expect(component.currentIndex).toBe(3);
  });

  describe('on desktop and tablet', () => {
    it('clicking an experience card opens the journey from that experience', () => {
      render(false);

      component.selecionarExperiencia(component.experiencias[2]);

      expect(component.isJourneyVisible).toBeTrue();
      expect(component.currentIndex).toBe(2);
      expect(component.journeyCurrentIndex).toBe(2);
      expect(component.timelineDefinitions.length).toBe(component.experiencias.length);
    });

    it('cards are focusable and show a pointer', () => {
      render(false);

      expect(firstCard().getAttribute('tabindex')).toBe('0');
      expect(firstCard().classList).toContain('is-interactive');
    });

    it('opens the journey with Enter or Space for keyboard users', () => {
      render(false);

      firstCard().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(component.isJourneyVisible).toBeTrue();
    });

    it('clicking the journey goes back to the cards', () => {
      render(false);
      component.selecionarExperiencia(component.experiencias[0]);

      component.voltarParaTimeline();

      expect(component.isJourneyVisible).toBeFalse();
    });
  });

  describe('on phones', () => {
    it('clicking an experience card does nothing', () => {
      render(true);

      firstCard().click();

      expect(component.isJourneyVisible).toBeFalse();
    });

    it('cards are read-only: not focusable and without pointer', () => {
      render(true);

      expect(firstCard().hasAttribute('tabindex')).toBeFalse();
      expect(firstCard().classList).not.toContain('is-interactive');
    });
  });

  it('builds each journey from the chosen experience to the most recent one', () => {
    render(false);

    component.generateAllMermaidTimelines();

    const fromSecond = component.timelineDefinitions[1].definition;
    expect(fromSecond).not.toContain(component.experiencias[0].empresa);
    expect(fromSecond).toContain(component.experiencias[component.experiencias.length - 1].empresa);
  });
});
