import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      seo: {
        titleKey: 'seo.home.title',
        descriptionKey: 'seo.home.description'
      }
    },
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about-me',
    data: {
      seo: {
        titleKey: 'seo.about.title',
        descriptionKey: 'seo.about.description'
      }
    },
    loadComponent: () => import('./features/about-me/about-me.component').then(m => m.AboutMeComponent)
  },
  {
    path: 'courses',
    data: {
      seo: {
        titleKey: 'seo.courses.title',
        descriptionKey: 'seo.courses.description'
      }
    },
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent)
  },
  {
    path: 'portfolio',
    data: {
      seo: {
        titleKey: 'seo.portfolio.title',
        descriptionKey: 'seo.portfolio.description'
      }
    },
    loadComponent: () => import('./features/portfolio/portfolio.component').then(m => m.PortfolioComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    data: {
      seo: {
        titleKey: 'seo.contact.title',
        descriptionKey: 'seo.contact.description'
      }
    }
  }

];
