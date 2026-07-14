import { Component, signal, effect, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { YearPicker } from '@shared/ui/year-picker/year-picker';
import { Button } from '@shared/ui/button/button';
import { Sidebar } from '@shared/ui/sidebar/sidebar';
import { isViewportAtLeast } from '@shared/utils/responsive.util';

@Component({
  selector: 'app-film-filters',
  imports: [NgClass, YearPicker, Button, Sidebar],
  templateUrl: './film-filters.html',
})
export class FilmFilters {
  genres = input<GenreTMDB[]>([]);
  selectedGenres = input<number[]>([]);
  selectedYear = input<number | null>(null);

  apply = output<{ genres: number[]; year: number | null }>();

  localGenres: number[] = [];
  localYear: number | null = null;
  showSidebar = signal(isViewportAtLeast('MD', false));

  constructor() {
    effect(() => {
      this.localGenres = [...(this.selectedGenres() || [])];
    });
    effect(() => {
      this.localYear = this.selectedYear();
    });
  }

  toggleGenre(genreId: number) {
    if (this.localGenres.includes(genreId)) {
      this.localGenres = this.localGenres.filter((id) => id !== genreId);
    } else {
      this.localGenres = [...this.localGenres, genreId];
    }
  }

  onYearChange(year: number | null) {
    if (year) {
      this.localYear = year;
    } else {
      this.apply.emit({
        genres: this.localGenres,
        year: null,
      });
    }
  }

  onApply() {
    this.apply.emit({
      genres: this.localGenres,
      year: this.localYear,
    });
  }

  onClear() {
    this.localGenres = [];
    this.localYear = null;
    this.apply.emit({
      genres: [],
      year: null,
    });
  }

  onToggleSidebar() {
    this.showSidebar.set(!this.showSidebar());
  }

  get isVisibleSidebar() {
    return this.showSidebar();
  }
}
