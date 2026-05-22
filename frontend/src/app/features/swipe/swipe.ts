import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { FilmService } from '@core/services/film.service';
import { LucideEye } from '@lucide/angular';

@Component({
  selector: 'app-swipe',
  imports: [SwipeCard],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css'
})
export class Swipe implements OnInit {
  private filmService = inject(FilmService);

  readonly allFilms = this.filmService.films;
  readonly genres = this.filmService.genres;

  currentIndex = signal(0);

  visibleFilms = computed(() => {
    const films = this.allFilms();
    console.log('visibleFilms computed re-evaluating. Count:', films.length, 'Index:', this.currentIndex());
    const start = this.currentIndex();
    return films.slice(start, start + 3).reverse();
  });

  ngOnInit() {
    console.log('Swipe component ngOnInit. Initial films in service:', this.allFilms());
    if (this.allFilms().length === 0) {
      console.log('Service films is empty. Sending API request...');
      this.filmService.getFilms().subscribe({
        next: (data) => {
          console.log('API getFilms successful! Response results count:', data?.results?.length);
          console.log('Films in service after set:', this.allFilms());
        },
        error: (err) => {
          console.error('API getFilms failed in Swipe ngOnInit:', err);
        }
      });
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe({
        next: (data) => console.log('API getGenres successful! Count:', data?.genres?.length),
        error: (err) => console.error('API getGenres failed:', err)
      });
    }
  }

  onSwiped(direction: 'left' | 'right', filmId: number) {
    console.log(`Swiped ${direction} on film ID: ${filmId}`);
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

