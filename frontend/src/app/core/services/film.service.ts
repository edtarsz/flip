import { Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { tap } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private url = environment.tmdbUrl;
  private headers = new HttpHeaders()
    .set('Authorization', `Bearer ${environment.tmdbKey}`)

  private filmsSignal = signal<FilmTMDB[]>([]);
  readonly films = this.filmsSignal.asReadonly();

  private genresSignal = signal<GenreTMDB[]>([]);
  readonly genres = this.genresSignal.asReadonly();

  constructor(private http: HttpClient) { }

  getFilms(genres?: string[], year?: number) {
    let url = `${this.url}/discover/movie?page=1&sort_by=popularity.desc`;

    if (genres) url += `&with_genres=${genres}`;
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
