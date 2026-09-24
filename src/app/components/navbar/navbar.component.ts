import { Dialog } from './dialog/dialog.component';
import {
  Component,
  ChangeDetectorRef,
  HostBinding,
  HostListener,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NavbarComponent implements OnInit {
  private lastScrollY = 0;

  @HostBinding('class.navbar-fixed') navbarFixed = false;
  @HostBinding('class.navbar-hidden') navbarHidden = false;

  constructor(
    public bottomSheet: MatBottomSheet,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  switchLang(lang: string) {
    this.translate.use(lang);
  }

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
