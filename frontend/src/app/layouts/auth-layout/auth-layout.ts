import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { AuthService } from '@core/services/auth.service';
import { CreateUserDTO } from '@core/types/user.type';
import { Header } from "@shared/ui/header/header";

@Component({
  selector: 'app-auth',
  imports: [FormField, Header, FormRoot],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class Auth {
  private authService = inject(AuthService)

  registerModel = signal<CreateUserDTO>({
    email: '',
    username: '',
    password: ''
  })

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.email)
    required(schemaPath.username)
    required(schemaPath.password)
  }, {
    submission: {
      action: async (fields) => {
        await this.authService.signUp(
          fields().value().email,
          fields().value().password,
          fields().value().username
        );
      }
    }
  })
}
