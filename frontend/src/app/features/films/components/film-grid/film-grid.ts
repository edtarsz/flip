import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject, NgZone, OnDestroy } from '@angular/core';
import { Film } from '@shared/ui/film/film';
import { FilmTMDB } from '@core/types/tmdb/film.type';

@Component({
  selector: 'app-film-grid',
  imports: [Film],
  templateUrl: './film-grid.html',
})
export class FilmGrid implements OnDestroy {
  private ngZone = inject(NgZone);

  @Input() films: FilmTMDB[] = [];
  @Input() loading: boolean = false;
  @Input() hasMore: boolean = true;

  @Output() nearEnd = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  @ViewChild('sentinel') set sentinel(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      this.initObserver(el.nativeElement);
    } else {
      this.disconnectObserver();
    }
  }

  private initObserver(element: HTMLElement) {
    this.disconnectObserver();
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.loading) {
            this.ngZone.run(() => {
              this.nearEnd.emit();
            });
          }
        },
        { threshold: 0.1 }
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
  }
}
