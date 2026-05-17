import { Injectable } from '@angular/core'
import { supabase } from '@core/supabase/supabase.client'
import { UserInsert, UserRow } from '@core/types/user.type'

@Injectable({
    providedIn: 'root'
})
export class UsersRepository {

    async getAll(): Promise<UserRow[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')

        if (error) throw error
        return data
    }

    async create(data: UserInsert): Promise<UserRow> {
        const { data: newUser, error } = await supabase
            .from('users')
            .insert(data)
            .select()
            .single()
        if (error) throw error
        return newUser
    }

}