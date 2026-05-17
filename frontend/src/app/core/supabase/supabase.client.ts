import { environment } from '@environments/environments'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
)