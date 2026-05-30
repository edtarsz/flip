import { Component, OnInit, inject, signal, computed, effect, untracked } from '@angular/core';
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { FilmService } from '@core/services/film.service';
import { LucideEye } from '@lucide/angular';
import { WatchlistService } from '@core/services/watchlist.service';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { getTmdbImageUrl } from '../../shared/pipes/tmdb-image.pipe';
import { Router } from '@angular/router';
import { Separator } from "@shared/ui/separator/separator";


@Component({
  selector: 'app-swipe',
  imports: [SwipeCard, Separator],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css'
})
export class Swipe implements OnInit {
  private filmService = inject(FilmService);
  private watchlistService = inject(WatchlistService);

  private router = inject(Router);

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
        const imageUrl = getTmdbImageUrl(film.poster_path, 'w1280');
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
    const brightness = 1 - distanceFromTop * 0.45;
    return `brightness(${brightness})`;
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }
}

