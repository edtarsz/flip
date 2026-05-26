import { Component, input } from '@angular/core';
import { Header } from "@shared/ui/header/header";
import { Separator } from "@shared/ui/separator/separator";

@Component({
  selector: 'app-auth-layout',
  imports: [Header, Separator],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  title = input.required<string>();
}
