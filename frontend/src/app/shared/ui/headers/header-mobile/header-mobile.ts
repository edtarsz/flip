import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideGalleryHorizontalEnd, LucideThumbsUp } from '@lucide/angular';
import { Separator } from '@shared/ui/separator/separator';

@Component({
  selector: 'app-header-mobile',
  imports: [LucideGalleryHorizontalEnd, LucideThumbsUp, RouterLink, Separator, RouterLinkActive],
  templateUrl: './header-mobile.html',
  styleUrl: './header-mobile.css',
})
export class HeaderMobile {
  private router = inject(Router);

  navToSwipe() {
    this.router.navigate(['/swipe']);
  }

  navToWatchlist() {
    this.router.navigate(['/watchlist']);
  }
}
