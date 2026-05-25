import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'

@Injectable({
  providedIn: 'root'
})
export class WatchlistRepository {

  async addToWatchlist(payload: {
    externalFilmId: number;
    title: string;
    posterPath: string;
    rating: number;
    releaseDate: string;
  }) {
    const { data, error } = await supabase.rpc('add_to_watchlist_with_film', {
      p_external_film_id: payload.externalFilmId,
      p_title: payload.title,
      p_poster_path: payload.posterPath,
      p_rating: payload.rating,
      p_release_date: payload.releaseDate
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

  async getWatchlist() {
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
          vote_average:rating,
          release_date
        )
      `);

    if (error) throw error
    return data
  }
}