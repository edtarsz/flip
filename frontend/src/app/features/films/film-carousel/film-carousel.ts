import { Component, Input, Output, EventEmitter, ElementRef, viewChild, afterNextRender, inject, NgZone, effect } from '@angular/core';
import { Film } from '@shared/ui/film/film';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-film-carousel',
  imports: [Film],
  templateUrl: './film-carousel.html',
})
export class FilmCarousel {
  private ngZone = inject(NgZone);
  private router = inject(Router);

  @Input() title: string = '';
  @Input() loading: boolean = false;
  @Input() hasMore: boolean = true;

  private _films: FilmTMDB[] = [];
  @Input() set films(value: FilmTMDB[]) {
    this._films = value;
    this.triggerInitialization();
  }
  get films() {
    return this._films;
  }

  @Output() nearEnd = new EventEmitter<void>();

  carouselRef = viewChild<ElementRef<HTMLElement>>('carouselContainer');
  private readonly targetScrolls = new Map<HTMLElement, number>();

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);
    });

    effect(() => {
      const ref = this.carouselRef();
      if (ref && this._films.length > 0) {
        this.triggerInitialization();
      }
    });
  }

  private triggerInitialization() {
    const ref = this.carouselRef();
    if (ref && this._films.length > 0) {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          const el = ref.nativeElement;
          this.initDragScroll(el);
          this.initWheelScroll(el);
        });
      });
    }
  }

  private initDragScroll(el: HTMLElement) {
    if (el.dataset['dragInitialized'] === 'true') return;
    el.dataset['dragInitialized'] = 'true';

    const proxy = document.createElement('div');
    const container = el.parentElement || el;

    container.appendChild(proxy);
    gsap.set(proxy, { position: 'absolute', top: 0, left: 0, width: 1, height: 1, visibility: 'hidden' });

    const self = this;

    Draggable.create(proxy, {
      type: 'x',
      trigger: el,
      onPress: () => {
        el.style.cursor = 'grabbing';
      },
      onDrag: function () {
        el.scrollLeft -= this['deltaX'];

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 400 && !self.loading && self.hasMore) {
          self.ngZone.run(() => {
            self.nearEnd.emit();
          });
        }
      },
      onRelease: function () {
        el.style.cursor = '';
        self.targetScrolls.set(el, el.scrollLeft);
        gsap.set(proxy, { x: 0, y: 0 });
      }
    });
  }

  private initWheelScroll(el: HTMLElement) {
    if (el.dataset['wheelInitialized'] === 'true') return;
    el.dataset['wheelInitialized'] = 'true';

    el.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault();

      if (!this.targetScrolls.has(el)) {
        this.targetScrolls.set(el, el.scrollLeft);
      }

      let currentTarget = this.targetScrolls.get(el)! + event.deltaY * 1.5;
      const maxScroll = el.scrollWidth - el.clientWidth;
      currentTarget = Math.max(0, Math.min(currentTarget, maxScroll));
      this.targetScrolls.set(el, currentTarget);

      if (currentTarget >= maxScroll - 400 && !this.loading && this.hasMore) {
        this.ngZone.run(() => {
          this.nearEnd.emit();
        });
      }

      gsap.to(el, {
        scrollLeft: currentTarget,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      const maxRotation = 10;
      const rotationAngle = Math.max(-maxRotation, Math.min(maxRotation, event.deltaY * 0.08));

      let cards = (el as any)['_cachedCards'] as HTMLElement[];
      if (!cards || cards.length !== this._films.length) {
        cards = Array.from(el.querySelectorAll('.film-card')) as HTMLElement[];
        (el as any)['_cachedCards'] = cards;
      }

      if (cards.length > 0) {
        const cardStep = 200;
        const startIndex = Math.floor(el.scrollLeft / cardStep);
        const endIndex = Math.ceil((el.scrollLeft + el.clientWidth) / cardStep);

        const visibleCards = cards.slice(
          Math.max(0, startIndex - 1),
          Math.min(cards.length, endIndex + 1)
        );

        if (visibleCards.length > 0) {
          gsap.to(visibleCards, {
            keyframes: [
              { rotationY: -rotationAngle, duration: 0.4, ease: 'power1.out' },
              { rotationY: 0, duration: 0.4, ease: 'power2.out' }
            ],
            transformOrigin: "center center",
            overwrite: 'auto'
          });
        }
      }
    }, { passive: false });
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }
}
