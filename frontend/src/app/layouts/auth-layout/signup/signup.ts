import { Component, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, validate, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { RegisterSchema, registerSchema } from '@core/types/user.type';
import { LucideArrowBigLeft } from '@lucide/angular';
import { Button } from '@shared/ui/button/button';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormField, FormRoot, LucideArrowBigLeft, RouterModule, Button],
  templateUrl: './signup.html',
})
export class SignUp {
  private authService = inject(AuthService)
  private profileService = inject(ProfileService)
  private router = inject(Router)
  private loadingService = inject(LoadingService)

  step = signal<1 | 2>(1);
  emailError = signal<string | null>(null);
  usernameError = signal<string | null>(null);

  lastCheckedEmail = signal<string | null>(null);
  lastCheckedUsername = signal<string | null>(null);

  registerModel = signal<RegisterSchema>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  registerForm = form(this.registerModel, (schemaPath) => {
    validateStandardSchema(schemaPath, registerSchema);

    validate(schemaPath.email, () => {
      return this.emailError() ? { kind: 'exists', message: this.emailError()! } : undefined;
    });
    validate(schemaPath.username, () => {
      return this.usernameError() ? { kind: 'exists', message: this.usernameError()! } : undefined;
    });
  }, {
    submission: {
      action: async (fields) => {
        this.loadingService.start();
        try {
          await this.authService.signUp(
            fields().value().email,
            fields().value().password,
            fields().value().username
          );

          this.router.navigate(['/swipe']);
        } catch (e) {
          this.loadingService.stop();
          console.error(e);
        }
      }
    }
  })

  constructor() {
    effect(() => {
      this.registerModel().email;
      untracked(() => {
        this.emailError.set(null);
        this.lastCheckedEmail.set(null);
      });
    });

    effect(() => {
      this.registerModel().username;
      untracked(() => {
        this.usernameError.set(null);
        this.lastCheckedUsername.set(null);
      });
    });
  }

  async goToStep2() {
    this.registerForm.email().markAsTouched();
    this.registerForm.username().markAsTouched();

    if (!this.registerForm.email().valid() || !this.registerForm.username().valid()) {
      return;
    }

    const email = this.registerForm.email().value();
    const username = this.registerForm.username().value();

    if (email !== this.lastCheckedEmail()) {
      const emailExists = await this.authService.checkEmailExists(email);
      if (emailExists) {
        this.emailError.set('Email already exists');
      } else {
        this.emailError.set(null);
        this.lastCheckedEmail.set(email);
      }
    }

    if (username !== this.lastCheckedUsername()) {
      const usernameExists = await this.profileService.checkUsernameExists(username);
      if (usernameExists) {
        this.usernameError.set('Username already exists');
      } else {
        this.usernameError.set(null);
        this.lastCheckedUsername.set(username);
      }
    }

    if (this.registerForm.email().valid() && this.registerForm.username().valid()) {
      this.step.set(2);
    }
  }
}
