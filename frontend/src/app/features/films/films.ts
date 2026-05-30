import { Component, inject, signal, OnInit } from '@angular/core';
import { FilmService } from '@core/services/film.service';
import { Separator } from "@shared/ui/separator/separator";
import { FilmFilters } from './film-filters/film-filters';
import { FilmSearchBar } from './film-search-bar/film-search-bar';
import { FilmGrid } from './film-grid/film-grid';
import { FilmCarousel } from './film-carousel/film-carousel';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-films',
  imports: [
    Separator,
    FilmFilters,
    FilmSearchBar,
    FilmGrid,
    FilmCarousel],
  templateUrl: './films.html',
  styleUrl: './films.css',
})
export class Films implements OnInit {
  private filmService = inject(FilmService);

  readonly films = this.filmService.films;
  readonly genres = this.filmService.genres;

  selectedYear = signal<number | null>(null);
  selectedGenres = signal<number[]>([]);

  showAll = signal(false);
  searchModel = signal<string>('');

  currentPage = signal(1);
  loadingNextPage = signal(false);
  hasMorePages = signal(true);

  toggledSidebar = signal(false);

  ngOnInit(): void {
    if (this.films().length === 0) {
      this.currentPage.set(1);
      this.hasMorePages.set(true);
      this.filmService.getFilms().subscribe();
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe();
    }
  }

  loadNextPage() {
    if (this.loadingNextPage() || !this.hasMorePages()) return;

    this.loadingNextPage.set(true);
    const nextPage = this.currentPage() + 1;

    this.filmService.getFilms({
      genres: this.selectedGenres(),
      year: this.selectedYear(),
      query: this.searchModel(),
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
    this.searchModel.set('');

    const genres = event ? event.genres : [];
    const year = event ? event.year : null;

    this.selectedGenres.set(genres);
    this.selectedYear.set(year);

    this.currentPage.set(1);
    this.hasMorePages.set(true);

    this.filmService.getFilms({
      genres,
      year
    }).subscribe();

    this.showAll.set(true);
  }

  onSearchSubmitted(query: string) {
    this.selectedGenres.set([]);
    this.selectedYear.set(null);

    this.currentPage.set(1);
    this.hasMorePages.set(true);

    this.filmService.getFilms({ query }).subscribe();

    this.showAll.set(true);
  }

  onSeeAll() {
    this.showAll.set(!this.showAll());
  }

  onReset() {
    this.searchModel.set('');
    this.applyFilters();
  }

  toggled() {
    this.toggledSidebar.set(!this.toggledSidebar());
  }

  get rosalia() {
    return this.showAll() ? 'Go Back' : 'See All';
  }

  get isVisibleSidebar() {
    return this.toggledSidebar();
  }
}
