import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { NavMenuSheetComponent } from './nav-menu-sheet.component';

describe('Mobile navigation menu', () => {
  let fixture: ComponentFixture<NavMenuSheetComponent>;
  let sheetRef: jasmine.SpyObj<MatBottomSheetRef<NavMenuSheetComponent>>;
  let translate: TranslateService;

  beforeEach(async () => {
    sheetRef = jasmine.createSpyObj<MatBottomSheetRef<NavMenuSheetComponent>>('MatBottomSheetRef', ['dismiss']);
    await TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([{ path: '**', children: [] }]), NavMenuSheetComponent],
    providers: [provideTranslateService(), { provide: MatBottomSheetRef, useValue: sheetRef }]
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

    expect(translate.getCurrentLang()).toBe('EN');
    expect(sheetRef.dismiss).toHaveBeenCalled();
  });

  it('closes with the close button', () => {
    fixture.nativeElement.querySelector('.sheet-header button').click();

    expect(sheetRef.dismiss).toHaveBeenCalledTimes(1);
  });

  it('names the menu and its close button in the visitor\'s language, and marks the current language', () => {
    translate.use('PT-BR');
    fixture.detectChanges();
    const sheet = fixture.nativeElement as HTMLElement;

    expect(sheet.querySelector('.sheet')?.getAttribute('aria-label')).toBe('a11y.mobileMenu');
    expect(sheet.querySelector('.sheet-header button')?.getAttribute('aria-label')).toBe('a11y.closeMenu');
    const languages = Array.from(sheet.querySelectorAll('.language-buttons button')) as HTMLElement[];
    expect(languages.map((button) => button.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
  });

  it('marks the link of the current page', async () => {
    await TestBed.inject(Router).navigateByUrl('/contact');
    fixture.detectChanges();

    expect(links().filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.getAttribute('href'))).toEqual(['/contact']);
  });
});
