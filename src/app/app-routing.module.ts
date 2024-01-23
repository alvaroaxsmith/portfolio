import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { ContactComponent } from './pages/contact/contact.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'about-me', loadChildren: () => import('./pages/about-me/about-me.module').then(m => m.AboutMeModule) },
  { path: 'courses', loadChildren: () => import('./pages/courses/courses.module').then(m => m.CoursesModule) },
  { path: 'portfolio', loadChildren: () => import('./pages/portfolio/portfolio.module').then(m => m.PortfolioModule) },
  { path: 'contact', component: ContactComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
