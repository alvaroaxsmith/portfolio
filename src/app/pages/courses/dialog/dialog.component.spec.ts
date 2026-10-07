import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../material/material.module';
import { SkeletonModule } from '../../../components/skeleton/skeleton.module';
import { Course } from '../interfaces/courses.interface';
import { DialogComponent } from './dialog.component';

const course: Course = {
  field: 'Tecnologia',
  name: 'Java Full Stack',
  link: 'https://drive.google.com/file/d/abc/preview?usp=sharing',
  time: 640,
  school: 'Soul Code',
  date: '2022/05'
};

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  const sheetRef = { dismiss: jasmine.createSpy('dismiss') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogComponent],
      imports: [TranslateModule.forRoot(), MaterialModule, SkeletonModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: course },
        { provide: MatBottomSheetRef, useValue: sheetRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the skeleton until the certificate itself loads', () => {
    expect(component.isFrameLoaded).toBeFalse();
    expect(fixture.nativeElement.querySelector('app-skeleton')).not.toBeNull();

    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(component.isFrameLoaded).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
  });

  it('opens the full Google Drive viewer in a new tab', () => {
    expect(component.externalUrl).toBe('https://drive.google.com/file/d/abc/view?usp=sharing');
  });
});
