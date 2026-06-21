import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  isDismissing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type, duration };

    this.toastsSignal.update(current => [...current, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  dismiss(id: string) {
    const toast = this.toastsSignal().find(t => t.id === id);
    if (!toast || toast.isDismissing) return;

    this.toastsSignal.update(current =>
      current.map(t => t.id === id ? { ...t, isDismissing: true } : t)
    );

    setTimeout(() => {
      this.toastsSignal.update(current => current.filter(t => t.id !== id));
    }, 350);
  }
}
