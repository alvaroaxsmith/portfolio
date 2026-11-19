import { Component, ChangeDetectionStrategy, Injector, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PAGE_RELOAD } from '../../chunk-load/chunk-load-recovery.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { onWindowEvent } from '../../window-events/window-events';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.navbar-fixed]': 'navbarFixed()',
        '[class.navbar-hidden]': 'navbarHidden()'
    },
    imports: [RouterLinkActive, MatButton, RouterLink, MatMenu, MatMenuItem, MatIconButton, MatTooltip, MatMenuTrigger, MatIcon, TranslatePipe]
})
export class NavbarComponent {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly reload = inject(PAGE_RELOAD);
  protected readonly translate = inject(TranslateService);

  private lastScrollY = 0;

  readonly navbarFixed = signal(false);
  readonly navbarHidden = signal(false);

  constructor() {
    // On phones the menu button is the way around the site. Its sheet is downloaded once the page is idle, so a tap
    // opens it at once, exactly as if it were part of the page (and focus lands as it always did).
    afterNextRender(() => {
      if (window.matchMedia('(max-width: 767px)').matches) {
        const whenIdle = window.requestIdleCallback ?? ((callback: () => void) => setTimeout(callback, 200));
        whenIdle(() => void this.menu().catch(() => undefined));
      }
    });
    onWindowEvent('scroll', () => this.onWindowScroll());
  }

  /** Returns whether the navbar changed; most scroll events change nothing and stay outside Angular. */
  private onWindowScroll(): boolean {
    const wasFixed = this.navbarFixed();
    const wasHidden = this.navbarHidden();
    const scrollY = window.scrollY;
    const isScrollingDown = scrollY > this.lastScrollY;
    const isBeyondThreshold = scrollY > window.innerHeight * 0.2;

    this.navbarFixed.set(scrollY > 0);

    if (isScrollingDown && isBeyondThreshold) {
      this.navbarHidden.set(true);
    } else if (!isScrollingDown) {
      this.navbarHidden.set(false);
    }

    this.lastScrollY = scrollY;
    return this.navbarFixed() !== wasFixed || this.navbarHidden() !== wasHidden;
  }

  /** The bottom sheet and the menu inside it only exist on phones, on demand, so they are downloaded on the first tap. */
  async openDialog(): Promise<void> {
    let menu: Awaited<ReturnType<NavbarComponent['loadMenu']>>;
    try {
      menu = await this.menu();
    } catch (error) {
      // Typically a tab left open across a deploy: its files are gone. A reload brings the current ones.
      console.error('Could not load the mobile menu.', error);
      this.reload(this.router.url);
      return;
    }
    const [{ MatBottomSheet }, { NavMenuSheetComponent }] = menu;
    this.injector.get(MatBottomSheet).open(NavMenuSheetComponent, {
      panelClass: 'mobile-nav-sheet',
      ariaLabel: this.translate.instant('a11y.mobileMenu')
    });
  }

  protected loadMenu() {
    return Promise.all([import('@angular/material/bottom-sheet'), import('./nav-menu-sheet/nav-menu-sheet.component')]);
  }

  private pendingMenu?: ReturnType<NavbarComponent['loadMenu']>;

  /** The sheet's download, shared by the idle preload and the tap; a failed one is tried again next time. */
  private menu(): ReturnType<NavbarComponent['loadMenu']> {
    this.pendingMenu ??= this.loadMenu().catch((error: unknown) => {
      this.pendingMenu = undefined;
      throw error;
    });
    return this.pendingMenu;
  }
}
