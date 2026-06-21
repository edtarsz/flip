import { Component, inject, OnInit, ViewChild, ElementRef, NgZone, afterNextRender, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WatchlistService } from '@core/services/watchlist.service';
import { Film } from "@shared/ui/film/film";
import Lenis from 'lenis';
import { HeaderMobile } from "@shared/ui/headers/header-mobile/header-mobile";

@Component({
  selector: 'app-watchlist',
  imports: [Film, HeaderMobile],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnInit, OnDestroy {
  private router = inject(Router);
  private watchlistService = inject(WatchlistService);
  private ngZone = inject(NgZone);

  readonly watchlist = this.watchlistService.watchlist;
  readonly isLoading = this.watchlistService.isLoading;

  private localLenis?: Lenis;
  private rafId?: number;
  @ViewChild('scrollWrapper') scrollWrapper?: ElementRef<HTMLElement>;

  constructor() {
    afterNextRender(() => {
      const wrapper = this.scrollWrapper?.nativeElement;
      if (wrapper) {
        this.ngZone.runOutsideAngular(() => {
          this.localLenis = new Lenis({
            wrapper: wrapper,
            content: wrapper.firstElementChild as HTMLElement,
          });

          const raf = (time: number) => {
            this.localLenis?.raf(time);
            this.rafId = requestAnimationFrame(raf);
          };
          this.rafId = requestAnimationFrame(raf);
        });
      }
    });
  }

  ngOnInit(): void {
    this.watchlistService.getWatchlist();
  }

  ngOnDestroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.localLenis) {
      this.localLenis.destroy();
    }
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }
}
