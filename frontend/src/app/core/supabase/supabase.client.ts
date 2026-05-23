import { environment } from '@environments/environment'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@core/supabase/supabase.types'

export const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseKey
)