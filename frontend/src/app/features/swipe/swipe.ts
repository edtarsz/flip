import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { FilmService } from '@core/services/film.service';
import { LucideEye } from '@lucide/angular';
import { WatchlistService } from '@core/services/watchlist.service';

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

  visibleFilms = computed(() => {
    const films = this.allFilms();
    const start = this.currentIndex();
    return films.slice(start, start + 3).reverse();
  });

  ngOnInit() {
    if (this.allFilms().length === 0) {
      this.filmService.getFilms().subscribe();
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe();
    }
  }

  async onSwiped(direction: 'left' | 'right', filmId: number) {
    console.log(direction);
    if (direction === 'right') {
      await this.watchlistService.addToWatchlist(filmId);
    }
    this.currentIndex.update(idx => idx + 1);
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

