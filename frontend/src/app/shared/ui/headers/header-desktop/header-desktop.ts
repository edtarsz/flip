import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';
import { LucideUser } from '@lucide/angular';
import { Separator } from '@shared/ui/separator/separator';
import { ThemeToggle } from '@shared/ui/theme-toggle/theme-toggle';
import { HeaderOverlay } from '@shared/ui/headers/header-overlay/header-overlay';

@Component({
  selector: 'app-header',
  imports: [ThemeToggle, HeaderOverlay, LucideUser, RouterLink, RouterLinkActive, Separator],
  templateUrl: './header-desktop.html',
  styleUrl: './header-desktop.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);

  readonly isLoading = this.loadingService.isLoading;
  readonly progress = this.loadingService.progress;

  readonly isAuthenticated = this.authService.isAuthenticated;

  isOverlayVisible = signal(false);

  get user() {
    return this.authService.user();
  }

  get username() {
    return this.authService.user()?.user_metadata?.['username'];
  }

  async signOut() {
    const username = this.authService.user()?.user_metadata?.['username'];
    this.isOverlayVisible.set(false);
    await this.authService.signOut();
    this.toast.show(`Vuelve pronto ${username}!`, 'success');
  }

  toggleOverlay() {
    this.isOverlayVisible.set(!this.isOverlayVisible());
  }

  hideOverlay() {
    this.isOverlayVisible.set(false);
  }
}
