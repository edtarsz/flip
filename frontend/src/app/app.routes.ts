import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { filmsResolver, watchlistResolver } from './features/films/films.resolver';
import { swipeResolver } from './features/swipe/swipe.resolver';
import { alreadyAuthGuard, authGuard } from '@core/guards/auth.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

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
        loadComponent: () => import('./layouts/index-layout/index-layout').then(m => m.IndexLayout),
        resolve: { films: filmsResolver }
      },
      {
        path: 'swipe',
        loadComponent: () => import('./features/swipe/swipe').then(m => m.Swipe),
        canActivate: [authGuard],
        resolve: { swipe: swipeResolver }
      },
      {
        path: 'films',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/films/films').then(m => m.Films),
            resolve: { films: filmsResolver }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/films/film-details/film-details').then(m => m.FilmDetails),
          }
        ]
      },
      {
        path: 'watchlist',
        loadComponent: () => import('./features/watchlist/watchlist').then(m => m.Watchlist),
        canActivate: [authGuard],
        resolve: { watchlist: watchlistResolver }
      },
      {
        path: 'trees',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/trees/trees').then(m => m.Trees),
            canActivate: [authGuard]
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/ui/tree/tree').then(m => m.Tree),
            canActivate: [authGuard]
          }
        ]
      },
      {
        path: 'auth',
        component: AuthLayout,
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
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'index'
  }
];