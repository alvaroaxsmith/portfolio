import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './portfolio.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FilterNoDescriptionPipe } from './pipes/filter-no-description.pipe';

const routes: Routes = [
  { path: '', component: PortfolioComponent },
];

@NgModule({
  declarations: [
    PortfolioComponent,
    FilterNoDescriptionPipe
  ],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild()],
})
export class PortfolioModule { }