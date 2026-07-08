import { computed, inject, Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { User } from '@supabase/supabase-js';
import { AuthRepository } from '../repositories/auth.repository';
import { FilmService } from './film.service';
import { SwipeService } from './swipe.service';
import { WatchlistService } from './watchlist.service';
import { LoadingService } from './loading.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authRepository = inject(AuthRepository);
  private filmService = inject(FilmService);
  private swipeService = inject(SwipeService);
  private watchlistService = inject(WatchlistService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  user = signal<User | null>(null);
  isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    supabase.auth.onAuthStateChange((event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async init(): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
      options: { data: { username } },
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, error };
  }

  async signOut() {
    this.loadingService.start();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.filmService.resetState();
      this.swipeService.clearRecommendations();
      this.watchlistService.resetState();
      await this.router.navigate(['/index']);
    } finally {
      this.loadingService.stop();
    }
  }

  async getUser() {
    return await supabase.auth.getUser();
  }

  async checkEmailExists(email: string): Promise<boolean> {
    return await this.authRepository.checkEmailExists(email);
  }
}
