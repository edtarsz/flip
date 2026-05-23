import { computed, Injectable, signal } from '@angular/core'
import { supabase } from '../supabase/supabase.client'
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);
  isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    supabase.auth.onAuthStateChange((_, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async init(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    this.user.set(session?.user ?? null);
  }

  requireUser() {
    const user = this.user();

    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  requireUserId() {
    return this.requireUser().id;
  }

  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      throw error;
    }
    return data;
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