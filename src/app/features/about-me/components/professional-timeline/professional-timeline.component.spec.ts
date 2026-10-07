import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import mermaid from 'mermaid';
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

  it('moves the journey when an experience icon is clicked inside it', () => {
    render(false);
    component.selecionarExperiencia(component.experiencias[0]);

    component.handleIconClickInJourneyView(component.experiencias[4]);

    expect(component.journeyCurrentIndex).toBe(4);
    expect(component.currentIndex).toBe(0);
  });

  it('opens the journey with Space too, and ignores other keys', () => {
    render(false);
    const action = jasmine.createSpy('action');

    component.handleActionKey(new KeyboardEvent('keydown', { key: 'Tab' }), action);
    expect(action).not.toHaveBeenCalled();

    component.handleActionKey(new KeyboardEvent('keydown', { key: ' ' }), action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('writes each journey as a Mermaid timeline with period, role and company', () => {
    render(false);

    component.generateAllMermaidTimelines();

    const last = component.experiencias[component.experiencias.length - 1];
    const fromLast = component.timelineDefinitions[component.timelineDefinitions.length - 1].definition;
    expect(fromLast.startsWith('timeline')).toBeTrue();
    expect(fromLast).toContain(`${last.periodo} : ${last.cargo} @ ${last.empresa}`);
  });

  describe('when the screen changes size', () => {
    type Listener = (event: { matches: boolean }) => void;
    let listeners: Set<Listener>;
    const notifyChange = (event: { matches: boolean }) => listeners.forEach((listener) => listener(event));

    beforeEach(() => {
      listeners = new Set();
      const realMatchMedia = window.matchMedia.bind(window);
      spyOn(window, 'matchMedia').and.callFake((query: string) => {
        if (query !== '(max-width: 480px)') {
          return realMatchMedia(query);
        }
        const phoneQuery = realMatchMedia(query);
        spyOnProperty(phoneQuery, 'matches', 'get').and.returnValue(false);
        spyOn(phoneQuery, 'addEventListener').and.callFake(((_type: string, listener: Listener) => {
          listeners.add(listener);
        }) as MediaQueryList['addEventListener']);
        spyOn(phoneQuery, 'removeEventListener').and.callFake(((_type: string, listener: Listener) => {
          listeners.delete(listener);
        }) as MediaQueryList['removeEventListener']);
        return phoneQuery;
      });
    });

    it('stops reacting to screen size changes once removed from the page', () => {
      render(false);

      fixture.destroy();
      notifyChange({ matches: true });

      expect(component.isMobile).toBeFalse();
    });

    it('closes the journey when the screen becomes a phone', () => {
      render(false);
      component.selecionarExperiencia(component.experiencias[0]);

      notifyChange({ matches: true });

      expect(component.isMobile).toBeTrue();
      expect(component.isJourneyVisible).toBeFalse();
    });

    it('keeps the journey open when the screen grows back to desktop', () => {
      render(false);
      component.selecionarExperiencia(component.experiencias[0]);

      notifyChange({ matches: false });

      expect(component.isMobile).toBeFalse();
      expect(component.isJourneyVisible).toBeTrue();
    });
  });

  describe('on narrow screens', () => {
    beforeEach(() => spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400));

    const content = () => fixture.nativeElement.querySelector('mat-card-content') as HTMLElement;
    const mouse = (type: string, pageY: number) => new MouseEvent(type, { bubbles: true, cancelable: true, clientY: pageY });

    it('lets the card content be dragged to scroll', () => {
      render(true);
      const el = content();
      el.style.height = '50px';
      el.style.overflow = 'auto';
      el.scrollTop = 40;

      el.dispatchEvent(mouse('mousedown', 100));
      expect(el.classList).toContain('grabbing');

      el.dispatchEvent(mouse('mousemove', 90));
      expect(el.scrollTop).toBe(60);

      el.dispatchEvent(mouse('mouseup', 90));
      expect(el.classList).not.toContain('grabbing');
    });

    it('ignores mouse moves when nothing is being dragged', () => {
      render(true);
      const el = content();
      el.style.height = '50px';
      el.style.overflow = 'auto';
      el.scrollTop = 40;

      el.dispatchEvent(mouse('mousemove', 10));

      expect(el.scrollTop).toBe(40);
    });
  });

  describe('rendering the journey diagrams', () => {
    function renderJourney() {
      TestBed.configureTestingModule({
        imports: [ProfessionalTimelineComponent, TranslateModule.forRoot(), NoopAnimationsModule]
      });
      fixture = TestBed.createComponent(ProfessionalTimelineComponent);
      component = fixture.componentInstance;
      component.isMobile = false;
      fixture.detectChanges();
    }

    const diagram = (id: number) =>
      fixture.nativeElement.querySelector(`[data-experience-id="${id}"]`) as HTMLElement;

    it('renders diagrams in strict mode, so diagram text can never run scripts', () => {
      const initialize = spyOn(mermaid, 'initialize');

      renderJourney();

      expect(initialize).toHaveBeenCalledWith(jasmine.objectContaining({ securityLevel: 'strict' }));
    });

    it('does nothing while the journey is closed', async () => {
      renderJourney();
      const render = spyOn(mermaid, 'render');

      await component.renderAllMermaidDiagrams();

      expect(render).not.toHaveBeenCalled();
    });

    it('draws one diagram per experience as soon as the journey opens', async () => {
      renderJourney();
      const render = spyOn(mermaid, 'render').and.callFake(async (id: string) =>
        ({ svg: `<svg data-test="${id}"></svg>` }) as Awaited<ReturnType<typeof mermaid.render>>
      );

      component.selecionarExperiencia(component.experiencias[0]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(render).toHaveBeenCalledTimes(component.experiencias.length);
      expect(diagram(1).querySelector('svg')).not.toBeNull();
    });

    it('shows an error message in place of a diagram that fails to draw', async () => {
      renderJourney();
      spyOn(console, 'error');
      spyOn(mermaid, 'render').and.rejectWith(new Error('parse error'));

      component.selecionarExperiencia(component.experiencias[0]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(diagram(1).querySelector('p')?.textContent).toBe('timeline.mermaid.error');
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
