import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../models/user.model';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);

  readonly currentUser$ = this.authService.currentUser$;

  readonly role = UserRole;

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
