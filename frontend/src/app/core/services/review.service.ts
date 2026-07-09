import { Injectable, inject, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { ReviewRepository, FilmTier } from '../repositories/review.repository';
import { FilmTMDB } from '../types/tmdb/film.type';
import { SwipeService } from './swipe.service';

export interface UserReview {
  external_film_id: number;
  tier: FilmTier | null;
  rating: number | null;
  review: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private reviewRepository = inject(ReviewRepository);

  private userReviewsSignal = signal<UserReview[]>([]);
  readonly userReviews = this.userReviewsSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private hasLoadedSignal = signal<boolean>(false);
  readonly hasLoaded = this.hasLoadedSignal.asReadonly();

  private swipeService = inject(SwipeService);
  private reviewAction$ = new Subject<{
    film: any;
    tier?: FilmTier;
    action: 'upsert' | 'delete';
  }>();

  constructor() {
    this.reviewAction$
      .pipe(
        debounceTime(300),
        switchMap(async (payload) => {
          try {
            if (payload.action === 'upsert' && payload.tier) {
              const filmTMDB: FilmTMDB = {
                ...payload.film,
                genre_ids:
                  payload.film.genre_ids || payload.film.genres?.map((g: any) => g.id) || [],
              };
              await this.upsertReview({ film: filmTMDB, tier: payload.tier });

              const swipeDirection =
                payload.tier === 'AMAZING' || payload.tier === 'GOOD' ? 'like' : 'dislike';
              const genres = payload.film.genres || [];
              await this.swipeService.recordSwipe(filmTMDB, swipeDirection, genres);
            } else if (payload.action === 'delete') {
              await this.deleteReview(payload.film.id);
            }
          } catch (error) {
            console.error('Failed to process review action:', error);
          }
        }),
      )
      .subscribe();
  }

  async loadUserReviews() {
    if (this.hasLoadedSignal()) return;
    this.isLoadingSignal.set(true);
    try {
      const reviews = await this.reviewRepository.getUserReviews();
      this.userReviewsSignal.set(reviews as UserReview[]);
      this.hasLoadedSignal.set(true);
    } catch (error) {
      console.error('Failed to load user reviews:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async upsertReview(payload: {
    film: FilmTMDB;
    tier?: FilmTier;
    rating?: number;
    review?: string;
  }) {
    const result = await this.reviewRepository.upsertReview(payload);

    if (result && result.film_id) {
      this.userReviewsSignal.update((reviews) => {
        const existingIndex = reviews.findIndex((r) => r.external_film_id === payload.film.id);
        const newReview: UserReview = {
          external_film_id: payload.film.id,
          tier: payload.tier || null,
          rating: payload.rating || null,
          review: payload.review || null,
        };

        if (existingIndex >= 0) {
          const existing = reviews[existingIndex];
          const updated = [...reviews];
          updated[existingIndex] = {
            ...existing,
            tier: payload.tier !== undefined ? payload.tier : existing.tier,
            rating: payload.rating !== undefined ? payload.rating : existing.rating,
            review: payload.review !== undefined ? payload.review : existing.review,
          };
          return updated;
        } else {
          return [...reviews, newReview];
        }
      });
      return result;
    }
    return null;
  }

  async getReviewByFilmId(externalFilmId: number) {
    const review = this.userReviews().find((r) => r.external_film_id === externalFilmId);
    if (review) {
      return review;
    }

    const result = await this.reviewRepository.getReviewByFilmId(externalFilmId);
    return result;
  }

  async deleteReview(externalFilmId: number) {
    await this.reviewRepository.deleteReview(externalFilmId);
    this.userReviewsSignal.update((reviews) =>
      reviews.filter((r) => r.external_film_id !== externalFilmId),
    );
  }

  hasReviewed(externalFilmId: number): boolean {
    return this.userReviewsSignal().some((r) => r.external_film_id === externalFilmId);
  }

  watchFilm(film: any, tier: FilmTier) {
    this.userReviewsSignal.update((reviews) => {
      const existing = reviews.find((r) => r.external_film_id === film.id);
      if (existing) {
        return reviews.map((r) => (r.external_film_id === film.id ? { ...r, tier } : r));
      }
      return [...reviews, { external_film_id: film.id, tier, rating: null, review: null }];
    });

    const activeSwipeFilm = this.swipeService.recommendations()[this.swipeService.currentIndex()];
    if (activeSwipeFilm && activeSwipeFilm.id === film.id) {
      this.swipeService.advanceIndex();
    }

    this.reviewAction$.next({ film, tier, action: 'upsert' });
  }

  unwatchFilm(film: any) {
    this.userReviewsSignal.update((reviews) =>
      reviews.filter((r) => r.external_film_id !== film.id),
    );
    this.reviewAction$.next({ film, action: 'delete' });
  }
}
