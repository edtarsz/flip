import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LucideUser } from '@lucide/angular';
import { Separator } from "@shared/ui/separator/separator";

@Component({
  selector: 'app-header',
  imports: [LucideUser, RouterLink, RouterLinkActive, Separator],
  templateUrl: './header-desktop.html',
  styleUrl: './header-desktop.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

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
    this.toast.show(`Vuelve pronto ${this.authService.user()?.user_metadata['username']}!`, 'success');
  }

  toggleOverlay() {
    this.isOverlayVisible.set(!this.isOverlayVisible());
  }

  hideOverlay() {
    this.isOverlayVisible.set(false);
  }
}
