import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { tap } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

export interface GetFilmsOptions {
  genres?: number[];
  year?: number | null;
  query?: string | null;
  page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private http = inject(HttpClient);

  private url = environment.tmdbUrl;
  private headers = new HttpHeaders().set('Authorization', `Bearer ${environment.tmdbKey}`)

  private filmsSignal = signal<FilmTMDB[]>([]);
  readonly films = this.filmsSignal.asReadonly();

  private genresSignal = signal<GenreTMDB[]>([]);
  readonly genres = this.genresSignal.asReadonly();

  private filmDetailsSignal = signal<FilmTMDB | null>(null);
  readonly filmDetails = this.filmDetailsSignal.asReadonly();

  getFilms(options: GetFilmsOptions = {}) {
    const genres = options.genres;
    const year = options.year;
    const query = options.query;
    const page = options.page ?? 1;

    const isSearch = query && query.trim().length > 0;

    let url = isSearch
      ? `${this.url}/search/movie?query=${query}&page=${page}`
      : `${this.url}/discover/movie?sort_by=popularity.desc&include_adult=false&page=${page}`;

    if (genres && genres.length > 0) url += `&with_genres=${genres.join(',')}`;
    if (year) url += `&primary_release_year=${year}`;

    return this.http.get<any>(url, { headers: this.headers }).pipe(
      tap(data => {
        if (page === 1) {
          this.filmsSignal.set(data.results);
        } else {
          this.filmsSignal.update(films => [...films, ...data.results]);
        }
      })
    );
  }

  getGenres() {
    return this.http.get<any>(`${this.url}/genre/movie/list`, { headers: this.headers }).pipe(
      tap(data => this.genresSignal.set(data.genres))
    );
  }

  getFilmById(id: number) {
    return this.http.get<any>(`${this.url}/movie/${id}`, { headers: this.headers }).pipe(
      tap(data => this.filmDetailsSignal.set(data))
    );
  }
}
