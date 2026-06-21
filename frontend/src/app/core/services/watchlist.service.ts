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
        external_film_id: film.id
      }
    };

    this.watchlistSignal.update(items => [...items, tempItem]);

    try {
      const res: any = await this.watchRepo.addToWatchlist({
        externalFilmId: film.id,
        title: film.title,
        posterPath: film.poster_path,
        voteAverage: film.vote_average,
        releaseDate: film.release_date
      });

      // Confirm with real database data
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
              external_film_id: film.id
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

  async getWatchlist(forceRefresh = false) {
    if (this.hasLoaded && !forceRefresh) {
      this.isLoadingSignal.set(false);
      return;
    }
    this.isLoadingSignal.set(true);
    try {
      const watchlist = await this.watchRepo.getWatchlist();
      this.watchlistSignal.set(watchlist);
      this.hasLoaded = true;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  resetState(): void {
    this.watchlistSignal.set([]);
    this.isLoadingSignal.set(true);
    this.hasLoaded = false;
  }
}