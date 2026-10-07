import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  const blockNavigation = (event: Event) => event.preventDefault();

  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    await TestBed.configureTestingModule({
      imports: [ContactComponent, TranslateModule.forRoot()],
      providers: [{ provide: AnalyticsService, useValue: analytics }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    document.addEventListener('click', blockNavigation);
  });

  afterEach(() => document.removeEventListener('click', blockNavigation));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers phone, e-mail, GitHub and LinkedIn as contact channels', () => {
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a.contact-card') as NodeListOf<HTMLAnchorElement>).map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual([
      'tel:+5511951013956',
      'mailto:alvaromachadoferreira@hotmail.com',
      'https://github.com/alvaroaxsmith',
      'https://www.linkedin.com/in/alvaromachadoferreira/'
    ]);
  });

  it('tracks which channel was used', () => {
    const cards = fixture.nativeElement.querySelectorAll('a.contact-card') as NodeListOf<HTMLAnchorElement>;
    cards.forEach((card) => card.click());

    expect(analytics.track.calls.allArgs()).toEqual([
      ['contact_click', { channel: 'phone' }],
      ['contact_click', { channel: 'email' }],
      ['contact_click', { channel: 'github' }],
      ['contact_click', { channel: 'linkedin' }]
    ]);
  });
});
