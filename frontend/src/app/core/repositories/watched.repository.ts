import { Injectable } from '@angular/core';
import { supabase } from '@core/supabase/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class WatchedRepository {
  async markAsWatched(payload: {
    externalFilmId: number;
    title: string;
    posterPath: string;
    voteAverage: number;
    releaseDate: string;
    genreIds: number[];
  }) {
    const { data, error } = await supabase.rpc('mark_film_as_watched', {
      p_external_film_id: payload.externalFilmId,
      p_title: payload.title,
      p_poster_path: payload.posterPath,
      p_vote_average: payload.voteAverage,
      p_release_date: payload.releaseDate,
      p_genre_ids: payload.genreIds,
    });

    if (error) throw error;
    return data as { success: boolean; film_id: string };
  }

  async getWatchedFilmIds(): Promise<string[]> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('watched_film_ids')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;
    return data?.watched_film_ids || [];
  }
}
