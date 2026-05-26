import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'

@Injectable({
  providedIn: 'root'
})
export class ProfileRepository {

  async checkUsernameExists(username: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_username_exists', {
      p_username: username
    })

    if (error) throw error
    return !!data
  }
}