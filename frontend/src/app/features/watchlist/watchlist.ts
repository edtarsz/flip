import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { WatchlistService } from '@core/services/watchlist.service';
import { FilmService } from '@core/services/film.service';
import { FilmFilters } from '../films/film-filters/film-filters';
import { FilmGrid } from '../films/film-grid/film-grid';
import { HeaderMobile } from "@shared/ui/headers/header-mobile/header-mobile";
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { LucideChevronsUpDown } from '@lucide/angular';

@Component({
  selector: 'app-watchlist',
  imports: [HeaderMobile, FilmFilters, FilmGrid, LucideChevronsUpDown],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnInit {
  private watchlistService = inject(WatchlistService);
  private filmService = inject(FilmService);

  readonly genres = this.filmService.genres;

  readonly watchlist = this.watchlistService.watchlist;
  readonly isLoading = this.watchlistService.isLoading;
  readonly hasMorePages = this.watchlistService.hasMorePages;

  selectedYear = signal<number | null>(null);
  selectedGenres = signal<number[]>([]);

  filteredWatchlistAsFilms = computed<FilmTMDB[]>(() => {
    let items = this.watchlist();
    const year = this.selectedYear();
    const genres = this.selectedGenres();
    
    if (year !== null) {
      items = items.filter(item => {
        if (!item.film.release_date) return false;
        return item.film.release_date.startsWith(year.toString());
      });
    }

    if (genres.length > 0) {
      items = items.filter(item => {
        if (!item.film.genre_ids || item.film.genre_ids.length === 0) return false;
        return genres.every(g => item.film.genre_ids?.includes(g));
      });
    }

    return items.map(item => ({
      ...item.film,
      id: item.film.external_film_id
    })) as unknown as FilmTMDB[];
  });

  loadNextPage() {
    this.watchlistService.getWatchlist(this.watchlistService.currentPage() + 1);
  }

  ngOnInit(): void {
    this.watchlistService.getWatchlist();
    if (this.genres().length === 0) {
      this.filmService.getGenres();
    }
  }

  applyFilters(filters: { genres: number[]; year: number | null }) {
    this.selectedGenres.set(filters.genres);
    this.selectedYear.set(filters.year);
  }
}
