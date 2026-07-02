import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LoginSchema, loginSchema } from '@core/types/user.type';
import { Button } from '@shared/ui/button/button';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, FormRoot, RouterModule, Button],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);

  loginModel = signal<LoginSchema>({
    email: '',
    password: '',
  });

  loginForm = form(
    this.loginModel,
    (schemaPath) => {
      validateStandardSchema(schemaPath, loginSchema);
    },
    {
      submission: {
        action: async (fields) => {
          this.loadingService.start();
          try {
            const { error } = await this.authService.signIn(
              fields().value().email,
              fields().value().password,
            );

            if (error) {
              this.toast.show(error.message, 'error');
              this.loadingService.stop();
            } else {
              this.toast.show(
                `Bienvenido ${this.authService.user()?.user_metadata['username']}!`,
                'success',
              );
              this.router.navigate(['/swipe']);
            }
          } catch (err: any) {
            this.toast.show(err.message || 'An unexpected error occurred.', 'error');
            this.loadingService.stop();
          }
        },
      },
    },
  );
}
