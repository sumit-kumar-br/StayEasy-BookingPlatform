import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (authService.isLoggedIn()) {
    return true;
  }

  notification.error('Please login to continue.');
  return router.createUrlTree(['/login']);
};
