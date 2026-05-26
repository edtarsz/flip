import { Component, OnInit, inject, signal, computed, effect, untracked } from '@angular/core';
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { FilmService } from '@core/services/film.service';
import { LucideEye } from '@lucide/angular';
import { WatchlistService } from '@core/services/watchlist.service';
import { FilmTMDB } from '@core/types/tmdb/film.type';


@Component({
  selector: 'app-swipe',
  imports: [SwipeCard],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css'
})
export class Swipe implements OnInit {
  private filmService = inject(FilmService);
  private watchlistService = inject(WatchlistService);

  readonly allFilms = this.filmService.films;
  readonly genres = this.filmService.genres;

  currentIndex = signal(0);

  activeFilm = computed(() => {
    const films = this.allFilms();
    const start = this.currentIndex();
    return films[start] || null;
  });

  visibleFilms = computed(() => {
    const films = this.allFilms();
    const start = this.currentIndex();
    return films.slice(start, start + 3).reverse();
  });

  bgImageA = signal<string>('');
  bgImageB = signal<string>('');
  isLayerAActive = signal<boolean>(true);

  constructor() {
    effect(() => {
      const film = this.activeFilm();
      if (film) {
        const imageUrl = film.poster_path
          ? `https://image.tmdb.org/t/p/w1280${film.poster_path}`
          : '';
        untracked(() => {
          this.updateBackground(imageUrl);
        });
      }
    });
  }

  private updateBackground(newUrl: string) {
    if (this.isLayerAActive()) {
      this.bgImageB.set(newUrl);
      this.isLayerAActive.set(false);
    } else {
      this.bgImageA.set(newUrl);
      this.isLayerAActive.set(true);
    }
  }

  ngOnInit() {
    if (this.allFilms().length === 0) {
      this.filmService.getFilms().subscribe();
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe();
    }
  }

  async onSwiped(direction: 'left' | 'right', film: FilmTMDB) {
    this.currentIndex.update(idx => idx + 1);
    console.log(direction);

    if (direction === 'right') {
      await this.watchlistService.addToWatchlist(film);
    }
  }

  getCardTransform(index: number, total: number): string {
    const distanceFromTop = (total - 1) - index;
    if (distanceFromTop <= 0) return 'translate(0px, 0px) scale(1)';

    const scale = 1 - distanceFromTop * 0.05;
    const translateY = distanceFromTop * 18;
    return `translateY(${translateY}px) scale(${scale})`;
  }

  getCardFilter(index: number, total: number): string {
    const distanceFromTop = (total - 1) - index;
    if (distanceFromTop <= 0) return 'brightness(1)';
    const brightness = 1 - distanceFromTop * 0.15;
    return `brightness(${brightness})`;
  }
}

