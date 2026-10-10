import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), FooterComponent]
}).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('names the technology icons for screen readers', () => {
    const footer = fixture.nativeElement as HTMLElement;
    const hidden = Array.from(footer.querySelectorAll('.flex-icons .cdk-visually-hidden')).map((el) => el.textContent?.trim());

    expect(hidden).toEqual(['Angular', 'NodeJs']);
    expect(Array.from(footer.querySelectorAll('fa-icon')).every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBeTrue();
    expect(footer.querySelector('fa-icon[alt]')).toBeNull();
  });
});
