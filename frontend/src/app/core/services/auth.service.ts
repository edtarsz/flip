import { computed, inject, Injectable, signal } from '@angular/core'
import { supabase } from '../supabase/supabase.client'
import { User } from '@supabase/supabase-js';
import { AuthRepository } from '../repositories/auth.repository';
import { FilmService } from './film.service';
import { SwipeService } from './swipe.service';
import { WatchlistService } from './watchlist.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authRepository = inject(AuthRepository);
  private filmService = inject(FilmService);
  private swipeService = inject(SwipeService);
  private watchlistService = inject(WatchlistService);
  private loadingService = inject(LoadingService);

  user = signal<User | null>(null);
  isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    supabase.auth.onAuthStateChange((event, session) => {
      this.user.set(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        this.swipeService.getRecommendations().catch(console.error);
      }
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
    this.loadingService.start();
    try {
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
    } finally {
      this.loadingService.stop();
    }
  }

  async signIn(email: string, password: string) {
    this.loadingService.start();
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    } finally {
      this.loadingService.stop();
    }
  }

  async signOut() {
    this.loadingService.start();
    try {
      await supabase.auth.signOut();
    } finally {
      this.filmService.resetState();
      this.swipeService.clearRecommendations();
      this.watchlistService.resetState();
      this.loadingService.stop();
    }
  }

  async getUser() {
    return await supabase.auth.getUser()
  }

  async checkEmailExists(email: string): Promise<boolean> {
    return await this.authRepository.checkEmailExists(email);
  }
}