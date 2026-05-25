import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { forkJoin } from 'rxjs';

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