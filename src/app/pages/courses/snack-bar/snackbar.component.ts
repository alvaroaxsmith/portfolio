import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'snack-bar',
  template: `
    <div>
      <p>{{ getCourseCertificateMessage() }}</p>
      <button mat-button class="custom-button" (click)="dismissSnackBar()">X</button>
    </div>
  `,
  styleUrls: ['./snack-bar.css'],
})
export class SnackBarComponent {
  constructor(private _snackBar: MatSnackBar, private translate: TranslateService) { }

  getCourseCertificateMessage(): string {
    return this.translate.instant('courseCertificateMessage');
  }

  openSnackBar() {
    const snackBarRef = this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['custom-snackbar'],
    });

    // Adicione um ouvinte de evento para fechar o Snackbar quando o botão for clicado
    snackBarRef.onAction().subscribe(() => {
      this.dismissSnackBar();
    });
  }

  dismissSnackBar() {
    // Feche o Snackbar manualmente
    this._snackBar.dismiss();
  }
}
