import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { filmsResolver } from './features/films/films.resolver';
import { authGuard } from '@core/guards/auth.guard';

export const ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'index',
        pathMatch: 'full'
      },
      {
        path: 'index',
        loadComponent: () => import('./layouts/landing-layout/landing-layout').then(m => m.LandingPage)
      },
      {
        path: 'swipe',
        loadComponent: () => import('./features/swipe/swipe').then(m => m.Swipe),
        canActivate: [authGuard]
      },
      {
        path: 'films',
        loadComponent: () => import('./features/films/films').then(m => m.Films),
        resolve: { data: filmsResolver }
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.Auth)
  },
  {
    path: '**',
    redirectTo: 'index'
  }
];