import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { ROUTES } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(AuthService).init())
  ]
};
