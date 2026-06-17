import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading, PreloadAllModules } from '@angular/router';

import { ROUTES } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { FilmService } from '@core/services/film.service';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      ROUTES,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withPreloading(PreloadAllModules),
    ),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(AuthService).init()),
    provideAppInitializer(() => firstValueFrom(inject(FilmService).getGenres())),
  ]
};
