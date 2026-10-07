import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './portfolio.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'src/app/components/skeleton/skeleton.module';

const routes: Routes = [
  { path: '', component: PortfolioComponent },
];

@NgModule({
    imports: [CommonModule, MaterialModule, SkeletonModule, RouterModule.forChild(routes), TranslateModule.forChild(), PortfolioComponent],
})
export class PortfolioModule { }