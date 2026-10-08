import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectCardSkeletonComponent } from './project-card-skeleton.component';

describe('ProjectCardSkeletonComponent', () => {
  let fixture: ComponentFixture<ProjectCardSkeletonComponent>;

  function render(layout?: 'grid' | 'list') {
    fixture = TestBed.createComponent(ProjectCardSkeletonComponent);
    if (layout) {
      fixture.componentRef.setInput('layout', layout);
    }
    fixture.detectChanges();
  }

  const host = () => fixture.nativeElement as HTMLElement;
  const bodyLines = () => host().querySelectorAll('.card-body app-skeleton').length;

  it('mirrors a project card: title, technology, date and repository button', () => {
    render();

    for (const part of ['.title', '.tech', '.date', '.button']) {
      expect(host().querySelector(`.card-header ${part}`)).withContext(part).not.toBeNull();
    }
  });

  it('shows a three-line description in the grid, like a grid card', () => {
    render('grid');

    expect(bodyLines()).toBe(3);
    expect(host().classList).not.toContain('is-list');
  });

  it('shows a shorter description in the list, like a list card', () => {
    render('list');

    expect(bodyLines()).toBe(2);
    expect(host().classList).toContain('is-list');
  });

  it('is hidden from assistive technology', () => {
    render();

    expect(host().getAttribute('aria-hidden')).toBe('true');
  });
});
