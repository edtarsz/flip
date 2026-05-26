import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FilmTMDB, WatchlistFilmTMDB } from '@core/types/tmdb/film.type';
import { LucideStar } from '@lucide/angular';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-film',
  imports: [LucideStar, DecimalPipe, DatePipe, TmdbImagePipe],
  templateUrl: './film.html',
  styleUrl: './film.css',
})
export class Film {
  @Input() film!: FilmTMDB | WatchlistFilmTMDB;
  @Input() loading: boolean = false;
}
