import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_URL, SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
  });

  const originalTitle = document.title;
  const tagSelectors = ['meta[name="robots"]', 'meta[name="description"]', 'meta[property^="og:"]', 'meta[name^="twitter:"]', 'link[rel="canonical"]'];
  const tagsBefore = new Set(tagSelectors.flatMap((selector) => Array.from(document.head.querySelectorAll(selector))));

  // The service writes to the real <head>; undo it so later specs see the page as it was.
  afterEach(() => {
    document.title = originalTitle;
    for (const tag of tagSelectors.flatMap((selector) => Array.from(document.head.querySelectorAll(selector)))) {
      if (!tagsBefore.has(tag)) {
        tag.remove();
      }
    }
  });

  const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href');

  it('updates title, description, Open Graph and Twitter tags for the page', () => {
    service.update({ title: 'Projetos | Alvaro Ferreira', description: 'Projetos do GitHub', path: '/portfolio' });

    expect(TestBed.inject(Title).getTitle()).toBe('Projetos | Alvaro Ferreira');
    expect(meta.getTag('name="description"')?.content).toBe('Projetos do GitHub');
    expect(meta.getTag('property="og:title"')?.content).toBe('Projetos | Alvaro Ferreira');
    expect(meta.getTag('property="og:description"')?.content).toBe('Projetos do GitHub');
    expect(meta.getTag('name="twitter:title"')?.content).toBe('Projetos | Alvaro Ferreira');
  });

  it('points canonical and og:url to the production URL of each route', () => {
    service.update({ title: 't', description: 'd', path: '/about-me' });

    expect(canonical()).toBe(`${SITE_URL}/about-me`);
    expect(meta.getTag('property="og:url"')?.content).toBe(`${SITE_URL}/about-me`);
  });

  it('keeps the trailing slash only for the home page', () => {
    service.update({ title: 't', description: 'd', path: '/' });
    expect(canonical()).toBe(`${SITE_URL}/`);

    service.update({ title: 't', description: 'd', path: '/courses/' });
    expect(canonical()).toBe(`${SITE_URL}/courses`);
  });

  it('reuses a single canonical link across navigations', () => {
    service.update({ title: 't', description: 'd', path: '/' });
    service.update({ title: 't', description: 'd', path: '/contact' });

    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('keeps a page out of search results only while it asks to', () => {
    service.update({ title: 't', description: 'd', path: '/missing', noindex: true });
    expect(meta.getTag('name="robots"')?.content).toBe('noindex');

    service.update({ title: 't', description: 'd', path: '/contact' });
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
