import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmService } from '@core/services/film.service';
import { TmdbImagePipe } from '@shared/pipes/tmdb-image.pipe';
import { Button } from '@shared/ui/button/button';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideClock, LucideEye, LucideStar } from '@lucide/angular';
import { FilmDetailsTMDB } from '@core/types/tmdb/film.type';
import { Card } from '@shared/ui/card/card';
import { Separator } from '@shared/ui/separator/separator';
import { RuntimePipe } from '@shared/pipes/runtime.pipe';
import { getWatchProvidersList } from '@shared/utils/watch-providers.util';
import { ProviderCard } from '@shared/ui/provider-card/provider-card';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { isImageLoaded, markImageLoaded } from '@shared/utils/image-cache.util';
import { isViewportAtLeast } from '@shared/utils/responsive.util';
import { ButtonFeedback } from "@shared/ui/button-feedback/button-feedback";

@Component({
  selector: 'app-film-details',
  imports: [
    TmdbImagePipe,
    Button,
    DatePipe,
    LucideClock,
    LucideStar,
    DecimalPipe,
    Card,
    Separator,
    RuntimePipe,
    ProviderCard,
    Skeleton,
    LucideEye,
    ButtonFeedback
],
  templateUrl: './film-details.html',
  styleUrl: './film-details.css',
})
export class FilmDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private filmService = inject(FilmService);

  film = signal<FilmDetailsTMDB | null>(null);
  isLoading = signal<boolean>(false);
  posterLoaded = signal<boolean>(false);
  backdropLoaded = signal<boolean>(false);

  isSeen = signal<boolean>(false);

  isViewportAtLeast = isViewportAtLeast

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const stateFilm = history.state.film;

    if (stateFilm) {
      this.film.set(stateFilm as FilmDetailsTMDB);
    }
    this.isLoading.set(true);

    this.filmService.getFilmById(id).subscribe((data) => {
      // setTimeout(() => {
      this.film.set(data);
      this.isLoading.set(false);

      if (isImageLoaded(data.poster_path)) {
        this.posterLoaded.set(true);
      }
      if (isImageLoaded(data.backdrop_path)) {
        this.backdropLoaded.set(true);
      }
      // },);
    });
  }

  showAllProviders = signal<boolean>(false);

  showAllProvidersLabel = computed(() => {
    return this.showAllProviders() ? 'Ver menos' : `Ver más (+${this.watchProviders().length - 6})`;
  });

  watchProviders = computed(() => {
    const film = this.film();
    return getWatchProvidersList(film?.watch_providers);
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

  onPosterLoad() {
    this.posterLoaded.set(true);
    markImageLoaded(this.film()?.poster_path);
  }

  onBackdropLoad() {
    this.backdropLoaded.set(true);
    markImageLoaded(this.film()?.backdrop_path);
  }

  toggleSeen() {
    this.isSeen.set(!this.isSeen());
  }
}
