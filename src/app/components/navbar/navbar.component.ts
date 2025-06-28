import { Dialog } from './dialog/dialog.component';
import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private lastScrollY = 0;

  @HostBinding('class.navbar-fixed') navbarFixed = false;
  @HostBinding('class.navbar-hidden') navbarHidden = false;

  constructor(
    public dialog: MatDialog,
    public translate: TranslateService // Manter TranslateService injetado para uso
  ) {}

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {}

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
    this.dialog
      .open(Dialog)
      .afterClosed()
      .subscribe(() => {});
  }
}
