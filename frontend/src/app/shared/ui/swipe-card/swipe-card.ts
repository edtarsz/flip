import { Component, ElementRef, ViewChild, afterNextRender, Input, Output, EventEmitter } from '@angular/core';
import { LucideCircle, LucideEye, LucideStar, LucideThumbsDown, LucideThumbsUp } from '@lucide/angular';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Separator } from '../separator/separator';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { DatePipe, DecimalPipe } from '@angular/common';
import { GenreTMDB } from '@core/types/tmdb/genre.type';


@Component({
  selector: 'app-swipe-card',
  imports: [Separator, LucideStar, LucideEye, DecimalPipe, DatePipe, LucideCircle, LucideThumbsUp, LucideThumbsDown],
  templateUrl: './swipe-card.html',
  styleUrl: './swipe-card.css'
})
export class SwipeCard {
  @ViewChild('swipeCard') swipeCard!: ElementRef<HTMLDivElement>;
  @ViewChild('innerCard') innerCard!: ElementRef<HTMLDivElement>;

  @Input() film!: FilmTMDB;
  @Input() genres!: GenreTMDB[];
  @Input() showBg = true;

  @Input() set isTop(value: boolean) {
    this._isTop = value;
    this.updateDraggableState();
  }

  get isTop() {
    return this._isTop;
  }

  private _isTop = true;

  @Output() swiped = new EventEmitter<'left' | 'right'>();

  private draggableInstance?: Draggable;

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);

      const inner = this.innerCard.nativeElement;
      const likeBadge = inner.querySelector('.like-badge') as HTMLElement;
      const nopeBadge = inner.querySelector('.nope-badge') as HTMLElement;
      const self = this;

      const draggables = Draggable.create(this.swipeCard.nativeElement, {
        type: 'x,y',
        zIndexBoost: false,
        onDrag: function () {
          const draggable = this as Draggable;
          const rawRotation = draggable.x * 0.1;
          const rotation = Math.max(-20, Math.min(20, rawRotation));
          gsap.to(inner, { rotation: rotation, duration: 0.1, overwrite: 'auto' });

          const dragX = draggable.x;
          const threshold = 90;
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
          if (Math.abs(draggable.x) > 150) {
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
            gsap.to([likeBadge, nopeBadge], {
              scale: 0,
              duration: 0.3,
              overwrite: 'auto'
            });
          }
        }
      });

      this.draggableInstance = draggables[0];
      this.updateDraggableState();
    });
  }

  private updateDraggableState() {
    if (this.draggableInstance) {
      if (this._isTop) {
        this.draggableInstance.enable();
      } else {
        this.draggableInstance.disable();
      }
    }
  }

  getCardImage(): string {
    const imageUrl = `https://image.tmdb.org/t/p/w1280${this.film.poster_path}`
    return `linear-gradient(to top, var(--color-background-light) 0px, var(--color-background-light) 6px, transparent 100%), url('${imageUrl}')`;
  }
}

