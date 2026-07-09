import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { ReviewService } from '@core/services/review.service';
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
  const reviewService = inject(ReviewService);
  const loadingService = inject(LoadingService);
  const filmService = inject(FilmService);

  if (!watchlistService.hasLoaded() || !reviewService.hasLoaded()) {
    loadingService.start();
    await Promise.all([
      watchlistService.hasLoaded() ? Promise.resolve() : watchlistService.getWatchlist(),
      reviewService.hasLoaded() ? Promise.resolve() : reviewService.loadUserReviews(),
    ]);
  }

  if (filmService.genres().length === 0) {
    await firstValueFrom(filmService.getGenres());
  }

  return true;
};
