import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { authFeatureKey, authReducer } from './store/auth/auth.reducer';
import { bookingFeatureKey, bookingReducer } from './store/booking/booking.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { BookingEffects } from './store/booking/booking.effects';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([errorInterceptor])),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideStore({
      [authFeatureKey]: authReducer,
      [bookingFeatureKey]: bookingReducer
    }),
    provideEffects([AuthEffects, BookingEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false })
  ]
};
