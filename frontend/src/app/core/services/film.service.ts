import { inject, Injectable, signal } from '@angular/core';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { tap, of, concatMap } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { FilmRepository, GetFilmsOptions } from '../repositories/film.repository';

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private filmRepo = inject(FilmRepository);

  private filmsSignal = signal<FilmTMDB[]>([]);
  readonly films = this.filmsSignal.asReadonly();

  private genresSignal = signal<GenreTMDB[]>([]);
  readonly genres = this.genresSignal.asReadonly();

  private filmDetailsSignal = signal<FilmTMDB | null>(null);
  readonly filmDetails = this.filmDetailsSignal.asReadonly();

  selectedGenres = signal<number[]>([]);
  selectedYear = signal<number | null>(null);
  searchModel = signal<string>('');
  submittedQuery = signal<string>('');
  currentPage = signal<number>(1);
  hasMorePages = signal<boolean>(true);

  resetState(): void {
    this.filmsSignal.set([]);
    this.filmDetailsSignal.set(null);
    this.selectedGenres.set([]);
    this.selectedYear.set(null);
    this.searchModel.set('');
    this.submittedQuery.set('');
    this.currentPage.set(1);
    this.hasMorePages.set(true);
  }

  clearFilms(): void {
    this.filmsSignal.set([]);
  }

  getFilms(options: GetFilmsOptions = {}) {
    const page = options.page ?? 1;

    return this.filmRepo.getFilms(options).pipe(
      tap((data) => {
        if (data && data.results) {
          data.results = data.results.filter(
            (film: FilmTMDB) =>
              film.poster_path &&
              film.release_date &&
              film.vote_count >= 150 
              // &&
              // (!film.genre_ids || !film.genre_ids.includes(99)) && 
              // (!film.genre_ids || !film.genre_ids.includes(10770)) 
          );
        }

        if (page === 1) {
          const seen = new Set();
          const uniqueResults = (data.results || []).filter((film: FilmTMDB) => {
            if (seen.has(film.id)) return false;
            seen.add(film.id);
            return true;
          });
          this.filmsSignal.set(uniqueResults);
        } else {
          this.filmsSignal.update((films) => {
            const existingIds = new Set(films.map((f) => f.id));
            const newFilms = (data.results || []).filter((film: FilmTMDB) => {
              if (existingIds.has(film.id)) return false;
              existingIds.add(film.id);
              return true;
            });
            return [...films, ...newFilms];
          });
        }
      }),
    );
  }

  getInitialFilms(options: GetFilmsOptions = {}) {
    return this.getFilms({ ...options, page: 1 }).pipe(
      concatMap((data) => {
        if (!data.results || data.results.length === 0 || data.total_pages < 2) {
          this.currentPage.set(1);
          this.hasMorePages.set(false);
          return of(data);
        }
        this.currentPage.set(2);
        return this.getFilms({ ...options, page: 2 });
      })
    );
  }

  getGenres() {
    return this.filmRepo.getGenres().pipe(
      tap((data) => {
        if (data && data.genres) {
          this.genresSignal.set(data.genres);
        }
      })
    );
  }

  getFilmById(id: number) {
    return this.filmRepo.getFilmById(id).pipe(
      tap((data) => {
        if (data) {
          this.filmDetailsSignal.set(data);
        }
      })
    );
  }

  getListById(id: number | string, page: number = 1) {
    return this.filmRepo.getListById(id, page);
  }
}
