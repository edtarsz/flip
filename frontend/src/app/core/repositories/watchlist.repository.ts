import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'
import { WatchlistItem } from '@core/types/tmdb/film.type';

@Injectable({
  providedIn: 'root'
})
export class WatchlistRepository {

  async addToWatchlist(payload: {
    externalFilmId: number;
    title: string;
    posterPath: string;
    voteAverage: number;
    releaseDate: string;
    genreIds: number[];
  }) {
    const { data, error } = await supabase.rpc('add_to_watchlist_with_film', {
      p_external_film_id: payload.externalFilmId,
      p_title: payload.title,
      p_poster_path: payload.posterPath,
      p_vote_average: payload.voteAverage,
      p_release_date: payload.releaseDate,
      p_genre_ids: payload.genreIds
    })
    if (error) throw error
    return data
  }

  async removeFromWatchlist(externalFilmId: number) {
    const { data: film, error: filmError } = await supabase
      .from('films')
      .select('id')
      .eq('external_film_id', externalFilmId)
      .maybeSingle();

    if (filmError) throw filmError;

    if (film) {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('film_id', film.id);
      if (error) throw error;
    }
  }

  async getWatchlist(page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('watchlists')
      .select(`
        id,
        created_at,
        film_id,
        user_id,
        film:films (
          id,
          title,
          poster_path,
          vote_average,
          release_date,
          external_film_id,
          genre_ids
        )
      `)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error
    return data as unknown as WatchlistItem[]
  }
}