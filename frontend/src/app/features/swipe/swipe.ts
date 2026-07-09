import {
  Component,
  inject,
  signal,
  computed,
  effect,
  untracked,
  HostListener,
  viewChildren,
} from '@angular/core';
import { SwipeCard } from '@shared/ui/swipe-card/swipe-card';
import { FilmService } from '@core/services/film.service';
import { SwipeService } from '@core/services/swipe.service';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { getTmdbImageUrl, TmdbImagePipe } from '@shared/pipes/tmdb-image.pipe';
import { Router } from '@angular/router';
import { Card } from '@shared/ui/card/card';
import { WatchlistService } from '@core/services/watchlist.service';
import { ButtonDesktopKey } from '@shared/ui/button-desktop-key/button-desktop-key';
import { ProviderCard } from '@shared/ui/provider-card/provider-card';
import { PersonItem } from '@shared/ui/person-item/person-item';
import { LucideThumbsDown, LucideThumbsUp, LucideEye } from '@lucide/angular';
import { getWatchProvidersList } from '@shared/utils/watch-providers.util';
import { FilmTier } from '@core/repositories/review.repository';
import { ReviewService } from '@core/services/review.service';
import { delay, timeout } from 'rxjs';

@Component({
  selector: 'app-swipe',
  imports: [
    SwipeCard,
    Card,
    PersonItem,
    LucideThumbsDown,
    LucideThumbsUp,
    LucideEye,
    ButtonDesktopKey,
    ProviderCard,
  ],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css',
  host: {
    class: 'flex-1',
  },
})
export class Swipe {
  private filmService = inject(FilmService);
  private swipeService = inject(SwipeService);
  private watchlistService = inject(WatchlistService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);

  swipeCards = viewChildren(SwipeCard);

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

  showAllProviders = signal<boolean>(false);

  showAllProvidersLabel = computed(() => {
    return this.showAllProviders() ? 'Ver menos' : `Ver más (+${this.watchProviders().length - 6})`;
  });

  watchProviders = computed(() => {
    const film = this.activeFilm();
    return getWatchProvidersList(film?.watch_providers);
  });

  visibleProviders = computed(() => {
    if (this.showAllProviders()) {
      return this.watchProviders();
    }
    return this.watchProviders().slice(0, 6);
  });

  toggleShowAll() {
    this.showAllProviders.update((v) => !v);
  }

  bgImageA = signal<string>('');
  bgImageB = signal<string>('');
  isLayerAActive = signal<boolean>(true);
  isFirstLoad = signal<boolean>(true);

  showCover = this.swipeService.showCover;
  shouldAnimateBackdrop = signal(false);

  openTierOnActiveCard() {
    const cards = this.swipeCards();
    if (cards.length > 0 && !this.showCover()) {
      const topCard = cards[cards.length - 1];
      topCard.openTier();
    }
  }

  constructor() {
    effect(() => {
      if (this.showCover()) {
        return;
      }
      const film = this.activeFilm();
      if (film) {
        const imageUrl = getTmdbImageUrl(film.poster_path, 'w500');
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

  async onSwiped(direction: 'left' | 'right', film: FilmTMDB) {
    this.swipeService.advanceIndex();

    const swipeDirection = direction === 'right' ? 'like' : 'dislike';
    this.swipeService.recordSwipe(film, swipeDirection, this.genres()).catch(console.error);

    if (swipeDirection === 'like') {
      this.watchlistService.addToWatchlist(film).catch(console.error);
    }

    const remaining = this.allFilms().length - this.currentIndex();
    if (remaining < 10) {
      this.swipeService.getRecommendations(20).catch(console.error);
    }
  }

  getCardTransform(index: number, total: number): string {
    const distanceFromTop = total - 1 - index;
    if (distanceFromTop <= 0) return 'translate(0px, 0px) scale(1)';

    const scale = 1 - distanceFromTop * 0.05;
    return `scale(${scale})`;
  }

  getCardFilter(index: number, total: number): string {
    const distanceFromTop = total - 1 - index;
    if (distanceFromTop <= 0) return 'brightness(1)';
    const brightness = 1 - distanceFromTop * 0.45;
    return `brightness(${brightness})`;
  }

  onCoverSwiped() {
    this.shouldAnimateBackdrop.set(true);
    this.swipeService.setCoverShown();
  }

  onFilmClick(film: any) {
    this.router.navigate(['/films', film.id], { state: { film } });
  }

  onFilmWatched(tier: FilmTier) {
    const film = this.activeFilm();
    if (!film) return;
    this.reviewService.upsertReview({ film, tier });

    const swipeDirection = tier === 'AMAZING' || tier === 'GOOD' ? 'like' : 'dislike';
    this.swipeService.recordSwipe(film, swipeDirection, this.genres()).catch(console.error);

    setTimeout(() => {
      this.swipeService.advanceIndex();
      const remaining = this.allFilms().length - this.currentIndex();
      if (remaining < 10) {
        this.swipeService.getRecommendations(20).catch(console.error);
      }
    }, 500);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key === 'd') {
      this.swipe('right');
    } else if (key === 'a') {
      this.swipe('left');
    } else if (key === 's') {
      if (!this.showCover()) {
        this.getTopCard()?.openTier();
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
    const cards = this.swipeCards();
    return cards[cards.length - 1];
  }
}
