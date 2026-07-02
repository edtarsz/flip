import { Injectable, inject, signal } from '@angular/core';
import { WatchedRepository } from '../repositories/watched.repository';
import { FilmTMDB } from '../types/tmdb/film.type';

@Injectable({
  providedIn: 'root',
})
export class WatchedService {
  private watchedRepository = inject(WatchedRepository);

  private watchedFilmIdsSignal = signal<string[]>([]);
  readonly watchedFilmIds = this.watchedFilmIdsSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  async loadWatchedFilmIds() {
    this.isLoadingSignal.set(true);
    try {
      const ids = await this.watchedRepository.getWatchedFilmIds();
      this.watchedFilmIdsSignal.set(ids);
    } catch (error) {
      console.error('Failed to load watched film IDs:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async markAsWatched(film: FilmTMDB) {
    try {
      const result = await this.watchedRepository.markAsWatched({
        externalFilmId: film.id,
        title: film.title,
        posterPath: film.poster_path || '',
        voteAverage: film.vote_average,
        releaseDate: film.release_date,
        genreIds: film.genre_ids || [],
      });

      if (result && result.film_id) {
        this.watchedFilmIdsSignal.update((ids) => {
          if (!ids.includes(result.film_id)) {
            return [...ids, result.film_id];
          }
          return ids;
        });
      }
    } catch (error) {
      console.error('Failed to mark film as watched:', error);
      throw error;
    }
  }
}
