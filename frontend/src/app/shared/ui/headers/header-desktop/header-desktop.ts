import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [LucideUser, RouterLink],
  templateUrl: './header-desktop.html',
  styleUrl: './header-desktop.css',
})
export class Header {
  private authService = inject(AuthService);
  private router: any = inject(Router);
  readonly isAuthenticated = this.authService.isAuthenticated;

  get user() {
    return this.authService.user();
  }

  get username() {
    return this.authService.user()?.user_metadata?.['username'];
  }

  async signOut() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
