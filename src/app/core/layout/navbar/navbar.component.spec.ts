import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { PAGE_RELOAD } from '../../chunk-load/chunk-load-recovery.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  const reload = jasmine.createSpy('reload');
  beforeEach(() => reload.calls.reset());

  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([{ path: '**', children: [] }]), NavbarComponent],
    providers: [provideTranslateService(), { provide: PAGE_RELOAD, useValue: reload }]
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

  /** The bottom sheet and the menu are downloaded on demand, so the sheet opens a few tasks after the click. */
  const downloaded = async (open: jasmine.Spy) => {
    for (let i = 0; i < 20 && !open.calls.count(); i++) {
      await new Promise((resolve) => setTimeout(resolve));
    }
  };

  describe('on a phone', () => {
    interface WithLoader { loadMenu: () => Promise<unknown> }
    async function idle() {
      for (let i = 0; i < 50; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    it('downloads the menu ahead of the tap, so the tap opens it at once', async () => {
      spyOn(window, 'matchMedia').and.callFake((query: string) => ({ matches: query.includes('767px') }) as MediaQueryList);
      const load = spyOn(NavbarComponent.prototype as unknown as WithLoader, 'loadMenu').and.returnValue(new Promise(() => undefined));
      TestBed.createComponent(NavbarComponent).detectChanges();
      TestBed.tick();

      await idle();

      expect(load).toHaveBeenCalled();
    });

    it('opens the menu from the download started ahead, without a second one', async () => {
      spyOn(window, 'matchMedia').and.callFake((query: string) => ({ matches: query.includes('767px') }) as MediaQueryList);
      const sheet = { MatBottomSheet: MatBottomSheet };
      const load = spyOn(NavbarComponent.prototype as unknown as WithLoader, 'loadMenu').and.resolveTo([sheet, { NavMenuSheetComponent: class {} }]);
      const open = spyOn(TestBed.inject(MatBottomSheet), 'open');
      const phone = TestBed.createComponent(NavbarComponent);
      phone.detectChanges();
      TestBed.tick();
      await idle();
      const downloads = load.calls.count();
      expect(downloads).toBeGreaterThan(0);

      await phone.componentInstance.openDialog();

      expect(load.calls.count()).withContext('the tap reuses the download').toBe(downloads);
      expect(open).toHaveBeenCalledTimes(1);
    });
  });

  it('reloads the page when the menu cannot be downloaded, e.g. a tab left open across a deploy', async () => {
    spyOn(component as unknown as { loadMenu: () => Promise<unknown> }, 'loadMenu').and.rejectWith(
      new TypeError('Failed to fetch dynamically imported module')
    );
    spyOn(console, 'error');

    await component.openDialog();

    expect(reload).toHaveBeenCalledOnceWith(TestBed.inject(Router).url);
  });

  it('opens the mobile menu as a bottom sheet', async () => {
    const open = spyOn(TestBed.inject(MatBottomSheet), 'open');

    fixture.nativeElement.querySelector('.menu-button').click();
    await downloaded(open);

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

    it('opens the mobile menu with a translated name', async () => {
      const open = spyOn(TestBed.inject(MatBottomSheet), 'open');

      await component.openDialog();

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
