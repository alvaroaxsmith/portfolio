// filepath: src/app/pages/about-me/components/highlights/highlights.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.scss']
})
export class HighlightsComponent {
  highlights: Highlight[] = [
    { date: 'August 2018 to', dateRange: 'June 2023', description: 'Univesp Oficial - Bachelor\'s degree, Production Engineering' },
    { date: 'July 2021 to', dateRange: 'October 2021', description: 'Bootcamp at Gama Academy' },
    { date: 'January 2022 to', dateRange: 'June 2022', description: 'Bootcamp at SoulCode Academy' },
    { date: 'February 2023 to', dateRange: 'December 2026', description: 'Universidade São Judas Tadeu - Bachelor\'s degree, Computer Science' },
    { date: 'March 2024 to', dateRange: 'December 2024', description: 'Instituto Federal do Sul de Minas Gerais - Postgraduate, Web Development' },
    { date: 'May 2025 to', dateRange: 'May 2027', description: 'Universidade Federal do ABC (UFABC) - Postgraduate, Information Technologies and Systems' }
  ];
}