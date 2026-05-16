import { Component, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { LucideEye, LucideStar } from '@lucide/angular';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Separator } from '../separator/separator';

@Component({
  selector: 'app-swipe-card',
  imports: [Separator, LucideStar, LucideEye],
  templateUrl: './swipe-card.html',
  styleUrl: './swipe-card.css'
})
export class SwipeCard {
  @ViewChild('swipeCard') swipeCard!: ElementRef<HTMLDivElement>;
  @ViewChild('innerCard') innerCard!: ElementRef<HTMLDivElement>;

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);

      const inner = this.innerCard.nativeElement;

      Draggable.create(this.swipeCard.nativeElement, {
        type: 'x,y',
        zIndexBoost: false,
        onDrag: function () {
          const draggable = this as Draggable;
          const rawRotation = draggable.x * 0.1;
          const rotation = Math.max(-20, Math.min(20, rawRotation));
          gsap.to(inner, { rotation: rotation, duration: 0.1, overwrite: 'auto' });
        },
        onRelease: function () {
          const draggable = this as Draggable;
          if (Math.abs(draggable.x) > 150) {
            const direction = draggable.x > 0 ? 1 : -1;
            gsap.to(draggable.target, {
              x: direction * window.innerWidth,
              y: draggable.y + (draggable.y * 0.5),
              opacity: 0,
              duration: 0.5,
              ease: 'power2.out'
            });
            gsap.to(inner, {
              rotation: direction * 45,
              duration: 0.5,
              ease: 'power2.out'
            });
          } else {
            gsap.to(draggable.target, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)'
            });
            gsap.to(inner, {
              rotation: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)'
            });
          }
        }
      });
    });
  }
}
