import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const expectedRoles = (route.data['roles'] as UserRole[]) ?? [];

  if (!authService.isLoggedIn()) {
    notification.error('Please login to continue.');
    return router.createUrlTree(['/login']);
  }

  const userRole = authService.getRole();
  if (userRole !== null && expectedRoles.includes(userRole)) {
    return true;
  }

  notification.error('Access denied.');
  return router.createUrlTree(['/']);
};
