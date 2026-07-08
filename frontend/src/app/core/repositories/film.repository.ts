import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, of, catchError, map } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

export const FALLBACK_GENRES: GenreTMDB[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const VOTE_COUNT_THRESHOLD = 150;
const GENRES_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SORT = 'popularity.desc';
const DEFAULT_PAGE = 1;
const DETAILS_APPEND_TO_RESPONSE = 'watch/providers,credits,videos';

export interface GetFilmsOptions {
  genres?: number[];
  year?: number | null;
  query?: string | null;
  page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FilmRepository {
  private http = inject(HttpClient);

  private url = environment.tmdbUrl;
  private headers = new HttpHeaders().set('Authorization', `Bearer ${environment.tmdbKey}`);

  private filmCache = new Map<number, any>();

  getFilms(options: GetFilmsOptions = {}) {
    const genres = options.genres;
    const year = options.year;
    const query = options.query;
    const page = options.page ?? DEFAULT_PAGE;

    const isSearch = query && query.trim().length > 0;

    let url = isSearch
      ? `${this.url}/search/movie?query=${query}&page=${page}&include_adult=false`
      : `${this.url}/discover/movie?sort_by=${DEFAULT_SORT}&include_adult=false&vote_count.gte=${VOTE_COUNT_THRESHOLD}&page=${page}`;

    if (genres && genres.length > 0) url += `&with_genres=${genres.join(',')}`;
    if (year) url += `&primary_release_year=${year}`;

    return this.http.get<any>(url, { headers: this.headers });
  }

  getGenres() {
    try {
      const cached = localStorage.getItem('tmdb_genres');
      const timestamp = localStorage.getItem('tmdb_genres_timestamp');

      if (cached && timestamp && Date.now() - Number(timestamp) < GENRES_CACHE_EXPIRY) {
        const genres = JSON.parse(cached);
        return of({ genres });
      }
    } catch (e) {
      console.warn('LocalStorage not available or corrupted:', e);
    }

    return this.http.get<any>(`${this.url}/genre/movie/list`, { headers: this.headers }).pipe(
      tap((data) => {
        if (data && data.genres) {
          try {
            localStorage.setItem('tmdb_genres', JSON.stringify(data.genres));
            localStorage.setItem('tmdb_genres_timestamp', Date.now().toString());
          } catch (e) {
            console.warn('Failed to save genres to localStorage:', e);
          }
        }
      }),
      catchError((err) => {
        console.error('Error fetching genres from TMDB, using fallback:', err);
        return of({ genres: FALLBACK_GENRES });
      }),
    );
  }

  getFilmById(id: number) {
    if (this.filmCache.has(id)) {
      const cached = this.filmCache.get(id);
      return of(cached);
    }

    return this.http
      .get<any>(`${this.url}/movie/${id}?append_to_response=${DETAILS_APPEND_TO_RESPONSE}`, {
        headers: this.headers,
      })
      .pipe(
        map((data) => {
          if (data) {
            if (data['watch/providers']) {
              data.watch_providers = data['watch/providers'].results;
            }
            if (data.credits && data.credits.crew) {
              const crew = data.credits.crew;
              const directorObj = crew.find((member: any) => member.job === 'Director');
              const writerObj = crew.find(
                (member: any) => member.job === 'Screenplay' || member.job === 'Writer',
              );

              data.director = directorObj ? directorObj.name : null;
              data.screenwriter = writerObj ? writerObj.name : null;
            }
          }
          return data;
        }),
        tap((data) => {
          this.filmCache.set(id, data);
        }),
      );
  }

  getCollectionById(id: number | string) {
    return this.http.get<any>(`${this.url}/collection/${id}`, { headers: this.headers });
  }

  getListById(id: number | string, page: number = 1) {
    return this.http.get<any>(`${this.url}/list/${id}?page=${page}`, { headers: this.headers });
  }
}
