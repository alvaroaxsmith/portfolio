import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursesSkeletonComponent } from './courses-skeleton.component';

describe('CoursesSkeletonComponent', () => {
  let fixture: ComponentFixture<CoursesSkeletonComponent>;

  function render(inputs: { layout?: 'table' | 'cards'; count?: number } = {}) {
    fixture = TestBed.createComponent(CoursesSkeletonComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  const all = (selector: string) => fixture.nativeElement.querySelectorAll(selector).length;

  it('shows five placeholder table rows by default', () => {
    render();

    expect(all('.table-row')).toBe(5);
    expect(all('.course-card')).toBe(0);
  });

  it('mirrors the five table columns in each row', () => {
    render();

    expect(fixture.nativeElement.querySelector('.table-row').querySelectorAll('app-skeleton').length).toBe(5);
  });

  it('shows as many placeholder cards as courses are about to load', () => {
    render({ layout: 'cards', count: 3 });

    expect(all('.course-card')).toBe(3);
    expect(all('.table-row')).toBe(0);
    expect((fixture.nativeElement as HTMLElement).classList).toContain('cards');
  });

  it('varies the width of the course name line so the placeholder does not look like a grid', () => {
    render({ count: 3 });

    const widths = Array.from(fixture.nativeElement.querySelectorAll('.table-row') as NodeListOf<HTMLElement>).map(
      (row) => (row.querySelectorAll('app-skeleton')[1] as HTMLElement).style.width
    );
    expect(new Set(widths).size).toBe(3);
  });
});
