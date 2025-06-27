import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutMeComponent } from './about-me.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SkillChipComponent } from './components/chips/skill-chip.component';
import { ProfessionalTimelineComponent } from './components/professional-timeline/professional-timeline.component';
import { HighlightsComponent } from './components/highlights/highlights.component'; // Importe o novo componente

const routes: Routes = [
  { path: '', component: AboutMeComponent },
];

@NgModule({
  declarations: [AboutMeComponent, SkillChipComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    ProfessionalTimelineComponent,
    HighlightsComponent // Adicione o componente standalone aos imports
  ],
  exports: [
    AboutMeComponent,
  ],
})
export class AboutMeModule { }
