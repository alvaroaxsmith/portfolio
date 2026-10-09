import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nav-menu-sheet',
    templateUrl: './nav-menu-sheet.component.html',
    styleUrls: ['./nav-menu-sheet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconButton, MatIcon, MatButton, RouterLink, TranslateModule]
})
export class NavMenuSheetComponent {
  translate = inject(TranslateService);
  private bottomSheetRef = inject<MatBottomSheetRef<NavMenuSheetComponent>>(MatBottomSheetRef);


  switchLang(lang: string) {
    this.translate.use(lang);
    this.dismiss();
  }

  dismiss() {
    this.bottomSheetRef.dismiss();
  }

  trackByLang(index: number, lang: string): string {
    return lang;
  }
}
