import { Component, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TmdbImagePipe } from "../../../shared/pipes/tmdb-image.pipe";
import { Button } from "@shared/ui/button/button";
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { LucideClock, LucideStar } from '@lucide/angular';
import { FilmDetailsTMDB } from '@core/types/tmdb/film.type';
import { Card } from "@shared/ui/card/card";
import { Separator } from "@shared/ui/separator/separator";
import { RuntimePipe } from "../../../shared/pipes/runtime.pipe";

@Component({
  selector: 'app-film-details',
  imports: [TmdbImagePipe, Button, DatePipe, LucideClock, LucideStar, DecimalPipe, Card, Separator, RuntimePipe],
  templateUrl: './film-details.html',
  styleUrl: './film-details.css',
})
export class FilmDetails {
  private route = inject(ActivatedRoute);

  film = toSignal<FilmDetailsTMDB>(
    this.route.data.pipe(map(data => data['film']))
  );
  
  showAllProviders = signal<boolean>(false);

  watchProviders = computed(() => {
    const film = this.film();
    if (!film || !film.watch_providers) return [];

    const userRegion = (navigator.language || 'en-US').split('-')[1]?.toUpperCase() || 'US';
    const providersForRegion = film.watch_providers[userRegion] || film.watch_providers['US'];
    if (!providersForRegion) return [];

    const flatrate = providersForRegion.flatrate || [];
    const rent = providersForRegion.rent || [];
    const buy = providersForRegion.buy || [];

    const seen = new Set<number>();
    const allProviders: any[] = [];

    for (const p of flatrate) {
      if (!seen.has(p.provider_id)) {
        seen.add(p.provider_id);
        allProviders.push({ ...p, type: 'Stream' });
      }
    }

    for (const p of [...rent, ...buy]) {
      if (!seen.has(p.provider_id)) {
        seen.add(p.provider_id);
        allProviders.push({ ...p, type: 'Rent/Buy' });
      }
    }

    return allProviders;
  });

  visibleProviders = computed(() => {
    const list = this.watchProviders();
    const showAll = this.showAllProviders();

    if (list.length <= 6 || showAll) {
      return list;
    }

    return list.slice(0, 6);
  });

  toggleShowAll() {
    this.showAllProviders.set(!this.showAllProviders());
  }

  constructor() {
    console.log(this.film());
  }
}
