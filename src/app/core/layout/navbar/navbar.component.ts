import { NavMenuSheetComponent } from './nav-menu-sheet/nav-menu-sheet.component';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
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
    imports: [RouterLinkActive, MatButton, RouterLink, MatMenu, MatMenuItem, MatIconButton, MatTooltip, MatMenuTrigger, MatIcon, TranslateModule]
})
export class NavbarComponent {
  readonly bottomSheet = inject(MatBottomSheet);
  protected readonly translate = inject(TranslateService);

  private lastScrollY = 0;

  readonly navbarFixed = signal(false);
  readonly navbarHidden = signal(false);

  constructor() {
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

  openDialog() {
    this.bottomSheet.open(NavMenuSheetComponent, {
      panelClass: 'mobile-nav-sheet',
      ariaLabel: this.translate.instant('a11y.mobileMenu')
    });
  }
}
