import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), RouterModule.forRoot([]), NavbarComponent]
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

  it('opens the mobile menu as a bottom sheet', () => {
    const open = spyOn(component.bottomSheet, 'open');

    fixture.nativeElement.querySelector('.menu-button').click();

    expect(open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({ panelClass: 'mobile-nav-sheet' }));
  });
});
