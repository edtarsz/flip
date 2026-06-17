import { inject, Injectable, signal } from '@angular/core'
import { SwipeRepository } from '@core/repositories/swipe.repository'
import { FilmTMDB } from '@core/types/tmdb/film.type'
import { GenreTMDB } from '@core/types/tmdb/genre.type'

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  private swipeRepo = inject(SwipeRepository)

  private recommendationsSignal = signal<FilmTMDB[]>([]);
  readonly recommendations = this.recommendationsSignal.asReadonly();

  private currentIndexSignal = signal(0);
  readonly currentIndex = this.currentIndexSignal.asReadonly();

  private showCoverSignal = signal(true);
  readonly showCover = this.showCoverSignal.asReadonly();

  advanceIndex(): void {
    this.currentIndexSignal.update(idx => idx + 1);
  }

  setCoverShown(): void {
    this.showCoverSignal.set(false);
  }

  clearRecommendations(): void {
    this.recommendationsSignal.set([]);
    this.currentIndexSignal.set(0);
    this.showCoverSignal.set(true);
  }

  async recordSwipe(film: FilmTMDB, direction: 'like' | 'dislike', genres: GenreTMDB[]): Promise<void> {
    return await this.swipeRepo.recordSwipe({ film, direction, genres })
  }

  async getRecommendations(): Promise<FilmTMDB[]> {
    const newFilms = await this.swipeRepo.getRecommendations()
    this.recommendationsSignal.update(existing => {
      const existingIds = new Set(existing.map(f => f.id))
      const unique = newFilms.filter(f => !existingIds.has(f.id))
      return [...existing, ...unique]
    })
    return newFilms;
  }
}
