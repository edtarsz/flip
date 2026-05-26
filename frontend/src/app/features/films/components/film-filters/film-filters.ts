import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { Separator } from '@shared/ui/separator/separator';
import { YearPicker } from '@shared/ui/year-picker/year-picker';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-film-filters',
  imports: [NgClass, Separator, YearPicker, Button],
  templateUrl: './film-filters.html',
})
export class FilmFilters implements OnChanges {
  @Input() genres: GenreTMDB[] = [];
  @Input() selectedGenres: number[] = [];
  @Input() selectedYear: number | null = null;

  @Output() apply = new EventEmitter<{ genres: number[]; year: number | null }>();

  localGenres: number[] = [];
  localYear: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedGenres']) {
      this.localGenres = [...(changes['selectedGenres'].currentValue || [])];
    }
    if (changes['selectedYear']) {
      this.localYear = changes['selectedYear'].currentValue;
    }
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
}
