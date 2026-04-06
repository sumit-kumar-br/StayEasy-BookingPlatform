import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../models/user.model';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly currentUser$ = this.authService.currentUser$;

  readonly role = UserRole;

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  get currentPath(): string {
    return this.router.url;
  }

  shouldShowDashboardBtn(): boolean {
    const path = this.currentPath;
    // Show dashboard button for traveller on non-home, non-workspace, non-dashboard pages
    return !path.includes('/dashboard') && !path.includes('/workspace') && 
           !path.includes('/admin') && !path.includes('/manager') && path !== '/';
  }
}
