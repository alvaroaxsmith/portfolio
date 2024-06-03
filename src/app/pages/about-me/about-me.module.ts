import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutMeComponent } from './about-me.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SkillChipComponent } from './components/chips/skill-chip.component';
const routes: Routes = [
  { path: '', component: AboutMeComponent },
];

@NgModule({
  declarations: [AboutMeComponent, SkillChipComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes), TranslateModule.forChild()],
  exports: [
    AboutMeComponent,
  ],
})
export class AboutMeModule { }
