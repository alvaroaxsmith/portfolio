import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutMeComponent } from './about-me.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProfessionalTimelineComponent } from './components/professional-timeline/professional-timeline.component';
import { HighlightsComponent } from './components/highlights/highlights.component';

const routes: Routes = [
  { path: '', component: AboutMeComponent },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ProfessionalTimelineComponent,
        HighlightsComponent,
        AboutMeComponent
    ],
    exports: [
        AboutMeComponent,
    ],
})
export class AboutMeModule { }
