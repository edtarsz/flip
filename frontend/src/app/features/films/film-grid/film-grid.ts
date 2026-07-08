import {
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  input,
  output,
  afterNextRender,
  viewChild,
} from '@angular/core';
import { Film } from '@shared/ui/film/film';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { createLenis } from '@shared/utils/lenis.util';
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

  private localLenis?: Lenis;

  scrollWrapper = viewChild<ElementRef<HTMLElement>>('scrollWrapper');

  constructor() {
    afterNextRender(() => {
      const scrollableElement = this.scrollWrapper()?.nativeElement;
      if (scrollableElement) {
        this.ngZone.runOutsideAngular(() => {
          this.localLenis = createLenis({
            wrapper: scrollableElement,
            content: (scrollableElement.firstElementChild as HTMLElement) || scrollableElement,
            autoRaf: false,
          });
          const raf = (time: number) => {
            this.localLenis?.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);

          this.localLenis.on('scroll', () => {
            if (!this.hasMore() || this.loading()) return;
            const { scrollTop, clientHeight, scrollHeight } = scrollableElement;
            const isNearBottom =
              scrollHeight > clientHeight &&
              scrollTop + clientHeight >= scrollHeight - 200;
            if (isNearBottom) {
              this.ngZone.run(() => this.nearEnd.emit());
            }
          });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.localLenis) {
      this.localLenis.destroy();
    }
  }

  onFilmClick(film: any) {
    this.router.navigate(['/films', film.id], { state: { film } });
  }
}
