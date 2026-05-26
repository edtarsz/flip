import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { catchError, EMPTY, forkJoin } from 'rxjs';

export const filmsResolver: ResolveFn<any> = () => {
  const filmService = inject(FilmService);
  return forkJoin([
    filmService.getFilms(),
    filmService.getGenres()
  ]);
};

export const watchlistResolver: ResolveFn<any> = () => {
  const watchlistService = inject(WatchlistService);
  return watchlistService.getWatchlist();
};

export const filmResolver: ResolveFn<any> = (route) => {
  const filmService = inject(FilmService);
  const router = inject(Router);
  const id = +route.paramMap.get('id')!;

  return filmService.getFilmById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};