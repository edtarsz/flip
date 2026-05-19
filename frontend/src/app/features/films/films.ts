import { Component, effect, inject, OnInit } from '@angular/core';
import { FilmService } from '@core/services/film.service';
import { Separator } from "@shared/ui/separator/separator";
import { Film } from "@shared/ui/film/film";
import { gsap } from 'gsap';

@Component({
  selector: 'app-films',
  imports: [Separator, Film],
  templateUrl: './films.html',
  styleUrl: './films.css',
})
export class Films implements OnInit {
  private filmService = inject(FilmService);
  readonly films = this.filmService.films;

  private targetScrolls = new Map<HTMLElement, number>();

  constructor() {
    effect(() => {
      for (const film of this.films()) {
        console.log(film.title);
      }
    });
  }

  ngOnInit(): void {
    this.filmService.getFilms();
  }

  onWheel(event: WheelEvent) {
    const target = event.currentTarget as HTMLElement;
    event.preventDefault();

    if (!this.targetScrolls.has(target)) {
      this.targetScrolls.set(target, target.scrollLeft);
    }

    let currentTarget = this.targetScrolls.get(target)! + event.deltaY * 1.5;
    const maxScroll = target.scrollWidth - target.clientWidth;
    currentTarget = Math.max(0, Math.min(currentTarget, maxScroll));
    this.targetScrolls.set(target, currentTarget);

    gsap.to(target, {
      scrollLeft: currentTarget,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    const maxRotation = 10;
    const rotationAngle = Math.max(-maxRotation, Math.min(maxRotation, event.deltaY * 0.08));
    const cards = target.querySelectorAll('.film-card');

    if (cards.length > 0) {
      gsap.to(cards, {
        keyframes: [
          { rotationY: -rotationAngle, duration: 0.2, ease: 'power1.out' },
          { rotationY: 0, duration: 0.4, ease: 'power2.out' }
        ],
        transformOrigin: "center center",
        overwrite: 'auto'
      });
    }
  }
}

