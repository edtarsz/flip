import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;

  get user() {
    return this.authService.user();
  }

  async signOut() {
    await this.authService.signOut();
  }
}
