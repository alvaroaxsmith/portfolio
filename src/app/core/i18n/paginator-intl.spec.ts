import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { providePaginatorIntl } from './paginator-intl';

describe('translated paginator texts', () => {
  let intl: MatPaginatorIntl;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideTranslateService(), providePaginatorIntl()]
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('EN', {
      paginator: { itemsPerPage: 'Items per page:', nextPage: 'Next page', previousPage: 'Previous page', firstPage: 'First page', lastPage: 'Last page', of: 'of' }
    });
    translate.setTranslation('PT-BR', {
      paginator: { itemsPerPage: 'Itens por página:', nextPage: 'Próxima página', previousPage: 'Página anterior', firstPage: 'Primeira página', lastPage: 'Última página', of: 'de' }
    });
    translate.use('EN');
    intl = TestBed.inject(MatPaginatorIntl);
  });

  it('keeps the English texts Material shows by default', () => {
    expect(intl.itemsPerPageLabel).toBe('Items per page:');
    expect(intl.nextPageLabel).toBe('Next page');
    expect(intl.getRangeLabel(0, 5, 23)).toBe(new MatPaginatorIntl().getRangeLabel(0, 5, 23));
  });

  it('switches every text, and tells the paginator to redraw, when the language changes', () => {
    const redraw = jasmine.createSpy('changes');
    intl.changes.subscribe(redraw);

    translate.use('PT-BR');

    expect([intl.itemsPerPageLabel, intl.previousPageLabel, intl.firstPageLabel, intl.lastPageLabel]).toEqual([
      'Itens por página:',
      'Página anterior',
      'Primeira página',
      'Última página'
    ]);
    expect(intl.getRangeLabel(1, 5, 23)).toBe('6 – 10 de 23');
    expect(redraw).toHaveBeenCalled();
  });

  it('counts an empty list and a last partial page the way Material does', () => {
    expect(intl.getRangeLabel(0, 5, 0)).toBe('0 of 0');
    expect(intl.getRangeLabel(4, 5, 23)).toBe('21 – 23 of 23');
  });
});
