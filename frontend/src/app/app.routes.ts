import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { filmResolver, filmsResolver, watchlistResolver } from './features/films/films.resolver';
import { alreadyAuthGuard, authGuard } from '@core/guards/auth.guard';

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
        // resolve: { data: filmsResolver }
        children: [
          {
            path: '',
            loadComponent: () => import('./features/films/films').then(m => m.Films)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/films/film-details/film-details').then(m => m.FilmDetails),
            resolve: { film: filmResolver }
          }
        ]
      },
      {
        path: 'watchlist',
        loadComponent: () => import('./features/watchlist/watchlist').then(m => m.Watchlist),
        canActivate: [authGuard]
        // resolve: { data: watchlistResolver }
      }
    ]
  },
  {
    path: 'auth',
    canActivate: [alreadyAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./layouts/auth-layout/login/login').then(m => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () => import('./layouts/auth-layout/signup/signup').then(m => m.SignUp),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'index'
  }
];