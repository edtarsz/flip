import { inject, Injectable, signal } from '@angular/core'
import { WatchlistRepository } from '@core/repositories/watchlist.repository'
import { FilmTMDB, WatchlistItem } from '@core/types/tmdb/film.type'

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchRepo = inject(WatchlistRepository);

  private watchlistSignal = signal<WatchlistItem[]>([]);
  readonly watchlist = this.watchlistSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(true);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  currentPage = signal<number>(1);
  hasMorePages = signal<boolean>(true);

  private hasLoaded = false;

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
        genre_ids: film.genre_ids
      }
    };

    this.watchlistSignal.update(items => [tempItem, ...items]);

    try {
      const res: any = await this.watchRepo.addToWatchlist({
        externalFilmId: film.id,
        title: film.title,
        posterPath: film.poster_path,
        voteAverage: film.vote_average,
        releaseDate: film.release_date,
        genreIds: film.genre_ids || []
      });

      this.watchlistSignal.update(items => items.map(item => {
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
              genre_ids: film.genre_ids
            }
          };
        }
        return item;
      }));

      return res;
    } catch (error) {
      this.watchlistSignal.update(items => items.filter(item => item.id !== tempId));
      throw error;
    }
  }

  async removeFromWatchlist(externalFilmId: number) {
    const previousItems = this.watchlistSignal();
    const itemToRemove = previousItems.find(item => item.film.external_film_id === externalFilmId);

    if (!itemToRemove) {
      return await this.watchRepo.removeFromWatchlist(externalFilmId);
    }

    this.watchlistSignal.update(items => items.filter(item => item.film.external_film_id !== externalFilmId));

    try {
      await this.watchRepo.removeFromWatchlist(externalFilmId);
    } catch (error) {
      this.watchlistSignal.set(previousItems);
      throw error;
    }
  }

  async getWatchlist(page: number = 1, forceRefresh = false) {
    if (this.hasLoaded && !forceRefresh && page === 1) {
      this.isLoadingSignal.set(false);
      return;
    }

    if (page === 1 || forceRefresh) {
      this.currentPage.set(1);
      this.hasMorePages.set(true);
      this.isLoadingSignal.set(true);
    }

    try {
      const limit = 20;
      const watchlist = await this.watchRepo.getWatchlist(page, limit);

      if (watchlist.length < limit) {
        this.hasMorePages.set(false);
      }

      if (page === 1 || forceRefresh) {
        this.watchlistSignal.set(watchlist);
      } else {
        this.watchlistSignal.update(items => {
          const existingIds = new Set(items.map(i => i.id));
          const newItems = watchlist.filter(item => !existingIds.has(item.id));
          return [...items, ...newItems];
        });
      }

      this.currentPage.set(page);
      this.hasLoaded = true;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  resetState(): void {
    this.watchlistSignal.set([]);
    this.isLoadingSignal.set(true);
    this.hasLoaded = false;
    this.currentPage.set(1);
    this.hasMorePages.set(true);
  }
}