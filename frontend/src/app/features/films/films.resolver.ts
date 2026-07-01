import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { catchError, EMPTY, forkJoin, finalize, of, firstValueFrom } from 'rxjs';
import { LoadingService } from '@core/services/loading.service';

export const filmsResolver: ResolveFn<any> = () => {
  const filmService = inject(FilmService);
  const loadingService = inject(LoadingService);

  if (filmService.films().length === 0) {
    loadingService.start();
    return forkJoin([
      filmService.getFilms(),
      filmService.getGenres()
    ]);
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