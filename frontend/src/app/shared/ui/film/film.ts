import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { FilmTMDB, WatchlistFilmTMDB } from '@core/types/tmdb/film.type';
import { LucideImage, LucideStar } from '@lucide/angular';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-film',
  imports: [LucideStar, DecimalPipe, DatePipe, TmdbImagePipe, LucideImage],
  templateUrl: './film.html',
  styleUrl: './film.css',
})
export class Film {
  film = input<FilmTMDB | WatchlistFilmTMDB>();
  loading = input<boolean>(false);
  isPriority = input<boolean>(false);
}
