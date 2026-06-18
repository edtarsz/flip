import { Component, inject, OnInit, ViewChild, ElementRef, NgZone, afterNextRender, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WatchlistService } from '@core/services/watchlist.service';
import { Film } from "@shared/ui/film/film";
import { Separator } from "@shared/ui/separator/separator";
import Lenis from 'lenis';

@Component({
  selector: 'app-watchlist',
  imports: [Film],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnInit, OnDestroy {
  private router = inject(Router);
  private watchlistService = inject(WatchlistService);
  private ngZone = inject(NgZone);

  readonly watchlist = this.watchlistService.watchlist;

  private localLenis?: Lenis;
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
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        });
      }
    });
  }

  ngOnInit(): void {
    this.watchlistService.getWatchlist();
  }

  ngOnDestroy() {
    if (this.localLenis) {
      this.localLenis.destroy();
    }
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }
}
