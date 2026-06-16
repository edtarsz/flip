import { Component, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LoginSchema, loginSchema } from '@core/types/user.type';
import { AuthLayout } from '../auth-layout';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, FormRoot, AuthLayout, RouterModule, Button],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService)
  private router = inject(Router)

  loginError = signal<string | null>(null);

  loginModel = signal<LoginSchema>({
    email: '',
    password: ''
  })

  loginForm = form(this.loginModel, (schemaPath) => {
    validateStandardSchema(schemaPath, loginSchema);
  }, {
    submission: {
      action: async (fields) => {
        this.loginError.set(null);
        try {
          const { error } = await this.authService.signIn(
            fields().value().email,
            fields().value().password
          );

          if (error) {
            this.loginError.set(error.message);
          } else {
            this.router.navigate(['/index']);
          }
        } catch (err: any) {
          this.loginError.set(err.message || 'An unexpected error occurred.');
        }
      }
    }
  })

  constructor() {
    effect(() => {
      this.loginModel().email;
      this.loginModel().password;
      untracked(() => this.loginError.set(null));
    });
  }
}
