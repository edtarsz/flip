import { Component, OnInit, inject, signal, computed, effect, untracked, ViewChildren, QueryList, HostListener } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { FilmService } from '@core/services/film.service';
import { SwipeService } from '@core/services/swipe.service';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { getTmdbImageUrl } from '../../shared/pipes/tmdb-image.pipe';
import { Router } from '@angular/router';
import { Card } from "@shared/ui/card/card";
import { WatchlistService } from '@core/services/watchlist.service';
import { HeaderMobile } from '@shared/ui/headers/header-mobile/header-mobile';
import { PersonItem } from "@shared/ui/person-item/person-item";
import { LucideThumbsDown, LucideThumbsUp, LucideEye } from '@lucide/angular';

@Component({
  selector: 'app-swipe',
  imports: [SwipeCard, Card, HeaderMobile, PersonItem, LucideThumbsDown, LucideThumbsUp, LucideEye],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css',
  host: {
    class: 'flex-1'
  }
})
export class Swipe implements OnInit {
  private filmService = inject(FilmService);
  private swipeService = inject(SwipeService);
  private watchlistService = inject(WatchlistService);
  private router = inject(Router);

  @ViewChildren(SwipeCard) swipeCards!: QueryList<SwipeCard>;

  readonly allFilms = this.swipeService.recommendations;
  readonly genres = this.filmService.genres;
  readonly currentIndex = this.swipeService.currentIndex;

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
  isFirstLoad = signal<boolean>(true);

  showCover = this.swipeService.showCover;
  shouldAnimateBackdrop = signal(false);

  constructor() {
    effect(() => {
      if (this.showCover()) {
        return;
      }
      const film = this.activeFilm();
      if (film) {
        const imageUrl = getTmdbImageUrl(film.poster_path, 'w1280');
        untracked(() => {
          if (this.isFirstLoad()) {
            this.bgImageA.set(imageUrl);
            this.isLayerAActive.set(true);
            setTimeout(() => this.isFirstLoad.set(false), 0);
          } else {
            this.updateBackground(imageUrl);
          }
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
    const existing = this.allFilms();
    const remaining = existing.length - this.currentIndex();

    if (remaining < 10) {
      this.swipeService.getRecommendations().catch(console.error);
    }
  }

  async onSwiped(direction: 'left' | 'right', film: FilmTMDB) {
    this.swipeService.advanceIndex();

    const swipeDirection = direction === 'right' ? 'like' : 'dislike';
    this.swipeService.recordSwipe(film, swipeDirection, this.genres()).catch(console.error);

    if (swipeDirection === 'like') {
      this.watchlistService.addToWatchlist(film).catch(console.error);
    }

    const remaining = this.allFilms().length - this.currentIndex();
    if (remaining < 10) {
      this.swipeService.getRecommendations().catch(console.error);
    }
  }

  getCardTransform(index: number, total: number): string {
    const distanceFromTop = (total - 1) - index;
    if (distanceFromTop <= 0) return 'translate(0px, 0px) scale(1)';

    const scale = 1 - distanceFromTop * 0.05;
    return `scale(${scale})`;
  }

  getCardFilter(index: number, total: number): string {
    const distanceFromTop = (total - 1) - index;
    if (distanceFromTop <= 0) return 'brightness(1)';
    const brightness = 1 - distanceFromTop * 0.45;
    return `brightness(${brightness})`;
  }

  onCoverSwiped() {
    this.shouldAnimateBackdrop.set(true);
    this.swipeService.setCoverShown();
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key === 'd') {
      this.swipe('right');
    } else if (key === 'a') {
      this.swipe('left');
    } else if (key === 's') {
      const film = this.activeFilm();
      if (film && !this.showCover()) {
        this.onFilmClick(film.id);
      }
    }
  }

  swipe(direction: 'left' | 'right'): void {
    const topCard = this.getTopCard();
    if (topCard) {
      topCard.swipe(direction);
    }
  }

  private getTopCard(): SwipeCard | undefined {
    const cards = this.swipeCards.toArray();
    return cards[cards.length - 1];
  }
}
