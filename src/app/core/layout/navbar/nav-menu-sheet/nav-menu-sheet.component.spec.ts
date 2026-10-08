import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavMenuSheetComponent } from './nav-menu-sheet.component';

describe('Mobile navigation menu', () => {
  let fixture: ComponentFixture<NavMenuSheetComponent>;
  let sheetRef: jasmine.SpyObj<MatBottomSheetRef<NavMenuSheetComponent>>;
  let translate: TranslateService;

  beforeEach(async () => {
    sheetRef = jasmine.createSpyObj<MatBottomSheetRef<NavMenuSheetComponent>>('MatBottomSheetRef', ['dismiss']);
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), RouterModule.forRoot([{ path: '**', children: [] }]), NavMenuSheetComponent],
    providers: [{ provide: MatBottomSheetRef, useValue: sheetRef }]
}).compileComponents();
    translate = TestBed.inject(TranslateService);
    translate.addLangs(['EN', 'PT-BR']);
    fixture = TestBed.createComponent(NavMenuSheetComponent);
    fixture.detectChanges();
  });

  const links = () => Array.from(fixture.nativeElement.querySelectorAll('ul a') as NodeListOf<HTMLAnchorElement>);

  it('lists every page of the site', () => {
    expect(links().map((a) => a.getAttribute('href'))).toEqual(['/', '/about-me', '/courses', '/portfolio', '/contact']);
  });

  it('closes the menu when a page is chosen', () => {
    links()[2].click();

    expect(sheetRef.dismiss).toHaveBeenCalled();
  });

  it('offers one button per language, switching and closing the menu', () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.language-buttons button') as NodeListOf<HTMLButtonElement>);
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['EN', 'PT-BR']);

    buttons[0].click();

    expect(translate.currentLang).toBe('EN');
    expect(sheetRef.dismiss).toHaveBeenCalled();
  });

  it('closes with the close button', () => {
    fixture.nativeElement.querySelector('.sheet-header button').click();

    expect(sheetRef.dismiss).toHaveBeenCalledTimes(1);
  });
});
