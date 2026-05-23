import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'
import { ProfileInsert, ProfileRow } from '@core/types/user.type'

@Injectable({
  providedIn: 'root'
})
export class ProfileRepository {

  async getAll(): Promise<ProfileRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) throw error
    return data
  }
}