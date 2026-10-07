import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelActionRow } from '@angular/material/expansion';
import { ProfessionalTimelineComponent } from './components/professional-timeline/professional-timeline.component';
import { HighlightsComponent } from './components/highlights/highlights.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-about-me',
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelActionRow, ProfessionalTimelineComponent, HighlightsComponent, TranslateModule]
})
export class AboutMeComponent {}
