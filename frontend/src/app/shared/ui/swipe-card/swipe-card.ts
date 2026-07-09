import {
  Component,
  ElementRef,
  afterNextRender,
  input,
  output,
  effect,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideCircle,
  LucideStar,
  LucideThumbsDown,
  LucideThumbsUp,
} from '@lucide/angular';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Separator } from '../separator/separator';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { DatePipe, DecimalPipe } from '@angular/common';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { TmdbImagePipe, getTmdbImageUrl } from '@shared/pipes/tmdb-image.pipe';
import { RuntimePipe } from '@shared/pipes/runtime.pipe';
import { markImageLoaded } from '@shared/utils/image-cache.util';
import { FilmTier } from '@core/repositories/review.repository';
import { WatchedButton } from "../watched-button/watched-button";

const SWIPE_THRESHOLD = 70;
const SWIPE_DURATION = 0.3;
const SNAP_DURATION = 0.5;
const SWIPE_EASE = 'power2.out';
const SNAP_EASE = 'elastic.out(1, 0.5)';

@Component({
  selector: 'app-swipe-card',
  imports: [
    Separator,
    LucideStar,
    DecimalPipe,
    DatePipe,
    LucideCircle,
    LucideThumbsUp,
    LucideThumbsDown,
    RuntimePipe,
    TmdbImagePipe,
    WatchedButton
],
  templateUrl: './swipe-card.html',
  styleUrl: './swipe-card.css',
})
export class SwipeCard implements OnDestroy {
  swipeCard = viewChild<ElementRef<HTMLDivElement>>('swipeCard');
  rotationWrapper = viewChild<ElementRef<HTMLDivElement>>('rotationWrapper');
  innerCard = viewChild<ElementRef<HTMLDivElement>>('innerCard');

  film = input<FilmTMDB | null>(null);
  genres = input<GenreTMDB[]>([]);
  showBg = input<boolean>(true);
  isTop = input<boolean>(true);
  isCover = input<boolean>(false);

  isSeen = signal<boolean>(false);

  swiped = output<'left' | 'right'>();
  clicked = output<void>();
  watched = output<FilmTier>();

  private draggableInstance?: Draggable;
  private hostEl = inject(ElementRef<HTMLElement>);
  private isDestroyed = false;

  constructor() {
    effect(() => {
      const top = this.isTop();
      if (this.draggableInstance) {
        if (top) {
          this.draggableInstance.enable();
        } else {
          this.draggableInstance.disable();
        }
      }
    });

    afterNextRender(() => {
      const inner = this.innerCard()!.nativeElement;
      const rotWrapper = this.rotationWrapper()!.nativeElement;
      const root = this.rotationWrapper()!.nativeElement;
      const likeBadge = !this.isCover()
        ? (root.querySelector('.like-badge') as HTMLElement)
        : null;
      const nopeBadge = !this.isCover()
        ? (root.querySelector('.nope-badge') as HTMLElement)
        : null;
      let savedZIndex = '';
      let dragStarted = false;

      const draggables = Draggable.create(this.swipeCard()!.nativeElement, {
        type: 'x,y',
        zIndexBoost: false,
        minimumMovement: 6,
        dragClickables: false,
        clickableTest: (target: HTMLElement | SVGElement | EventTarget | null) => {
          if (target instanceof Element) {
            return !!(target.closest('button') || target.closest('app-button-feedback'));
          }
          return false;
        },
        onClick: (e) => {
          const target = e.target as HTMLElement;
          if (target && (target.closest('button') || target.closest('app-button-feedback'))) {
            return;
          }
          if (!this.isCover()) {
            this.clicked.emit();
          }
        },
        onDragStart: () => {
          dragStarted = true;
          savedZIndex = this.hostEl.nativeElement.style.zIndex;
          this.hostEl.nativeElement.style.zIndex = '100';
        },
        onDrag: () => {
          const d = this.draggableInstance!;
          const rotation = Math.max(-20, Math.min(20, d.x * 0.1));
          gsap.to(rotWrapper, { rotation, duration: 0.1, overwrite: 'auto' });

          if (this.isCover()) return;

          const progress = Math.min(3, Math.abs(d.x) / SWIPE_THRESHOLD);
          if (d.x > 0) {
            gsap.set(likeBadge, { scale: progress * 1.2, opacity: progress, force3D: false });
            gsap.set(nopeBadge, { scale: 0, opacity: 0, force3D: false });
          } else {
            gsap.set(nopeBadge, { scale: progress * 1.2, opacity: progress, force3D: false });
            gsap.set(likeBadge, { scale: 0, opacity: 0, force3D: false });
          }
        },
        onRelease: () => {
          const d = this.draggableInstance!;
          if (dragStarted) {
            this.hostEl.nativeElement.style.zIndex = savedZIndex;
            dragStarted = false;
          }

          if (Math.abs(d.x) > SWIPE_THRESHOLD) {
            const mult = d.x > 0 ? 1 : -1;
            const swipeDirection = d.x > 0 ? 'right' : 'left';
            gsap
              .timeline({
                onComplete: () => {
                  if (!this.isDestroyed) this.swiped.emit(swipeDirection);
                },
              })
              .to(d.target, {
                x: mult * window.innerWidth,
                y: d.y * 1.5,
                opacity: 0,
                duration: SWIPE_DURATION,
                ease: SWIPE_EASE,
              })
              .to(rotWrapper, { rotation: mult * 45, duration: SWIPE_DURATION, ease: SWIPE_EASE }, '<');
          } else {
            gsap
              .timeline()
              .to(d.target, { x: 0, y: 0, duration: SNAP_DURATION, ease: SNAP_EASE })
              .to(rotWrapper, { rotation: 0, duration: SNAP_DURATION, ease: SNAP_EASE }, '<');

            if (!this.isCover() && likeBadge && nopeBadge) {
              gsap.to([likeBadge, nopeBadge], {
                scale: 0,
                opacity: 0,
                rotation: 0,
                duration: SWIPE_DURATION,
                overwrite: 'auto',
                force3D: false,
              });
            }
          }
        },
      });

      this.draggableInstance = draggables[0];
      if (this.isTop()) {
        this.draggableInstance.enable();
      } else {
        this.draggableInstance.disable();
      }
    });
  }

  getCardImage(): string {
    const film = this.film();
    if (!film) return '';
    const imageUrl = getTmdbImageUrl(film.poster_path, 'original');
    return `linear-gradient(to top, var(--color-background) 0px, var(--color-background) 6px, transparent 100%), url('${imageUrl}')`;
  }

  onPosterLoad() {
    const posterPath = this.film()?.poster_path;
    if (posterPath) {
      markImageLoaded(getTmdbImageUrl(posterPath, 'original'));
    }
  }

  swipe(direction: 'left' | 'right'): void {
    const mult = direction === 'right' ? 1 : -1;
    const cardEl = this.swipeCard()!.nativeElement;
    const innerEl = this.innerCard()!.nativeElement;

    if (!this.isCover()) {
      const badge =
        direction === 'right'
          ? (innerEl.querySelector('.like-badge') as HTMLElement)
          : (innerEl.querySelector('.nope-badge') as HTMLElement);
      if (badge) gsap.to(badge, { scale: 1, opacity: 1, duration: 0.15, force3D: false });
    }

    gsap
      .timeline({
        onComplete: () => {
          if (!this.isDestroyed) this.swiped.emit(direction);
        },
      })
      .to(cardEl, {
        x: mult * window.innerWidth,
        y: 0,
        opacity: 0,
        duration: 0.4,
        ease: SWIPE_EASE,
      })
      .to(innerEl, { rotation: mult * 20, duration: 0.4, ease: SWIPE_EASE }, '<');
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.draggableInstance?.kill();
    const cardEl = this.swipeCard()?.nativeElement;
    const rotWrapper = this.rotationWrapper()?.nativeElement;
    if (cardEl) gsap.killTweensOf(cardEl);
    if (rotWrapper) gsap.killTweensOf(rotWrapper);
  }

  watchedButton = viewChild(WatchedButton);

  onWatched(tier: FilmTier) {
    this.isSeen.set(true);
    this.watched.emit(tier);
  }

  openTier() {
    this.watchedButton()?.toggleTier();
  }
}
