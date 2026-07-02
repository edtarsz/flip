import { inject, Injectable, signal } from '@angular/core';
import { WatchlistRepository } from '@core/repositories/watchlist.repository';
import { FilmTMDB, WatchlistItem } from '@core/types/tmdb/film.type';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private watchRepo = inject(WatchlistRepository);

  private watchlistSignal = signal<WatchlistItem[]>([]);
  readonly watchlist = this.watchlistSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(true);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private hasLoadedSignal = signal<boolean>(false);
  readonly hasLoaded = this.hasLoadedSignal.asReadonly();

  currentPage = signal<number>(1);
  hasMorePages = signal<boolean>(true);

  async addToWatchlist(film: FilmTMDB) {
    const tempId = `temp-${Date.now()}`;
    const tempItem: WatchlistItem = {
      id: tempId,
      created_at: new Date().toISOString(),
      film_id: tempId,
      user_id: '',
      film: {
        id: tempId,
        title: film.title,
        poster_path: film.poster_path,
        vote_average: film.vote_average,
        release_date: film.release_date,
        external_film_id: film.id,
        genre_ids: film.genre_ids,
      },
    };

    this.watchlistSignal.update((items) => [tempItem, ...items]);

    try {
      const res: any = await this.watchRepo.addToWatchlist({
        externalFilmId: film.id,
        title: film.title,
        posterPath: film.poster_path,
        voteAverage: film.vote_average,
        releaseDate: film.release_date,
        genreIds: film.genre_ids || [],
      });

      this.watchlistSignal.update((items) =>
        items.map((item) => {
          if (item.id === tempId) {
            return {
              id: res.watchlist_id,
              created_at: new Date().toISOString(),
              film_id: res.film_id,
              user_id: res.user_id,
              film: {
                id: res.film_id,
                title: film.title,
                poster_path: film.poster_path,
                vote_average: film.vote_average,
                release_date: film.release_date,
                external_film_id: film.id,
                genre_ids: film.genre_ids,
              },
            };
          }
          return item;
        }),
      );

      return res;
    } catch (error) {
      this.watchlistSignal.update((items) => items.filter((item) => item.id !== tempId));
      throw error;
    }
  }

  async removeFromWatchlist(externalFilmId: number) {
    const previousItems = this.watchlistSignal();
    const itemToRemove = previousItems.find(
      (item) => item.film.external_film_id === externalFilmId,
    );

    if (!itemToRemove) {
      return await this.watchRepo.removeFromWatchlist(externalFilmId);
    }

    this.watchlistSignal.update((items) =>
      items.filter((item) => item.film.external_film_id !== externalFilmId),
    );

    try {
      await this.watchRepo.removeFromWatchlist(externalFilmId);
    } catch (error) {
      this.watchlistSignal.set(previousItems);
      throw error;
    }
  }

  activeFilters = signal<{ genres: number[]; year: number | null }>({ genres: [], year: null });

  async getWatchlist(
    page: number = 1,
    forceRefresh = false,
    filters?: { genres: number[]; year: number | null },
  ) {
    let currentFilters = this.activeFilters();
    let filtersChanged = false;

    if (filters) {
      const genresChanged =
        filters.genres.length !== currentFilters.genres.length ||
        !filters.genres.every((g) => currentFilters.genres.includes(g));
      const yearChanged = filters.year !== currentFilters.year;

      if (genresChanged || yearChanged) {
        filtersChanged = true;
        this.activeFilters.set(filters);
        currentFilters = filters;
      }
    }

    const shouldReset = page === 1 || forceRefresh || filtersChanged;

    if (this.hasLoadedSignal() && !forceRefresh && !filtersChanged && page === 1) {
      this.isLoadingSignal.set(false);
      return;
    }

    if (shouldReset) {
      this.currentPage.set(1);
      this.hasMorePages.set(true);
      this.isLoadingSignal.set(true);
    }

    try {
      const limit = 20;
      const watchlist = await this.watchRepo.getWatchlist(
        shouldReset ? 1 : page,
        limit,
        currentFilters,
      );

      if (watchlist.length < limit) {
        this.hasMorePages.set(false);
      }

      if (shouldReset) {
        this.watchlistSignal.set(watchlist);
      } else {
        this.watchlistSignal.update((items) => {
          const existingIds = new Set(items.map((i) => i.id));
          const newItems = watchlist.filter((item) => !existingIds.has(item.id));
          return [...items, ...newItems];
        });
      }

      this.currentPage.set(shouldReset ? 1 : page);
      this.hasLoadedSignal.set(true);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  resetState(): void {
    this.watchlistSignal.set([]);
    this.isLoadingSignal.set(true);
    this.hasLoadedSignal.set(false);
    this.currentPage.set(1);
    this.hasMorePages.set(true);
    this.activeFilters.set({ genres: [], year: null });
  }
}
