import { inject, Injectable, signal } from '@angular/core'
import { WatchlistRepository } from '@core/repositories/watchlist.repository'
import { AuthService } from './auth.service'
import { FilmTMDB } from '@core/types/tmdb/film.type'

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  //  private authService = inject(AuthService);
  private watchRepo = inject(WatchlistRepository);

  private watchlistSignal = signal<any[]>([]);
  readonly watchlist = this.watchlistSignal.asReadonly();

  async addToWatchlist(film: FilmTMDB) {
    // this.authService.requireUserId();

    return await this.watchRepo.addToWatchlist({
      externalFilmId: film.id,
      title: film.title,
      posterPath: film.poster_path,
      rating: film.vote_average,
      releaseDate: film.release_date
    });
  }

  async removeFromWatchlist(externalFilmId: number) {
    return await this.watchRepo.removeFromWatchlist(externalFilmId);
  }

  async getWatchlist() {
    const watchlist = await this.watchRepo.getWatchlist();
    this.watchlistSignal.set(watchlist);
  }
}