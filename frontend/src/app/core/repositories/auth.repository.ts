import { Injectable } from '@angular/core';
import { supabase } from '@core/supabase/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_email_exists', {
      p_email: email,
    });

    if (error) throw error;
    return !!data;
  }
}
