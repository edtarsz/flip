import { Component, ElementRef, inject, NgZone, OnDestroy, input, output, afterNextRender, viewChild, effect } from '@angular/core';
import { Film } from '@shared/ui/film/film';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { Router } from '@angular/router';
import Lenis from 'lenis';

@Component({
  selector: 'app-film-grid',
  imports: [Film],
  templateUrl: './film-grid.html',
})
export class FilmGrid implements OnDestroy {
  private ngZone = inject(NgZone);
  private router = inject(Router);

  films = input<FilmTMDB[]>([]);
  loading = input<boolean>(false);
  hasMore = input<boolean>(true);
  hideFilmDetails = input<boolean>(false);

  nearEnd = output<void>();

  private observer: IntersectionObserver | null = null;
  private localLenis?: Lenis;

  scrollWrapper = viewChild<ElementRef<HTMLElement>>('scrollWrapper');
  sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  constructor() {
    afterNextRender(() => {
      const wrapper = this.scrollWrapper()?.nativeElement;
      if (wrapper) {
        this.ngZone.runOutsideAngular(() => {
          this.localLenis = new Lenis({
            wrapper: wrapper,
            content: wrapper.firstElementChild as HTMLElement,
          });

          const raf = (time: number) => {
            this.localLenis?.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        });
      }
    });

    effect(() => {
      const el = this.sentinel();
      if (el) {
        this.initObserver(el.nativeElement);
      } else {
        this.disconnectObserver();
      }
    });
  }

  private initObserver(element: HTMLElement) {
    this.disconnectObserver();
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.loading()) {
            this.ngZone.run(() => {
              this.nearEnd.emit();
            });
          }
        },
        {
          root: this.scrollWrapper()?.nativeElement || null,
          rootMargin: '150px',
          threshold: 0.1
        }
      );
      this.observer.observe(element);
    });
  }

  private disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  ngOnDestroy() {
    this.disconnectObserver();
    if (this.localLenis) {
      this.localLenis.destroy();
    }
  }

  onFilmClick(film: any) {
    this.router.navigate(['/films', film.id], { state: { film } });
  }
}
