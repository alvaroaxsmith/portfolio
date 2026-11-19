import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SplashScreenComponent } from './core/layout/splash-screen/splash-screen.component';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { ConsentBannerComponent } from './core/layout/consent-banner/consent-banner.component';

/**
 * The shell: the splash, then the skip link, the navbar, the page and the consent banner. What happens on every
 * navigation (SEO, page views, focus, the document language) is provided in app.config.
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SplashScreenComponent, NavbarComponent, RouterOutlet, ConsentBannerComponent, TranslatePipe]
})
export class AppComponent {
  private readonly document = inject<Document>(DOCUMENT);

  readonly showMainContent = signal(false);

  onSplashAnimationFinished() {
    this.showMainContent.set(true);
  }

  /**
   * With <base href="/">, following "#main-content" would load "/#main-content" (the home page) from any other
   * route, so the skip link moves focus itself.
   */
  skipToContent(event: Event) {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }
}
