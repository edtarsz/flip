import { Injectable } from '@angular/core'
import { supabase } from '../supabase/supabase.client'

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    async signUp(email: string, password: string) {
        return await supabase.auth.signUp({
            email,
            password
        })
    }

    async signIn(email: string, password: string) {
        return await supabase.auth.signInWithPassword({
            email,
            password
        })
    }

    async signOut() {
        return await supabase.auth.signOut()
    }

    async getUser() {
        return await supabase.auth.getUser()
    }
}