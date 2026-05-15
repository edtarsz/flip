import { Routes } from '@angular/router';
import { MainLayout } from './shared/main-layout/main-layout';

export const ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'index',
        loadComponent: () => import('./features/landing-page/landing-page').then(m => m.LandingPage)
      },
      {
        path: 'swipe',
        loadComponent: () => import('./features/swipe/swipe').then(m => m.Swipe)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth').then(m => m.Auth)
  }
];