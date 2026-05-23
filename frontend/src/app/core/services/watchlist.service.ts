import { inject, Injectable } from '@angular/core'
import { WatchlistRepository } from '@core/repositories/watchlist.repository'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private authService = inject(AuthService);
  private watchRepo = inject(WatchlistRepository);

  async addToWatchlist(externalFilmId: number) {
    const userId = this.authService.requireUserId();
    return await this.watchRepo.addToWatchlist(externalFilmId, userId);
  }

  async removeFromWatchlist(externalFilmId: number) {
    return await this.watchRepo.removeFromWatchlist(externalFilmId);
  }

  async getWatchlist() {
    return await this.watchRepo.getWatchlist();
  }
}