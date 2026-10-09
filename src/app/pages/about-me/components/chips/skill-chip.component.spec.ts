import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillChipComponent } from './skill-chip.component';

describe('SkillChipComponent', () => {
  let fixture: ComponentFixture<SkillChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkillChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillChipComponent);
  });

  it('renders the skill it receives', () => {
    fixture.componentInstance.skill = 'Angular';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chip').textContent.trim()).toBe('Angular');
  });

  it('renders an empty chip when no skill is given', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chip').textContent.trim()).toBe('');
  });
});
