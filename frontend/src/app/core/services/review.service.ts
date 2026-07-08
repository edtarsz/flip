import { Injectable, inject, signal } from '@angular/core';
import { ReviewRepository, FilmTier } from '../repositories/review.repository';
import { FilmTMDB } from '../types/tmdb/film.type';

export interface UserReview {
  film_id: string;
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

  async loadUserReviews() {
    this.isLoadingSignal.set(true);
    try {
      const reviews = await this.reviewRepository.getUserReviews();
      this.userReviewsSignal.set(reviews as UserReview[]);
    } catch (error) {
      console.error('Failed to load user reviews:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async upsertReview(payload: { film: FilmTMDB; tier?: FilmTier; rating?: number; review?: string }) {
    try {
      const result = await this.reviewRepository.upsertReview(payload);
      
      if (result && result.film_id) {
        this.userReviewsSignal.update(reviews => {
          const existingIndex = reviews.findIndex(r => r.film_id === result.film_id);
          const newReview: UserReview = {
            film_id: result.film_id,
            tier: payload.tier || null,
            rating: payload.rating || null,
            review: payload.review || null
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
    } catch (error) {
      console.error('Failed to upsert review:', error);
      throw error;
    }
  }
}
