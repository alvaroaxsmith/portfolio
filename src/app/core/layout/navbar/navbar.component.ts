import { Dialog } from './dialog/dialog.component';
import { Component, ChangeDetectorRef, HostBinding, HostListener, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, MatButton, RouterLink, MatMenu, MatMenuItem, MatIconButton, MatTooltip, MatMenuTrigger, MatIcon, TranslateModule]
})
export class NavbarComponent implements OnInit {
  bottomSheet = inject(MatBottomSheet);
  translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  private lastScrollY = 0;

  @HostBinding('class.navbar-fixed') navbarFixed = false;
  @HostBinding('class.navbar-hidden') navbarHidden = false;

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY;
    const isScrollingDown = scrollY > this.lastScrollY;
    const isBeyondThreshold = scrollY > window.innerHeight * 0.2;

    this.navbarFixed = scrollY > 0;

    if (isScrollingDown && isBeyondThreshold) {
      this.navbarHidden = true;
    } else if (!isScrollingDown) {
      this.navbarHidden = false;
    }

    this.lastScrollY = scrollY;
  }

  openDialog() {
    this.bottomSheet.open(Dialog, {
      panelClass: 'mobile-nav-sheet',
      ariaLabel: 'Menu de navegação'
    });
  }
}
