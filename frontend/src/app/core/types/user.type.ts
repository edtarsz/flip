import { z } from 'zod'
import { Database } from '../supabase/supabase.types'

export const createUserDTOSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string().min(8)
})

export type CreateUserDTO = z.infer<typeof createUserDTOSchema>

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']