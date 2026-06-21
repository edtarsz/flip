import { Component, inject, signal, OnInit } from '@angular/core';
import { FilmService } from '@core/services/film.service';
import { Separator } from "@shared/ui/separator/separator";
import { FilmFilters } from './film-filters/film-filters';
import { FilmSearchBar } from './film-search-bar/film-search-bar';
import { FilmGrid } from './film-grid/film-grid';
import { isViewportAtLeast } from '@shared/utils/responsive.util';

@Component({
  selector: 'app-films',
  imports: [
    FilmFilters,
    FilmSearchBar,
    FilmGrid],
  templateUrl: './films.html',
  styleUrl: './films.css',
})
export class Films implements OnInit {
  private filmService = inject(FilmService);

  readonly films = this.filmService.films;
  readonly genres = this.filmService.genres;

  selectedYear = this.filmService.selectedYear;
  selectedGenres = this.filmService.selectedGenres;

  searchModel = this.filmService.searchModel;
  submittedQuery = this.filmService.submittedQuery;

  currentPage = this.filmService.currentPage;
  loadingNextPage = signal(false);
  hasMorePages = this.filmService.hasMorePages;

  toggledSidebar = signal(isViewportAtLeast(768, false));

  ngOnInit(): void {
    if (this.films().length === 0) {
      this.currentPage.set(1);
      this.hasMorePages.set(true);
      this.loadingNextPage.set(true);
      this.filmService.getFilms().subscribe({
        complete: () => this.loadingNextPage.set(false),
        error: () => this.loadingNextPage.set(false)
      });
    }
  }

  loadNextPage() {
    if (this.loadingNextPage() || !this.hasMorePages()) return;

    this.loadingNextPage.set(true);
    const nextPage = this.currentPage() + 1;

    this.filmService.getFilms({
      genres: this.selectedGenres(),
      year: this.selectedYear(),
      query: this.submittedQuery(),
      page: nextPage
    })
      // .pipe(delay(1000000))
      .subscribe({
        next: (data) => {
          this.currentPage.set(nextPage);
          if (!data.results || data.results.length === 0 || nextPage >= data.total_pages) {
            this.hasMorePages.set(false);
          }
        },
        error: () => {
          this.loadingNextPage.set(false);
        },
        complete: () => {
          this.loadingNextPage.set(false);
        }
      });
  }

  applyFilters(event?: { genres: number[]; year: number | null }) {
    const genres = event ? event.genres : [];
    const year = event ? event.year : null;

    const currentGenres = this.selectedGenres();
    const currentYear = this.selectedYear();

    const genresUnchanged = genres.length === currentGenres.length && 
                            genres.every(g => currentGenres.includes(g));
    const yearUnchanged = year === currentYear;

    if (genresUnchanged && yearUnchanged) {
      return;
    }

    const isApplyingFilter = genres.length > 0 || year !== null;
    if (isApplyingFilter) {
      this.searchModel.set('');
      this.submittedQuery.set('');
    }

    this.selectedGenres.set(genres);
    this.selectedYear.set(year);

    this.currentPage.set(1);
    this.hasMorePages.set(true);
    this.loadingNextPage.set(true);

    this.filmService.getFilms({
      genres: this.selectedGenres(),
      year: this.selectedYear(),
      query: this.submittedQuery()
    }).subscribe({
      complete: () => this.loadingNextPage.set(false),
      error: () => this.loadingNextPage.set(false)
    });
  }

  onSearchSubmitted(query: string) {
    if (query === this.submittedQuery()) {
      return;
    }

    if (query.trim().length > 0) {
      this.selectedGenres.set([]);
      this.selectedYear.set(null);
    }

    this.submittedQuery.set(query);

    this.currentPage.set(1);
    this.hasMorePages.set(true);
    this.loadingNextPage.set(true);

    this.filmService.getFilms({
      genres: this.selectedGenres(),
      year: this.selectedYear(),
      query: this.submittedQuery()
    }).subscribe({
      complete: () => this.loadingNextPage.set(false),
      error: () => this.loadingNextPage.set(false)
    });
  }

  onReset() {
    this.searchModel.set('');
    
    if (this.submittedQuery() === '') {
      return;
    }

    this.submittedQuery.set('');

    this.currentPage.set(1);
    this.hasMorePages.set(true);
    this.loadingNextPage.set(true);

    this.filmService.getFilms({
      genres: this.selectedGenres(),
      year: this.selectedYear(),
      query: this.submittedQuery()
    }).subscribe({
      complete: () => this.loadingNextPage.set(false),
      error: () => this.loadingNextPage.set(false)
    });
  }

  get isVisibleSidebar() {
    return this.toggledSidebar();
  }
}
