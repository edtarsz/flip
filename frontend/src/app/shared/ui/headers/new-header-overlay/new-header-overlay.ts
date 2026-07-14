import { Component, inject, output, input } from '@angular/core';
import { Sidebar } from '@shared/ui/sidebar/sidebar';
import { LucideSettings } from '@lucide/angular';
import { ThemeToggle } from '@shared/ui/theme-toggle/theme-toggle';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { Separator } from '@shared/ui/separator/separator';

@Component({
  selector: 'app-new-header-overlay',
  imports: [Sidebar, LucideSettings, ThemeToggle, RouterLink, RouterLinkActive, Separator],
  templateUrl: './new-header-overlay.html',
})
export class NewHeaderOverlay {
  isOpen = input<boolean>(false);

  close = output<void>();
  signedOut = output<void>();

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  readonly isAuthenticated = this.authService.isAuthenticated;

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
