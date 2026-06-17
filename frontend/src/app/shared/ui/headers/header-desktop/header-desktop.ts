import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LucideUser } from '@lucide/angular';
import { Separator } from "@shared/ui/separator/separator";

@Component({
  selector: 'app-header',
  imports: [LucideUser, RouterLink, Separator],
  templateUrl: './header-desktop.html',
  styleUrl: './header-desktop.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly isAuthenticated = this.authService.isAuthenticated;

  isOverlayVisible = signal(false);

  get user() {
    return this.authService.user();
  }

  get username() {
    return this.authService.user()?.user_metadata?.['username'];
  }

  signOut() {
    this.isOverlayVisible.set(false);
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  toggleOverlay() {
    this.isOverlayVisible.set(!this.isOverlayVisible());
  }

  hideOverlay() {
    this.isOverlayVisible.set(false);
  }
}
