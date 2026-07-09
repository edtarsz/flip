import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { WatchlistService } from '@core/services/watchlist.service';
import { FilmService } from '@core/services/film.service';
import { FilmFilters } from '../films/film-filters/film-filters';
import { FilmGrid } from '../films/film-grid/film-grid';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { LucideListFilter, LucideX } from '@lucide/angular';
import { animateRipple } from '@shared/utils/animation.util';

@Component({
  selector: 'app-watchlist',
  imports: [FilmFilters, FilmGrid, LucideListFilter, LucideX],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnDestroy {
  private watchlistService = inject(WatchlistService);
  private filmService = inject(FilmService);

  readonly genres = this.filmService.genres;

  readonly watchlist = this.watchlistService.watchlist;
  readonly isLoading = this.watchlistService.isLoading;
  readonly hasMorePages = this.watchlistService.hasMorePages;

  selectedYear = signal<number | null>(null);
  selectedGenres = signal<number[]>([]);

  sortedGenres = signal<GenreTMDB[]>([]);
  private genresInitialized = false;

  animateClick(event: Event) {
    animateRipple(event);
  }

  constructor() {
    effect(() => {
      const items = this.watchlist();
      const allGenres = this.genres();

      if (
        !this.genresInitialized &&
        items.length > 0 &&
        this.selectedGenres().length === 0 &&
        this.selectedYear() === null
      ) {
        this.genresInitialized = true;
        const countMap: Record<number, number> = {};
        for (const item of items) {
          if (item.film && item.film.genre_ids) {
            for (const genreId of item.film.genre_ids) {
              countMap[genreId] = (countMap[genreId] || 0) + 1;
            }
          }
        }

        const sorted = allGenres
          .filter((g) => (countMap[g.id] || 0) > 0)
          .sort((a, b) => {
            const aCount = countMap[a.id] || 0;
            const bCount = countMap[b.id] || 0;

            if (aCount !== bCount) {
              return bCount - aCount;
            }

            return a.name.localeCompare(b.name);
          });

        this.sortedGenres.set(sorted);
      }
    });
  }

  hasActiveFilters = computed(() => this.selectedGenres().length > 0 || this.selectedYear() !== null);

  toggleQuickFilterGenre(genreId: number) {
    const current = this.selectedGenres();
    let next: number[];
    if (current.includes(genreId)) {
      next = current.filter((id) => id !== genreId);
    } else {
      next = [...current, genreId];
    }
    this.selectedGenres.set(next);

    this.watchlistService.getWatchlist(1, false, {
      genres: next,
      year: this.selectedYear(),
    });
  }

  filteredWatchlistAsFilms = computed<FilmTMDB[]>(() => {
    let items = this.watchlist();
    return items.map((item) => ({
      ...item.film,
      id: item.film.external_film_id,
    })) as unknown as FilmTMDB[];
  });

  loadNextPage() {
    this.watchlistService.getWatchlist(this.watchlistService.currentPage() + 1, false, {
      genres: this.selectedGenres(),
      year: this.selectedYear(),
    });
  }

  applyFilters(filters: { genres: number[]; year: number | null }) {
    this.selectedGenres.set(filters.genres);
    this.selectedYear.set(filters.year);
    this.watchlistService.getWatchlist(1, false, filters);
  }

  ngOnDestroy() {
    if (this.selectedGenres().length > 0 || this.selectedYear() !== null) {
      this.watchlistService.getWatchlist(1, false, { genres: [], year: null });
    }
  }
}
