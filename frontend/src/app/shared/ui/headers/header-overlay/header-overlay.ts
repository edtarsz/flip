import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Separator } from '@shared/ui/separator/separator';

@Component({
  selector: 'app-header-overlay',
  imports: [RouterLink, RouterLinkActive, Separator],
  templateUrl: './header-overlay.html',
})
export class HeaderOverlay {
  private authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly close = output<void>();
  readonly signedOut = output<void>();

  onClose() {
    this.close.emit();
  }

  onSignOut() {
    this.signedOut.emit();
  }
}
