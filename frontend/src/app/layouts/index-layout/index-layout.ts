import { Component, afterNextRender, inject, OnDestroy, signal, OnInit } from '@angular/core';
import { CardFeatures } from "@shared/ui/card-features/card-features";
import { Button } from "@shared/ui/button/button";
import { SwipeCard } from "@shared/ui/swipe-card/swipe-card";
import { Separator } from '@shared/ui/separator/separator';
import { gsap } from 'gsap';
import { MOCK_GENRES, MOCK_LANDING_FILMS } from '@core/mocks/films.mock';
import { Router } from '@angular/router';
import Lenis from 'lenis';
import { AuthService } from '@core/services/auth.service';
import { FilmCarousel } from "@features/films/film-carousel/film-carousel";
import { FilmService } from '@core/services/film.service';

@Component({
  selector: 'app-index-layout',
  imports: [CardFeatures, Button, SwipeCard, Separator, FilmCarousel],
  templateUrl: './index-layout.html',
  styleUrl: './index-layout.css',
})
export class IndexLayout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;

  private filmService = inject(FilmService);
  readonly films = this.filmService.films;

  private router = inject(Router);
  private localLenis?: Lenis;
  private rafId?: number;

  readonly genres = this.filmService.genres;

  showAll = signal(false);
  searchModel = signal<string>('');

  currentPage = signal(1);
  loadingNextPage = signal(false);
  hasMorePages = signal(true);

  toggledSidebar = signal(false);

  mockGenres = MOCK_GENRES;
  mockFilms = MOCK_LANDING_FILMS;

  ngOnInit(): void {
    if (this.films().length === 0) {
      this.currentPage.set(1);
      this.hasMorePages.set(true);
      this.filmService.getFilms().subscribe();
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe();
    }
  }

  constructor() {
    afterNextRender(() => {
      const scrollableMain = document.querySelector('main[data-lenis-prevent]') as HTMLElement;
      if (scrollableMain) {
        this.localLenis = new Lenis({
          wrapper: scrollableMain,
          content: scrollableMain.firstElementChild as HTMLElement || scrollableMain,
          autoRaf: false
        });

        const update = (time: number) => {
          this.localLenis?.raf(time);
          this.rafId = requestAnimationFrame(update);
        };
        this.rafId = requestAnimationFrame(update);
      }

      this.initSwipeAnimation();
    });
  }

  loadNextPage() {
    if (this.loadingNextPage() || !this.hasMorePages()) return;

    this.loadingNextPage.set(true);
    const nextPage = this.currentPage() + 1;

    this.filmService.getFilms({
      query: this.searchModel(),
      page: nextPage
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
        }
      });
  }

  ngOnDestroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.localLenis) {
      this.localLenis.destroy();
    }
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
          zIndex: idx
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
      const direction = swipeDirections[swipeIndex % swipeDirections.length];
      swipeIndex++;

      gsap.set(topCard, { zIndex: 5 });

      const likeBadge = topCard.querySelector('.like-badge') as HTMLElement;
      const nopeBadge = topCard.querySelector('.nope-badge') as HTMLElement;
      const activeBadge = direction === 'right' ? likeBadge : nopeBadge;

      const targetX = direction === 'right' ? 500 : -500;
      const targetRot = direction === 'right' ? 5 : -5;

      const swipeTl = gsap.timeline({
        onComplete: () => {
          stack.unshift(stack.pop()!);

          gsap.set(topCard, {
            x: 80,
            y: 0,
            rotation: 0,
            scale: 0.84,
            filter: 'brightness(0.4)',
            zIndex: 0,
            opacity: 0
          });
          gsap.to(topCard, { opacity: 1, duration: 0.5 });

          if (likeBadge) gsap.set(likeBadge, { scale: 0 });
          if (nopeBadge) gsap.set(nopeBadge, { scale: 0 });

          setTimeout(performSwipe, 500);
        }
      });

      swipeTl.to(topCard, { x: direction === 'right' ? 40 : -40, rotation: targetRot, duration: 0.6, ease: 'power1.out' })
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

        swipeTl.to(card, {
          x: newX,
          scale: newScale,
          filter: `brightness(${newBrightness})`,
          duration: 0.5,
          ease: 'power2.out'
        }, '<');
      }
    };

    setTimeout(performSwipe, 500);
  }

  onExplore() {
    this.router.navigate(['/films']);
  }
}

