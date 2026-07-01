import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'
import { FilmTMDB } from '@core/types/tmdb/film.type'
import { GenreTMDB } from '@core/types/tmdb/genre.type'

export interface RecordSwipePayload {
  film: FilmTMDB
  direction: 'like' | 'dislike'
  genres: GenreTMDB[]
}

@Injectable({
  providedIn: 'root'
})
export class SwipeRepository {

  async recordSwipe(payload: RecordSwipePayload): Promise<void> {
    const { film, direction, genres } = payload
    const genreNames = genres
      .filter(g => film.genre_ids.includes(g.id))
      .map(g => g.name)

    const { error } = await supabase.functions.invoke('record-swipe', {
      body: {
        external_film_id: film.id,
        title: film.title,
        poster_path: film.poster_path,
        vote_average: film.vote_average,
        vote_count: film.vote_count,
        release_date: film.release_date,
        direction,
        genre_names: genreNames,
        genre_ids: film.genre_ids || [],
        signal_strength: null,
      },
      method: 'POST'
    })

    if (error) throw error
  }

  async getRecommendations(): Promise<FilmTMDB[]> {
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      method: 'GET'
    })

    if (error) throw error
    return (data?.results ?? []) as FilmTMDB[]
  }
}
