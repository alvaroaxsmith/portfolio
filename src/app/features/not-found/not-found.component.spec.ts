import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      imports: [NotFoundComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])]
    });
    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('tells the visitor the page does not exist', () => {
    const page = render();

    expect(page.querySelector('h1')?.textContent).toContain('notFound.title');
    expect(page.textContent).toContain('notFound.description');
  });

  it('offers a way back to the home page', () => {
    const back = render().querySelector<HTMLAnchorElement>('a[href="/"]');

    expect(back?.textContent).toContain('notFound.back');
  });
});
