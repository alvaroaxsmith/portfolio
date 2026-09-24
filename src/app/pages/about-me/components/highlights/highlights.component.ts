// filepath: src/app/pages/about-me/components/highlights/highlights.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Highlight {
  date: string;
  dateRange?: string;
  description: string;
}

@Component({
    selector: 'app-highlights',
    imports: [
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
],
    templateUrl: './highlights.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./highlights.component.scss']
})
export class HighlightsComponent {
  highlights: Highlight[] = [
    { date: '2014 to', dateRange: '2018', description: 'UNESP - Energy Engineering (incomplete)' },
    { date: 'August 2018 to', dateRange: 'June 2023', description: 'Univesp Oficial - Bachelor\'s degree, Production Engineering' },
    { date: 'April 2019 to', dateRange: 'April 2021', description: 'Internship at Metro de São Paulo' },
    { date: 'July 2021 to', dateRange: 'October 2021', description: 'Bootcamp at Gama Academy' },
    { date: 'January 2022 to', dateRange: 'June 2022', description: 'Bootcamp at SoulCode Academy' },
    { date: 'March 2024 to', dateRange: 'December 2024', description: 'Instituto Federal do Sul de Minas Gerais - Postgraduate, Web Development' },
    { date: 'May 2025 to', dateRange: 'May 2027', description: 'Universidade Federal do ABC (UFABC) - Postgraduate, Information Technologies and Systems' }
  ];
}