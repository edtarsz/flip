import { Component, inject, signal, computed } from '@angular/core';
import { WatchlistService } from '@core/services/watchlist.service';
import { FilmService } from '@core/services/film.service';
import { FilmFilters } from '../films/film-filters/film-filters';
import { FilmGrid } from '../films/film-grid/film-grid';
import { HeaderMobile } from '@shared/ui/headers/header-mobile/header-mobile';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { LucideListFilter, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-watchlist',
  imports: [HeaderMobile, FilmFilters, FilmGrid, LucideListFilter, LucideX],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist {
  private watchlistService = inject(WatchlistService);
  private filmService = inject(FilmService);

  readonly genres = this.filmService.genres;

  readonly watchlist = this.watchlistService.watchlist;
  readonly isLoading = this.watchlistService.isLoading;
  readonly hasMorePages = this.watchlistService.hasMorePages;

  selectedYear = signal<number | null>(null);
  selectedGenres = signal<number[]>([]);

  topGenres = computed<GenreTMDB[]>(() => {
    const countMap: Record<number, number> = {};
    for (const item of this.watchlist()) {
      if (item.film && item.film.genre_ids) {
        let filmGenresIds = item.film.genre_ids;

        for (const genreId of filmGenresIds) {
          countMap[genreId] = (countMap[genreId] || 0) + 1;
        }
      }
    }

    const top3Ids = Object.keys(countMap)
      .map(Number)
      .sort((a, b) => countMap[b] - countMap[a])
      .slice(0, 3);
    const allGenres = this.genres();

    return top3Ids.map((id) => {
      const found = allGenres.find((g) => g.id === id);
      return found || { id, name: `` };
    });
  });

  hasActiveFilters = computed<boolean>(() => {
    return this.selectedGenres().length > 0 || this.selectedYear() !== null;
  });

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
}
