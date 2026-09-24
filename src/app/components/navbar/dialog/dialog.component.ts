import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class Dialog {
  constructor(
    public translate: TranslateService,
    private bottomSheetRef: MatBottomSheetRef<Dialog>
  ) {}

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
