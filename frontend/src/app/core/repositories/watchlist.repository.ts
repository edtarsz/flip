import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'

@Injectable({
  providedIn: 'root'
})
export class WatchlistRepository {

  async addToWatchlist(externalFilmId: number, userId: string) {
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        external_film_id: externalFilmId,
        user_id: userId
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async removeFromWatchlist(externalFilmId: number) {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('external_film_id', externalFilmId)
    if (error) throw error
  }

  async getWatchlist() {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
    if (error) throw error
    return data
  }
}