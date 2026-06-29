import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  private router = inject(Router);

  get title(): string {
    return this.router.url.includes('login') ? 'Log In' : 'Sign Up';
  }
}
