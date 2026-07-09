import { Component, inject, computed, signal, OnInit, DestroyRef, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilmService } from '@core/services/film.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideClock, LucideEye, LucideStar } from '@lucide/angular';
import { FilmDetailsTMDB } from '@core/types/tmdb/film.type';
import { Separator } from '@shared/ui/separator/separator';
import { RuntimePipe } from '@shared/pipes/runtime.pipe';
import { getWatchProvidersList } from '@shared/utils/watch-providers.util';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { isImageLoaded, markImageLoaded } from '@shared/utils/image-cache.util';
import { isViewportAtLeast } from '@shared/utils/responsive.util';
import { ButtonFeedback } from "@shared/ui/button-feedback/button-feedback";
import { SafePipe } from '@shared/pipes/safe.pipe';
import { getTmdbImageUrl } from '@shared/pipes/tmdb-image.pipe';
import { LoadingService } from '@core/services/loading.service';
import { FilmTier } from '@core/repositories/review.repository';
import { ReviewService } from '@core/services/review.service';
import { WatchedButton } from "@shared/ui/watched-button/watched-button";

@Component({
  selector: 'app-new-film-details',
  imports: [
    DatePipe,
    LucideClock,
    LucideStar,
    DecimalPipe,
    Separator,
    RuntimePipe,
    Skeleton,
    SafePipe,
    WatchedButton
],
  templateUrl: './new-film-details.html',
  styleUrl: './new-film-details.css',
})
export class NewFilmDetails implements OnInit {
  id = input.required<string>();
  
  private filmService = inject(FilmService);
  private loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);
  private reviewService = inject(ReviewService);

  film = signal<FilmDetailsTMDB | null>(null);
  isLoading = signal<boolean>(false);
  posterLoaded = signal<boolean>(false);
  backdropLoaded = signal<boolean>(false);
  isTierOpen = signal<boolean>(false);
  trailerLoaded = signal<boolean>(false);
  isSeen = signal<boolean>(false);

  isViewportAtLeast = isViewportAtLeast;
  getTmdbImageUrl = getTmdbImageUrl;

  private fallbackTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    const numericId = Number(this.id());
    const stateFilm = history.state.film;

    if (stateFilm) {
      this.film.set(stateFilm as FilmDetailsTMDB);
    }

    this.isLoading.set(true);
    this.trailerLoaded.set(false);
    clearTimeout(this.fallbackTimeout);
    this.loadingService.start();

    this.filmService.getFilmById(numericId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.film.set(data);
        this.isLoading.set(false);

        if (isImageLoaded(getTmdbImageUrl(data.poster_path, 'w500'))) this.posterLoaded.set(true);
        if (isImageLoaded(getTmdbImageUrl(data.backdrop_path, 'original'))) this.backdropLoaded.set(true);

        if (!this.trailerKey()) {
          this.loadingService.stop();
        } else {
          this.fallbackTimeout = setTimeout(() => {
            this.loadingService.stop();
            this.trailerLoaded.set(true);
          }, 5000);
          
          this.destroyRef.onDestroy(() => clearTimeout(this.fallbackTimeout));
        }
      });

      this.isSeen.set(!!this.reviewService.getReviewByFilmId(numericId));
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
    if (list.length <= 6 || showAll) return list;
    return list.slice(0, 6);
  });
  
  trailerKey = computed(() => {
    const film = this.film();
    if (!film?.videos?.results) return null;
    const trailer = film.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    if (!trailer) {
      return film.videos.results.find((v) => v.site === 'YouTube' && v.type === 'Teaser')?.key || null;
    }
    return trailer.key;
  });

  onTrailerLoad() {
    clearTimeout(this.fallbackTimeout);
    this.trailerLoaded.set(true);
    this.loadingService.stop();
  }

  toggleShowAll() {
    this.showAllProviders.set(!this.showAllProviders());
  }

  onPosterLoad() {
    this.posterLoaded.set(true);
    const path = this.film()?.poster_path;
    if (path) markImageLoaded(getTmdbImageUrl(path, 'original'));
  }

  onBackdropLoad() {
    this.backdropLoaded.set(true);
    const path = this.film()?.backdrop_path;
    if (path) markImageLoaded(getTmdbImageUrl(path, 'original'));
  }

  toggleTierOpen() {
    this.isTierOpen.set(!this.isTierOpen());
  }
  
  openTrailer() {
    const key = this.trailerKey();
    if (key) {
      window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
    }
  }

  onFilmWatched(tier :FilmTier){
    const film = this.film();
    if (!film) return;
    this.reviewService.upsertReview({ film:{
      ...film,
      genre_ids: film.genres.map((g) => g.id),
    }, tier });
  }
}
