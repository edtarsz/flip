import { Component, afterNextRender } from '@angular/core';
import { LucideStar } from '@lucide/angular';
import { CardFeatures } from "../../shared/ui/card-features/card-features";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SwipeCard } from "../../shared/ui/swipe-card/swipe-card";

@Component({
  selector: 'app-landing-page',
  imports: [LucideStar, CardFeatures, SwipeCard],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css',
})
export class LandingPage {
  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.to('app-header header', {
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
}
