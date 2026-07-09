import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, signal, OnInit } from '@angular/core';
import { FilmTMDB, WatchlistFilmTMDB } from '@core/types/tmdb/film.type';
import { LucideImage, LucideStar } from '@lucide/angular';
import { getTmdbImageUrl } from '../../pipes/tmdb-image.pipe';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { isImageLoaded, markImageLoaded } from '@shared/utils/image-cache.util';

@Component({
  selector: 'app-film',
  imports: [LucideStar, DecimalPipe, DatePipe, LucideImage, Skeleton],
  templateUrl: './film.html',
  styleUrl: './film.css',
  host: {
    '[class.hide-details]': 'hideFilmDetails()',
  }
})
export class Film implements OnInit {
  film = input<FilmTMDB | WatchlistFilmTMDB>();
  loading = input<boolean>(false);
  isPriority = input<boolean>(false);
  hideFilmDetails = input<boolean>(false);

  posterLoaded = signal<boolean>(false);
  imageUrl = signal<string>('');

  ngOnInit() {
    const posterPath = this.film()?.poster_path;
    if (!posterPath) return;

    const w500Url = getTmdbImageUrl(posterPath, 'w500');
    this.imageUrl.set(w500Url);

    if (isImageLoaded(w500Url)) {
      this.posterLoaded.set(true);
    }
  }

  onImageLoad() {
    this.posterLoaded.set(true);
    markImageLoaded(this.imageUrl());
  }
}
