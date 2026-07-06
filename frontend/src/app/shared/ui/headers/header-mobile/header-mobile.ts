import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideClapperboard,
  LucideGalleryHorizontalEnd,
  LucideNetwork,
  LucideThumbsUp
} from '@lucide/angular';
import { Separator } from '@shared/ui/separator/separator';
import { animateRipple } from '@shared/utils/animation.util';

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
    animateRipple(event);
  }
}
