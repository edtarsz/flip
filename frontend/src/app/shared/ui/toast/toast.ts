import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { LucideCheck, LucideX } from '@lucide/angular';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [NgClass, LucideCheck, LucideX],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}
