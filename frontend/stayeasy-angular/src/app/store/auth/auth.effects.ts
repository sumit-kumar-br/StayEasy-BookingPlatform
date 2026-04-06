import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((user) => AuthActions.loginSuccess({ user })),
          catchError((error) => of(AuthActions.loginFailure({ error: this.readError(error) })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ request }) =>
        this.authService.register(request).pipe(
          map(() => AuthActions.registerSuccess()),
          catchError((error) => of(AuthActions.registerFailure({ error: this.readError(error) })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.notification.success('Logged in successfully.');
          this.router.navigate(['/workspace']);
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => this.notification.error(error))
      ),
    { dispatch: false }
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          this.notification.success('Registration successful. Please verify your email.');
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout().subscribe();
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  private readError(error: unknown): string {
    const err = error as {
      message?: string;
      error?: {
        message?: string;
        errors?: string[] | Record<string, string[]>;
      };
    };

    const apiErrors = err?.error?.errors;
    if (Array.isArray(apiErrors) && apiErrors.length > 0) {
      return apiErrors[0];
    }

    if (apiErrors && typeof apiErrors === 'object') {
      const first = Object.values(apiErrors)[0];
      if (Array.isArray(first) && first.length > 0) {
        return first[0];
      }
    }

    return err?.error?.message || err?.message || 'Request failed.';
  }
}
