/** Education and milestones, oldest first. Every text is a translation key. */
export interface Highlight {
  date: string;
  dateRange?: string;
  description: string;
}

export const HIGHLIGHTS: readonly Highlight[] = [
  { date: 'highlights.unesp.date', dateRange: 'highlights.unesp.range', description: 'highlights.unesp.description' },
  { date: 'highlights.univesp.date', dateRange: 'highlights.univesp.range', description: 'highlights.univesp.description' },
  { date: 'highlights.metro.date', dateRange: 'highlights.metro.range', description: 'highlights.metro.description' },
  { date: 'highlights.gama.date', dateRange: 'highlights.gama.range', description: 'highlights.gama.description' },
  { date: 'highlights.soulcode.date', dateRange: 'highlights.soulcode.range', description: 'highlights.soulcode.description' },
  { date: 'highlights.ifsuldeminas.date', dateRange: 'highlights.ifsuldeminas.range', description: 'highlights.ifsuldeminas.description' },
  { date: 'highlights.ufabc.date', dateRange: 'highlights.ufabc.range', description: 'highlights.ufabc.description' }
];
