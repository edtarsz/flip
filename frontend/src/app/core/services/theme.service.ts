import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeSignal = signal<'dark' | 'light'>('dark');
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'dark' | 'light';
      const initialTheme = saved || 'dark';
      this.setTheme(initialTheme);
    }
  }

  toggleTheme() {
    const newTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'dark' | 'light') {
    this.themeSignal.set(theme);

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;

      if (theme === 'light') {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        document.getElementById('theme-color-meta')?.setAttribute('content', '#e0e0e0');
      } else {
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        document.getElementById('theme-color-meta')?.setAttribute('content', '#0e0e0e');
      }
    }
  }
}
