import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TextComponent } from './text/text.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { SkeletonModule } from 'src/app/components/skeleton/skeleton.module';

const routes: Routes = [
  { path: '', component: HomeComponent },
];

@NgModule({
    imports: [CommonModule, MaterialModule, SkeletonModule, RouterModule.forChild(routes), TranslateModule.forChild(), HomeComponent, TextComponent, FooterComponent,],
    exports: [
        HomeComponent,
    ],
})
export class HomeModule { }