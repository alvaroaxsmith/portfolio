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
    public translate: TranslateService // Manter TranslateService injetado para uso
  ) {
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

  openDialog() {
    this.dialog.open(Dialog).afterClosed().subscribe(() => { });
  }
}
