import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSignal = signal<boolean>(false);
  private progressSignal = signal<number>(0);
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly progress = this.progressSignal.asReadonly();

  start() {
    if (this.isLoadingSignal()) return;

    this.clearTimeouts();
    this.isLoadingSignal.set(true);
    this.progressSignal.set(0);

    this.timeouts.push(setTimeout(() => this.progressSignal.set(40), 500));
    this.timeouts.push(setTimeout(() => this.progressSignal.set(70), 1500));
    this.timeouts.push(setTimeout(() => this.progressSignal.set(90), 3000));
  }

  stop() {
    this.clearTimeouts();
    this.progressSignal.set(100);

    // La barra tiene un duration 200, el timeout tiene que ser mayor
    setTimeout(() => {
      this.isLoadingSignal.set(false);
      this.progressSignal.set(0);
    }, 250);
  }

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }
}
