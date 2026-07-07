import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { forkJoin, of, firstValueFrom } from 'rxjs';
import { LoadingService } from '@core/services/loading.service';

export const filmsResolver: ResolveFn<any> = () => {
  const filmService = inject(FilmService);
  const loadingService = inject(LoadingService);

  if (filmService.films().length === 0) {
    loadingService.start();
    return forkJoin([filmService.getInitialFilms(), filmService.getGenres()]);
  }
  return of(true);
};

export const watchlistResolver: ResolveFn<any> = async () => {
  const watchlistService = inject(WatchlistService);
  const loadingService = inject(LoadingService);
  const filmService = inject(FilmService);

  if (!watchlistService.hasLoaded()) {
    loadingService.start();
    await watchlistService.getWatchlist();
  }

  if (filmService.genres().length === 0) {
    await firstValueFrom(filmService.getGenres());
  }

  return true;
};
