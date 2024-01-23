import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './portfolio.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: PortfolioComponent },
];

@NgModule({
  declarations: [PortfolioComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild()],
})
export class PortfolioModule { }