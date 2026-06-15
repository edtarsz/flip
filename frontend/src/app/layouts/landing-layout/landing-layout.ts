import { Component, afterNextRender, OnDestroy } from '@angular/core';
import { LucideStar } from '@lucide/angular';
import { CardFeatures } from "@shared/ui/card-features/card-features";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from "@shared/ui/button/button";
import { MOCK_GENRES, MOCK_SWIPE } from 'src/app/seeds/swipe-card';

@Component({
  selector: 'app-landing-page',
  imports: [LucideStar, CardFeatures, Button],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css',
})
export class LandingPage implements OnDestroy {
  readonly swipeCards = MOCK_SWIPE;
  readonly genres = MOCK_GENRES;

  private headerTween?: gsap.core.Tween;

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(ScrollTrigger);

      this.headerTween = gsap.to('app-header header', {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        duration: 0.3,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'bottom 200px',
          toggleActions: 'play none none reverse',
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.headerTween) {
      this.headerTween.scrollTrigger?.kill();
      this.headerTween.kill();
    }
    const headerEl = document.querySelector('app-header header') as HTMLElement;
    if (headerEl) {
      gsap.set(headerEl, {
        clearProps: 'backgroundColor,backdropFilter,borderColor,boxShadow'
      });
    }
  }
}
