import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
  ErrorHandler,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { ROUTES } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { FilmService } from '@core/services/film.service';
import { firstValueFrom } from 'rxjs';
import { GlobalErrorHandler } from '@core/handlers/global-error.handler';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      ROUTES,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(AuthService).init()),
    provideAppInitializer(() => firstValueFrom(inject(FilmService).getGenres())),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
