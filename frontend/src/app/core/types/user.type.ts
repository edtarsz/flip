import { z } from 'zod'
import { Database } from '../supabase/supabase.types'

export const createUserDTOSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export type CreateUserDTO = z.infer<typeof createUserDTOSchema>

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserRow = Database['public']['Tables']['users']['Row']