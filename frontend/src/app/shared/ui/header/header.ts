import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
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
