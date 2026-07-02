import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { tap, of, catchError, map } from 'rxjs';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

const FALLBACK_GENRES: GenreTMDB[] = [
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
  { id: 37, name: 'Western' }
];

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
          const seen = new Set();
          const uniqueResults = data.results.filter((film: FilmTMDB) => {
            if (seen.has(film.id)) return false;
            seen.add(film.id);
            return true;
          });
          this.filmsSignal.set(uniqueResults);
        } else {
          this.filmsSignal.update(films => {
            const existingIds = new Set(films.map(f => f.id));
            const newFilms = data.results.filter((film: FilmTMDB) => !existingIds.has(film.id));
            return [...films, ...newFilms];
          });
        }
      })
    );
  }

  getGenres() {
    const cacheKey = 'tmdb_genres';
    const cacheTimeKey = 'tmdb_genres_timestamp';
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(cacheTimeKey);

      if (cached && timestamp && (Date.now() - Number(timestamp) < oneWeek)) {
        const genres = JSON.parse(cached);
        this.genresSignal.set(genres);
        return of({ genres });
      }
    } catch (e) {
      console.warn('LocalStorage not available or corrupted:', e);
    }

    return this.http.get<any>(`${this.url}/genre/movie/list`, { headers: this.headers }).pipe(
      tap(data => {
        if (data && data.genres) {
          this.genresSignal.set(data.genres);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.genres));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
          } catch (e) {
            console.warn('Failed to save genres to localStorage:', e);
          }
        }
      }),
      catchError(err => {
        console.error('Error fetching genres from TMDB, using fallback:', err);
        this.genresSignal.set(FALLBACK_GENRES);
        return of({ genres: FALLBACK_GENRES });
      })
    );
  }

  getFilmById(id: number) {
    return this.http.get<any>(`${this.url}/movie/${id}?append_to_response=watch/providers,credits`, { headers: this.headers }).pipe(
      map(data => {
        if (data) {
          if (data['watch/providers']) {
            data.watch_providers = data['watch/providers'].results;
          }
          if (data.credits && data.credits.crew) {
            const crew = data.credits.crew;
            const directorObj = crew.find((member: any) => member.job === 'Director');
            const writerObj = crew.find((member: any) => member.job === 'Screenplay' || member.job === 'Writer');
            
            data.director = directorObj ? directorObj.name : null;
            data.screenwriter = writerObj ? writerObj.name : null;
          }
        }
        return data;
      }),
      tap(data => this.filmDetailsSignal.set(data))
    );
  }

  getCollectionById(id: number | string) {
    return this.http.get<any>(`${this.url}/collection/${id}`, { headers: this.headers });
  }

  getListById(id: number | string, page: number = 1) {
    return this.http.get<any>(`${this.url}/list/${id}?page=${page}`, { headers: this.headers });
  }
}
