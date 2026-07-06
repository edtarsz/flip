import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideClapperboard,
  LucideGalleryHorizontalEnd,
  LucideNetwork,
  LucideThumbsUp
} from '@lucide/angular';
import { Separator } from '@shared/ui/separator/separator';

@Component({
  selector: 'app-header-mobile',
  imports: [
    LucideGalleryHorizontalEnd,
    LucideThumbsUp,
    RouterLink,
    Separator,
    RouterLinkActive,
    LucideClapperboard,
    LucideNetwork
  ],
  templateUrl: './header-mobile.html',
  styleUrl: './header-mobile.css',
})
export class HeaderMobile {
  animateClick(event: Event) {
    const el = event.currentTarget as HTMLElement;
    const ripple = el.querySelector('.ripple-layer');
    if (ripple) {
      ripple.animate(
        [
          { opacity: 0 },
          { opacity: 0.3, offset: 0.1 },
          { opacity: 0 }
        ],
        {
          duration: 500,
          easing: 'ease-out'
        }
      );
    }
  }
}
