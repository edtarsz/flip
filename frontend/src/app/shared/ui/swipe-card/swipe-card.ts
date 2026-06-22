import { Component, ElementRef, ViewChild, afterNextRender, input, output, effect, OnDestroy, inject } from '@angular/core';
import { LucideCircle, LucideEye, LucideStar, LucideThumbsDown, LucideThumbsUp } from '@lucide/angular';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Separator } from '../separator/separator';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { DatePipe, DecimalPipe } from '@angular/common';
import { GenreTMDB } from '@core/types/tmdb/genre.type';
import { getTmdbImageUrl } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-swipe-card',
  imports: [Separator, LucideStar, LucideEye, DecimalPipe, DatePipe, LucideCircle, LucideThumbsUp, LucideThumbsDown],
  templateUrl: './swipe-card.html',
  styleUrl: './swipe-card.css'
})
export class SwipeCard implements OnDestroy {
  @ViewChild('swipeCard') swipeCard!: ElementRef<HTMLDivElement>;
  @ViewChild('innerCard') innerCard!: ElementRef<HTMLDivElement>;

  film = input<FilmTMDB | null>(null);
  genres = input<GenreTMDB[]>([]);
  showBg = input<boolean>(true);
  isTop = input<boolean>(true);
  isCover = input<boolean>(false);

  swiped = output<'left' | 'right'>();

  private draggableInstance?: Draggable;
  private hostEl = inject(ElementRef<HTMLElement>);

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
      gsap.registerPlugin(Draggable);

      const inner = this.innerCard.nativeElement;
      const likeBadge = !this.isCover() ? inner.querySelector('.like-badge') as HTMLElement : null;
      const nopeBadge = !this.isCover() ? inner.querySelector('.nope-badge') as HTMLElement : null;
      const self = this;
      let savedZIndex = '';

      const draggables = Draggable.create(this.swipeCard.nativeElement, {
        type: 'x,y',
        zIndexBoost: false,
        onClick: function (event) {
          const type = this['pointerEvent']?.type || '';
          if (type.includes('touch')) {
            self.swipeCard.nativeElement.click();
          }
        },
        onDragStart: function () {
          savedZIndex = self.hostEl.nativeElement.style.zIndex;
          self.hostEl.nativeElement.style.zIndex = '100';
        },
        onDrag: function () {
          const draggable = this as Draggable;
          const rawRotation = draggable.x * 0.1;
          const rotation = Math.max(-20, Math.min(20, rawRotation));
          gsap.to(inner, { rotation: rotation, duration: 0.1, overwrite: 'auto' });

          if (self.isCover()) return;

          const dragX = draggable.x;
          const threshold = 45;
          const scale = Math.min(1, Math.abs(dragX) / threshold);

          if (dragX > 0) {
            gsap.set(likeBadge, { scale: scale });
            gsap.set(nopeBadge, { scale: 0 });
          } else {
            gsap.set(nopeBadge, { scale: scale });
            gsap.set(likeBadge, { scale: 0 });
          }
        },
        onRelease: function () {
          const draggable = this as Draggable;
          self.hostEl.nativeElement.style.zIndex = savedZIndex;
          if (Math.abs(draggable.x) > 45) {
            const direction = draggable.x > 0 ? 1 : -1;
            const swipeDirection = draggable.x > 0 ? 'right' : 'left';
            gsap.to(draggable.target, {
              x: direction * window.innerWidth,
              y: draggable.y + (draggable.y * 0.5),
              opacity: 0,
              duration: 0.3,
              ease: 'power2.out',
              onComplete: () => {
                self.swiped.emit(swipeDirection);
              }
            });
            gsap.to(inner, {
              rotation: direction * 45,
              duration: 0.5,
              ease: 'power2.out'
            });
          } else {
            gsap.to(draggable.target, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)'
            });
            gsap.to(inner, {
              rotation: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)'
            });
            if (!self.isCover() && likeBadge && nopeBadge) {
              gsap.to([likeBadge, nopeBadge], {
                scale: 0,
                duration: 0.3,
                overwrite: 'auto'
              });
            }
          }
        }
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
    const imageUrl = getTmdbImageUrl(film.poster_path, 'w1280');
    return `linear-gradient(to top, var(--color-background) 0px, var(--color-background) 6px, transparent 100%), url('${imageUrl}')`;
  }

  swipe(direction: 'left' | 'right'): void {
    const dirMultiplier = direction === 'right' ? 1 : -1;
    const cardEl = this.swipeCard.nativeElement;
    const innerEl = this.innerCard.nativeElement;

    const likeBadge = !this.isCover() ? innerEl.querySelector('.like-badge') as HTMLElement : null;
    const nopeBadge = !this.isCover() ? innerEl.querySelector('.nope-badge') as HTMLElement : null;

    if (!this.isCover()) {
      if (direction === 'right' && likeBadge) {
        gsap.to(likeBadge, { scale: 1, duration: 0.15 });
      } else if (direction === 'left' && nopeBadge) {
        gsap.to(nopeBadge, { scale: 1, duration: 0.15 });
      }
    }

    gsap.to(cardEl, {
      x: dirMultiplier * window.innerWidth,
      y: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        this.swiped.emit(direction);
      }
    });

    gsap.to(innerEl, {
      rotation: dirMultiplier * 20,
      duration: 0.4,
      ease: 'power2.out'
    });
  }

  ngOnDestroy() {
    if (this.draggableInstance) {
      this.draggableInstance.kill();
    }
  }
}

