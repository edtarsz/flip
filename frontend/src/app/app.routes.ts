import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

export const ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'index',
        loadComponent: () => import('./layouts/landing-layout/landing-layout').then(m => m.LandingPage)
      },
      {
        path: 'swipe',
        loadComponent: () => import('./features/swipe/swipe').then(m => m.Swipe)
      },
      {
        path: 'films',
        loadComponent: () => import('./features/films/films').then(m => m.Films)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.Auth)
  }
];