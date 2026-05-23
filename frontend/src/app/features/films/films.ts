import { Component, afterNextRender, inject, NgZone, signal } from '@angular/core';
import { FilmService } from '@core/services/film.service';
import { Separator } from "@shared/ui/separator/separator";
import { Film } from "@shared/ui/film/film";
import { YearPicker } from "@shared/ui/year-picker/year-picker";
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { LucideSearch, LucideX } from '@lucide/angular';
import { Button } from "@shared/ui/button/button";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-films',
  imports: [Separator, Film, LucideSearch, LucideX, YearPicker, Button, NgClass],
  templateUrl: './films.html',
  styleUrl: './films.css',
})
export class Films {
  private filmService = inject(FilmService);
  private ngZone = inject(NgZone);

  readonly films = this.filmService.films;
  readonly genres = this.filmService.genres;

  searchQuery = signal('');
  selectedYear = signal<number | null>(null);
  selectedGenres = signal<string[]>([]);

  showAll = signal(false);

  private targetScrolls = new Map<HTMLElement, number>();

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);

      this.ngZone.runOutsideAngular(() => {
        document.querySelectorAll<HTMLElement>('.drag-scroll').forEach(el => {
          this.initDragScroll(el);
        });
      });
    });
  }

  private initDragScroll(el: HTMLElement) {
    const proxy = document.createElement('div');
    document.body.appendChild(proxy);
    gsap.set(proxy, { position: 'absolute', top: 0, left: 0, width: 1, height: 1, visibility: 'hidden' });

    const self = this;

    Draggable.create(proxy, {
      type: 'x',
      trigger: el,
      onPress: () => {
        el.style.cursor = 'grabbing';
      },
      onDrag: function () {
        el.scrollLeft -= this['deltaX'];
      },
      onRelease: function () {
        el.style.cursor = '';
        self.targetScrolls.set(el, el.scrollLeft);
        gsap.set(proxy, { x: 0, y: 0 });
      }
    });
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

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onReset() {
    this.searchQuery.set('');
  }

  onSeeAll() {
    this.showAll.set(!this.showAll());
  }

  applyFilters() {
    this.filmService.getFilms(this.selectedGenres(), this.selectedYear() ?? undefined).subscribe();
  }

  addGenre(genre: string) {
    this.selectedGenres.update(value => [...value, genre]);
  }

  get rosalia() {
    if (this.showAll()) {
      return 'Go Back';
    }
    return 'See All'
  }
}
