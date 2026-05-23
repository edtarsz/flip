import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { tap } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private http = inject(HttpClient);

  private url = environment.tmdbUrl;
  private headers = new HttpHeaders()
    .set('Authorization', `Bearer ${environment.tmdbKey}`)

  private filmsSignal = signal<FilmTMDB[]>([]);
  readonly films = this.filmsSignal.asReadonly();

  private genresSignal = signal<GenreTMDB[]>([]);
  readonly genres = this.genresSignal.asReadonly();

  getFilms(genres?: number[], year?: number, query?: string) {
    let url = query && query.trim().length > 0 ? `${this.url}/search/movie?query=${query}` : `${this.url}/discover/movie?sort_by=popularity.desc&include_adult=false`;

    if (genres && genres.length > 0) url += `&with_genres=${genres}`;
    if (year) url += `&primary_release_year=${year}`;

    return this.http.get<any>(url, { headers: this.headers }).pipe(
      tap(data => this.filmsSignal.set(data.results))
    );
  }

  getGenres() {
    return this.http.get<any>(`${this.url}/genre/movie/list`, { headers: this.headers }).pipe(
      tap(data => this.genresSignal.set(data.genres))
    );
  }
}
