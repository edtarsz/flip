import { Injectable } from '@angular/core';
import { supabase } from '@core/supabase/supabase.client';
import { FilmTMDB } from '../types/tmdb/film.type';

export type FilmTier = 'BAD' | 'MEH' | 'GOOD' | 'AMAZING';

@Injectable({
  providedIn: 'root',
})
export class ReviewRepository {
  async upsertReview(payload: {
    film: FilmTMDB;
    tier?: FilmTier;
    rating?: number;
    review?: string;
  }) {
    const { data, error } = await supabase.rpc('upsert_review', {
      p_external_film_id: payload.film.id,
      p_title: payload.film.title,
      p_poster_path: payload.film.poster_path || '',
      p_vote_average: payload.film.vote_average,
      p_release_date: payload.film.release_date,
      p_genre_ids: payload.film.genre_ids || [],
      p_tier: payload.tier ?? undefined,
      p_rating: payload.rating ?? undefined,
      p_review: payload.review ?? undefined,
    });

    if (error) throw error;
    return data as { success: boolean; film_id: string };
  }

  async getUserReviews() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) return [];

    const { data, error } = await supabase
      .from('reviews')
      .select('tier, rating, review, films!inner(external_film_id)')
      .eq('user_id', session.user.id);

    if (error) throw error;
    return (
      data?.map((d: any) => ({
        external_film_id: d.films.external_film_id,
        tier: d.tier,
        rating: d.rating,
        review: d.review,
      })) || []
    );
  }

  async getReviewByFilmId(externalFilmId: number) {
    const { data, error } = await supabase
      .from('reviews')
      .select('tier, rating, review, films!inner(external_film_id)')
      .eq('films.external_film_id', externalFilmId)
      .maybeSingle();

    if (error) throw error;
    return data
      ? {
          external_film_id: data.films.external_film_id,
          tier: data.tier,
          rating: data.rating,
          review: data.review,
        }
      : null;
  }

  async deleteReview(externalFilmId: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data: film } = await supabase
      .from('films')
      .select('id')
      .eq('external_film_id', externalFilmId)
      .single();

    if (!film) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', session.user.id)
      .eq('film_id', film.id);

    if (error) throw error;
  }
}
