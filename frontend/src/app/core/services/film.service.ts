import { Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmTMDB } from '@core/types/tmdb/film.type';

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private url = environment.tmdbUrl;
  private headers = new HttpHeaders()
    .set('Authorization', `Bearer ${environment.tmdbKey}`)

  private filmsSignal = signal<FilmTMDB[]>([]);
  readonly films = this.filmsSignal.asReadonly();

  constructor(private http: HttpClient) { }

  getFilms() {
    this.http.get<any>(`${this.url}/movie?page=1`, { headers: this.headers }).subscribe(data => {
      this.filmsSignal.set(data.results);
    });
  }
}
