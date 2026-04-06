import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiMessage = error.error?.message as string | undefined;
      let validationError: string | undefined;

      if (Array.isArray(error.error?.errors)) {
        validationError = error.error.errors[0] as string | undefined;
      } else if (error.error?.errors && typeof error.error.errors === 'object') {
        const first = Object.values(error.error.errors)[0] as string[] | undefined;
        validationError = first?.[0];
      }

      notification.error(apiMessage || validationError || 'An unexpected error occurred.');
      return throwError(() => error);
    })
  );
};
