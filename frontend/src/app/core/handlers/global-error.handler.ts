import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: any): void {
    const rawError = error?.rejection || error;

    const message = rawError?.message || rawError?.error?.message || 'Ocurrió un error inesperado';

    if (message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      console.error(error);
      return;
    }

    this.toastService.show(message);

    console.error('Captured Global Error:', error);
  }
}
