import { Component, afterNextRender, inject, OnDestroy, signal, effect } from '@angular/core';
import { CardFeatures } from '@shared/ui/card-features/card-features';
import { Button } from '@shared/ui/button/button';
import { SwipeCard } from '@shared/ui/swipe-card/swipe-card';
import { Separator } from '@shared/ui/separator/separator';
import { gsap } from 'gsap';
import { MOCK_GENRES, MOCK_LANDING_FILMS } from '@core/mocks/films.mock';
import { Router } from '@angular/router';
import Lenis from 'lenis';
import { AuthService } from '@core/services/auth.service';
import { FilmCarousel } from '@features/films/film-carousel/film-carousel';
import { FilmService } from '@core/services/film.service';

@Component({
  selector: 'app-index-layout',
  imports: [CardFeatures, Button, SwipeCard, FilmCarousel],
  templateUrl: './index-layout.html',
  styleUrl: './index-layout.css',
})
export class IndexLayout implements OnDestroy {
  private authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;

  private filmService = inject(FilmService);
  readonly films = this.filmService.films;

  private router = inject(Router);
  private localLenis?: Lenis;
  private rafId?: number;

  private initTimeoutId?: any;
  private swipeTimeoutId?: any;
  private activeTimeline?: gsap.core.Timeline;

  readonly genres = this.filmService.genres;

  showAll = signal(false);
  searchModel = signal<string>('');

  currentPage = signal(1);
  loadingNextPage = signal(false);
  hasMorePages = signal(true);

  toggledSidebar = signal(false);

  mockGenres = MOCK_GENRES;
  mockFilms = MOCK_LANDING_FILMS;

  constructor() {
    afterNextRender(() => {
      const scrollableMain = document.querySelector('main[data-lenis-prevent]') as HTMLElement;
      if (scrollableMain) {
        this.localLenis = new Lenis({
          wrapper: scrollableMain,
          content: (scrollableMain.firstElementChild as HTMLElement) || scrollableMain,
          autoRaf: false,
        });

        const update = (time: number) => {
          this.localLenis?.raf(time);
          this.rafId = requestAnimationFrame(update);
        };
        this.rafId = requestAnimationFrame(update);
      }
    });

    effect(() => {
      const authenticated = this.isAuthenticated();
      this.cleanupSwipeAnimation();

      if (!authenticated) {
        this.initTimeoutId = setTimeout(() => {
          this.initSwipeAnimation();
        }, 50);
      }
    });
  }

  loadNextPage() {
    if (this.loadingNextPage() || !this.hasMorePages()) return;

    this.loadingNextPage.set(true);
    const nextPage = this.currentPage() + 1;

    this.filmService
      .getFilms({
        query: this.searchModel(),
        page: nextPage,
      })
      // .pipe(delay(1000000))
      .subscribe({
        next: (data) => {
          this.currentPage.set(nextPage);
          if (!data.results || data.results.length === 0 || nextPage >= data.total_pages) {
            this.hasMorePages.set(false);
          }
        },
        error: () => {
          this.loadingNextPage.set(false);
        },
        complete: () => {
          this.loadingNextPage.set(false);
        },
      });
  }

  ngOnDestroy() {
    this.cleanupSwipeAnimation();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.localLenis) {
      this.localLenis.destroy();
    }
  }

  private cleanupSwipeAnimation() {
    if (this.initTimeoutId) {
      clearTimeout(this.initTimeoutId);
      this.initTimeoutId = undefined;
    }
    if (this.swipeTimeoutId) {
      clearTimeout(this.swipeTimeoutId);
      this.swipeTimeoutId = undefined;
    }
    if (this.activeTimeline) {
      this.activeTimeline.kill();
      this.activeTimeline = undefined;
    }
    gsap.killTweensOf('.landing-card');
    gsap.killTweensOf('.like-badge');
    gsap.killTweensOf('.nope-badge');
  }

  private initSwipeAnimation() {
    const cards = Array.from(document.querySelectorAll('.landing-card')) as HTMLElement[];
    if (cards.length === 0) return;

    let stack = [...cards];

    const swipeDirections = ['right', 'right', 'left', 'right'];
    let swipeIndex = 0;

    const setInitialPositions = () => {
      stack.forEach((card, idx) => {
        const dist = 4 - idx;
        const x = dist * 20;
        const scale = 1 - dist * 0.04;
        const brightness = dist === 0 ? 1 : Math.max(0.3, 1 - dist * 0.15);

        gsap.set(card, {
          x: x,
          y: 0,
          rotation: 0,
          scale: scale,
          opacity: 1,
          filter: `brightness(${brightness})`,
          zIndex: idx,
        });

        const like = card.querySelector('.like-badge');
        const nope = card.querySelector('.nope-badge');
        if (like) gsap.set(like, { scale: 0 });
        if (nope) gsap.set(nope, { scale: 0 });
      });
    };

    setInitialPositions();

    const performSwipe = () => {
      const topCard = stack[stack.length - 1];
      if (!topCard) return;
      const direction = swipeDirections[swipeIndex % swipeDirections.length];
      swipeIndex++;

      gsap.set(topCard, { zIndex: 5 });

      const likeBadge = topCard.querySelector('.like-badge') as HTMLElement;
      const nopeBadge = topCard.querySelector('.nope-badge') as HTMLElement;
      const activeBadge = direction === 'right' ? likeBadge : nopeBadge;

      const targetX = direction === 'right' ? 500 : -500;
      const targetRot = direction === 'right' ? 5 : -5;

      this.activeTimeline = gsap.timeline({
        onComplete: () => {
          const popped = stack.pop();
          if (popped) stack.unshift(popped);

          gsap.set(topCard, {
            x: 80,
            y: 0,
            rotation: 0,
            scale: 0.84,
            filter: 'brightness(0.4)',
            zIndex: 0,
            opacity: 0,
          });
          gsap.to(topCard, { opacity: 1, duration: 0.5 });

          if (likeBadge) gsap.set(likeBadge, { scale: 0 });
          if (nopeBadge) gsap.set(nopeBadge, { scale: 0 });

          this.swipeTimeoutId = setTimeout(performSwipe, 500);
        },
      });

      this.activeTimeline
        .to(topCard, {
          x: direction === 'right' ? 40 : -40,
          rotation: targetRot,
          duration: 0.6,
          ease: 'power1.out',
        })
        .to(activeBadge, { scale: 1.2, duration: 0.3 }, '<')
        .to(topCard, { x: targetX, rotation: 0, opacity: 0, duration: 0.5, ease: 'power2.in' })
        .to(activeBadge, { scale: 0, duration: 0.2 }, '<');

      for (let i = 0; i < stack.length - 1; i++) {
        const card = stack[i];
        const newIdx = i + 1;
        const dist = 4 - newIdx;
        const newX = dist * 20;
        const newScale = 1 - dist * 0.04;
        const newBrightness = dist === 0 ? 1 : Math.max(0.3, 1 - dist * 0.15);

        gsap.set(card, { zIndex: newIdx });

        this.activeTimeline.to(
          card,
          {
            x: newX,
            scale: newScale,
            filter: `brightness(${newBrightness})`,
            duration: 0.5,
            ease: 'power2.out',
          },
          '<',
        );
      }
    };

    this.swipeTimeoutId = setTimeout(performSwipe, 500);
  }

  onExplore() {
    this.router.navigate(['/films']);
  }
}
