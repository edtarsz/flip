import { Component, signal, inject } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { LoadingService } from '@core/services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe(() => {
        if (this.loadingService.isLoading()) {
          this.loadingService.stop();
        }
      });
  }
}
