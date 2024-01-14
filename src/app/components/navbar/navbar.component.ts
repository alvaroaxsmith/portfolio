import { Dialog } from './dialog/dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public translate: TranslateService
  ) {
    translate.addLangs(['EN', 'PT-BR']);
    translate.setDefaultLang('EN');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

  openDialog() {
    const dialogRef = this.dialog.open(Dialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
