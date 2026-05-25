import { Component, afterNextRender, inject, NgZone, signal, OnInit, effect } from '@angular/core';
import { FilmService } from '@core/services/film.service';
import { Separator } from "@shared/ui/separator/separator";
import { Film } from "@shared/ui/film/film";
import { YearPicker } from "@shared/ui/year-picker/year-picker";
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { LucideSearch, LucideX } from '@lucide/angular';
import { Button } from "@shared/ui/button/button";
import { NgClass } from '@angular/common';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';

@Component({
  selector: 'app-films',
  imports: [Separator, Film, LucideSearch, LucideX, YearPicker, Button, NgClass, FormRoot, FormField],
  templateUrl: './films.html',
  styleUrl: './films.css',
})
export class Films implements OnInit {
  private filmService = inject(FilmService);
  private ngZone = inject(NgZone);

  readonly films = this.filmService.films;
  readonly genres = this.filmService.genres;

  ngOnInit(): void {
    if (this.films().length === 0) {
      this.filmService.getFilms().subscribe();
    }
    if (this.genres().length === 0) {
      this.filmService.getGenres().subscribe();
    }
  }

  selectedYear = signal<number | null>(null);
  selectedGenres = signal<number[]>([]);

  showAll = signal(false);

  private targetScrolls = new Map<HTMLElement, number>();

  searchModel = signal<string>('');

  searchForm = form(this.searchModel, (schemaPath) => { }, {
    submission: {
      action: async (fields) => {
        const query = fields().value();
        this.filmService.getFilms(
          this.selectedGenres(),
          this.selectedYear() ?? undefined,
          query || undefined
        ).subscribe();

        this.showAll.set(true);
      }
    }
  });

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(Draggable);
    });

    effect(() => {
      const filmsList = this.films();
      const showAllActive = this.showAll();

      if (filmsList.length > 0 && !showAllActive) {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            document.querySelectorAll<HTMLElement>('.drag-scroll').forEach(el => {
              this.initDragScroll(el);
              this.initWheelScroll(el);
            });
          });
        });
      }
    });
  }

  private initDragScroll(el: HTMLElement) {
    if (el.dataset['dragInitialized'] === 'true') return;
    el.dataset['dragInitialized'] = 'true';

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

  private initWheelScroll(el: HTMLElement) {
    if (el.dataset['wheelInitialized'] === 'true') return;
    el.dataset['wheelInitialized'] = 'true';

    el.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault();

      if (!this.targetScrolls.has(el)) {
        this.targetScrolls.set(el, el.scrollLeft);
      }

      let currentTarget = this.targetScrolls.get(el)! + event.deltaY * 1.5;
      const maxScroll = el.scrollWidth - el.clientWidth;
      currentTarget = Math.max(0, Math.min(currentTarget, maxScroll));
      this.targetScrolls.set(el, currentTarget);

      gsap.to(el, {
        scrollLeft: currentTarget,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      const maxRotation = 10;
      const rotationAngle = Math.max(-maxRotation, Math.min(maxRotation, event.deltaY * 0.08));
      const cards = el.querySelectorAll('.film-card');

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
    }, { passive: false });
  }

  onReset() {
    this.searchModel.set('');
    this.applyFilters();
  }

  onSeeAll() {
    this.showAll.set(!this.showAll());
  }

  onClear() {
    this.selectedGenres.set([]);
    this.selectedYear.set(null);
    this.applyFilters();
  }

  applyFilters() {
    this.filmService.getFilms(
      this.selectedGenres(),
      this.selectedYear() ?? undefined,
      this.searchModel() || undefined
    ).subscribe();

    this.showAll.set(true);
  }

  toggleGenre(genreId: number) {
    this.selectedGenres.update(value => {
      if (value.includes(genreId)) {
        return value.filter(id => id !== genreId);
      }
      return [...value, genreId];
    });
  }

  get rosalia() {
    if (this.showAll()) {
      return 'Go Back';
    }
    return 'See All'
  }
}
