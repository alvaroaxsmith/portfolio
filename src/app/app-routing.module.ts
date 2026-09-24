import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';
import { ContactComponent } from './pages/contact/contact.component';

const routes: Routes = [
  {
    path: '',
    data: {
      seo: {
        titleKey: 'seo.home.title',
        descriptionKey: 'seo.home.description'
      }
    },
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'about-me',
    data: {
      seo: {
        titleKey: 'seo.about.title',
        descriptionKey: 'seo.about.description'
      }
    },
    loadChildren: () => import('./pages/about-me/about-me.module').then(m => m.AboutMeModule)
  },
  {
    path: 'courses',
    data: {
      seo: {
        titleKey: 'seo.courses.title',
        descriptionKey: 'seo.courses.description'
      }
    },
    loadChildren: () => import('./pages/courses/courses.module').then(m => m.CoursesModule)
  },
  {
    path: 'portfolio',
    data: {
      seo: {
        titleKey: 'seo.portfolio.title',
        descriptionKey: 'seo.portfolio.description'
      }
    },
    loadChildren: () => import('./pages/portfolio/portfolio.module').then(m => m.PortfolioModule)
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      seo: {
        titleKey: 'seo.contact.title',
        descriptionKey: 'seo.contact.description'
      }
    }
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
