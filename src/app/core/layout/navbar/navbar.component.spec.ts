import { NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([{ path: '**', children: [] }]), NavbarComponent],
    providers: [provideTranslateService()]
}).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to every page of the site', () => {
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>)
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(jasmine.arrayContaining(['/', '/about-me', '/courses', '/portfolio', '/contact']));
  });

  describe('while scrolling', () => {
    let scrollY: number;

    const scrollTo = (y: number) => {
      scrollY = y;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;

    beforeEach(() => {
      scrollY = 0;
      spyOnProperty(window, 'scrollY', 'get').and.callFake(() => scrollY);
    });

    it('listens outside Angular and only enters it when the navbar changes, so scrolling does not re-render the app', () => {
      const run = spyOn(TestBed.inject(NgZone), 'run').and.callThrough();
      // Only the scroll events, without rendering in between, so every call to run comes from the listener.
      const scrollOnly = (y: number) => {
        scrollY = y;
        window.dispatchEvent(new Event('scroll'));
      };

      scrollOnly(0);
      expect(run).not.toHaveBeenCalled();

      scrollOnly(10);
      expect(run).toHaveBeenCalled();

      run.calls.reset();
      scrollOnly(20);
      expect(run).not.toHaveBeenCalled();
    });

    it('stays transparent at the top of the page', () => {
      scrollTo(0);

      expect(host().classList).not.toContain('navbar-fixed');
      expect(host().classList).not.toContain('navbar-hidden');
    });

    it('becomes fixed as soon as the page scrolls', () => {
      scrollTo(10);

      expect(host().classList).toContain('navbar-fixed');
      expect(host().classList).not.toContain('navbar-hidden');
    });

    it('hides when scrolling down past a fifth of the screen', () => {
      scrollTo(window.innerHeight * 0.2 + 50);

      expect(host().classList).toContain('navbar-hidden');
    });

    it('stays visible when scrolling down only a little', () => {
      scrollTo(window.innerHeight * 0.1);

      expect(host().classList).not.toContain('navbar-hidden');
    });

    it('comes back as soon as the user scrolls up', () => {
      scrollTo(window.innerHeight);
      scrollTo(window.innerHeight - 20);

      expect(host().classList).not.toContain('navbar-hidden');
      expect(host().classList).toContain('navbar-fixed');
    });
  });

  it('opens the mobile menu as a bottom sheet', () => {
    const open = spyOn(component.bottomSheet, 'open');

    fixture.nativeElement.querySelector('.menu-button').click();

    expect(open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({ panelClass: 'mobile-nav-sheet' }));
  });

  describe('accessible names and state', () => {
    it('names the navigation and the mobile menu button in the visitor\'s language', () => {
      const page = fixture.nativeElement as HTMLElement;

      expect(page.querySelector('nav')?.getAttribute('aria-label')).toBe('a11y.mainNavigation');
      const menu = page.querySelector('.menu-button') as HTMLElement;
      expect(menu.getAttribute('aria-label')).toBe('a11y.openMenu');
      expect(menu.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('marks the link of the current page', async () => {
      await TestBed.inject(Router).navigateByUrl('/courses');
      fixture.detectChanges();

      const current = Array.from(fixture.nativeElement.querySelectorAll('nav a[aria-current="page"]') as NodeListOf<HTMLAnchorElement>);
      expect(current.map((a) => a.getAttribute('href'))).toEqual(['/courses']);
    });

    it('opens the mobile menu with a translated name', () => {
      const open = spyOn(component.bottomSheet, 'open');

      component.openDialog();

      expect(open.calls.mostRecent().args[1]?.ariaLabel).toBe('a11y.mobileMenu');
    });

    it('shows which language is in use in the language menu', async () => {
      const translate = TestBed.inject(TranslateService);
      translate.addLangs(['EN', 'PT-BR']);
      translate.use('EN');
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.language-form') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const items = Array.from(document.querySelectorAll('.mat-mdc-menu-panel [role="menuitemradio"]')) as HTMLElement[];
      expect(items.map((item) => [item.textContent?.trim(), item.getAttribute('aria-checked')])).toEqual([
        ['EN', 'true'],
        ['PT-BR', 'false']
      ]);
    });
  });
});
