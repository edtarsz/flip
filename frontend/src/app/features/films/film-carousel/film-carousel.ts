import {
  Component,
  ElementRef,
  viewChild,
  afterNextRender,
  inject,
  NgZone,
  effect,
  signal,
  input,
  output,
  OnDestroy,
} from '@angular/core';
import { Film } from '@shared/ui/film/film';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-film-carousel',
  imports: [Film, LucideChevronLeft, LucideChevronRight, NgClass],
  templateUrl: './film-carousel.html',
})
export class FilmCarousel implements OnDestroy {
  private ngZone = inject(NgZone);
  private router = inject(Router);

  title = input<string>('');
  loading = input<boolean>(false);
  hasMore = input<boolean>(true);

  canScrollLeft = signal(false);

  films = input<FilmTMDB[]>([]);

  nearEnd = output<void>();

  carouselRef = viewChild<ElementRef<HTMLElement>>('carouselContainer');
  private readonly targetScrolls = new Map<HTMLElement, number>();
  private draggableInstance?: Draggable;

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);
    });

    effect(() => {
      const ref = this.carouselRef();
      const currentFilms = this.films();
      if (ref && currentFilms.length > 0) {
        this.triggerInitialization();
      }
    });
  }

  private triggerInitialization() {
    const ref = this.carouselRef();
    if (ref && this.films().length > 0) {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          const el = ref.nativeElement;
          this.initDragScroll(el);
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
    gsap.set(proxy, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1,
      height: 1,
      visibility: 'hidden',
    });

    const self = this;

    const draggables = Draggable.create(proxy, {
      type: 'x',
      trigger: el,
      onPress: () => {
        el.style.cursor = 'grabbing';
      },
      onDrag: function () {
        el.scrollLeft -= this['deltaX'];

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 400 && !self.loading() && self.hasMore()) {
          self.ngZone.run(() => {
            self.nearEnd.emit();
          });
        }
      },
      onRelease: function () {
        el.style.cursor = '';
        self.targetScrolls.set(el, el.scrollLeft);
        gsap.set(proxy, { x: 0, y: 0 });
      },
    });

    this.draggableInstance = draggables[0];
  }

  onFilmClick(film: any) {
    this.router.navigate(['/films', film.id], { state: { film } });
  }

  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    this.canScrollLeft.set(el.scrollLeft > 10);
  }

  onScrollBack() {
    const el = this.carouselRef()?.nativeElement;
    if (el) {
      const card = el.querySelector('app-film');
      const cardWidth = card ? card.getBoundingClientRect().width : 200;

      const filmsToSkip = 2;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * filmsToSkip;

      gsap.to(el, {
        scrollLeft: Math.max(0, el.scrollLeft - scrollAmount),
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          this.canScrollLeft.set(el.scrollLeft > 10);
        },
      });
    }
  }

  onLoadMore() {
    const el = this.carouselRef()?.nativeElement;
    if (el) {
      const card = el.querySelector('app-film');
      const cardWidth = card ? card.getBoundingClientRect().width : 200;

      const filmsToSkip = 2;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * filmsToSkip;

      gsap.to(el, {
        scrollLeft: el.scrollLeft + scrollAmount,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          this.canScrollLeft.set(el.scrollLeft > 10);
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (el.scrollLeft >= maxScroll - 400 && !this.loading() && this.hasMore()) {
            this.nearEnd.emit();
          }
        },
      });
    }
  }

  ngOnDestroy() {
    if (this.draggableInstance) {
      this.draggableInstance.kill();
    }
  }
}
