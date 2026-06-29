import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { LucideClapperboard, LucideGalleryHorizontalEnd, LucideNetwork, LucideThumbsUp } from '@lucide/angular';
import { Separator } from '@shared/ui/separator/separator';
import { ThemeToggle } from "@shared/ui/theme-toggle/theme-toggle";

@Component({
  selector: 'app-header-overlay',
  imports: [
    RouterLink,
    RouterLinkActive,
    Separator,
    LucideGalleryHorizontalEnd,
    LucideClapperboard,
    LucideThumbsUp,
    LucideNetwork,
    ThemeToggle
],
  templateUrl: './header-overlay.html',
})
export class HeaderOverlay {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly close = output<void>();
  readonly signedOut = output<void>();

  onClose() {
    this.close.emit();
  }

  onSignOut() {
    this.signedOut.emit();
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
  }
}
