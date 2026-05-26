import { Component, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WatchlistService } from '@core/services/watchlist.service';
import { Film } from "@shared/ui/film/film";
import { Separator } from "@shared/ui/separator/separator";

@Component({
  selector: 'app-watchlist',
  imports: [Film, Separator],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnInit {
  private router = inject(Router);
  private watchlistService = inject(WatchlistService);
  readonly watchlist = this.watchlistService.watchlist;

  ngOnInit(): void {
    this.watchlistService.getWatchlist();
  }

  onFilmClick(id: number) {
    this.router.navigate(['/films', id]);
  }
}
