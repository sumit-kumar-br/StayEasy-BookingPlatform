import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUser } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRadioModule
  ],
  template: `
    <mat-card class="card">
      <header class="header">
        <h2>User Management</h2>
        <p class="subtitle">Review verification and control account access with quick role-safe actions.</p>
      </header>

      <div class="page-nav">
        <a routerLink="/workspace">Workspace</a>
        <a routerLink="/admin/hotels">Hotel Approvals</a>
        <a routerLink="/admin/dashboard">Admin Dashboard</a>
      </div>

      <table mat-table [dataSource]="users" class="full" *ngIf="users.length; else empty">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let user">
            <div class="name-cell">
              <strong>{{ user.fullName }}</strong>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let user">{{ user.email }}</td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let user">{{ user.role }}</td>
        </ng-container>

        <ng-container matColumnDef="verified">
          <th mat-header-cell *matHeaderCellDef>Verified</th>
          <td mat-cell *matCellDef="let user">
            <span class="pill" [class.ok]="user.isVerified" [class.warn]="!user.isVerified">
              {{ user.isVerified ? 'Verified' : 'Not verified' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let user">
            <span class="pill" [class.banned]="user.isBanned" [class.ok]="!user.isBanned && user.isActive" [class.warn]="!user.isBanned && !user.isActive">
              {{ statusOf(user) }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="createdAt">
          <th mat-header-cell *matHeaderCellDef>Joined</th>
          <td mat-cell *matCellDef="let user">{{ user.createdAt | date: 'mediumDate' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user" class="actions-cell">
            <mat-radio-group
              aria-label="User status"
              class="ban-radio-group"
              [value]="user.isBanned ? 'banned' : 'active'"
              [disabled]="loadingUserId === user.id"
              (change)="setBanState(user, $event.value)">
              <mat-radio-button value="active">Unban</mat-radio-button>
              <mat-radio-button value="banned" color="warn">Ban</mat-radio-button>
            </mat-radio-group>

            <button
              mat-stroked-button
              color="primary"
              class="verify-btn"
              matTooltip="Verify user"
              *ngIf="!user.isVerified"
              (click)="verifyUser(user)"
              [disabled]="loadingUserId === user.id">
              Verify
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <ng-template #empty>
        <p>No users available.</p>
      </ng-template>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 1200px;
        margin: 22px auto;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 10px 28px rgba(2, 6, 23, 0.08);
      }

      .header {
        margin-bottom: 14px;
      }

      .header h2 {
        margin: 0;
        font-size: 1.8rem;
      }

      .subtitle {
        margin: 8px 0 0;
        color: #475569;
      }

      .full {
        width: 100%;
      }

      .page-nav {
        margin: 10px 0 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .page-nav a {
        text-decoration: none;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 5px 11px;
        font-weight: 600;
      }

      .page-nav a:hover {
        color: #1d4ed8;
        border-color: #1d4ed8;
      }

      .full th {
        color: #334155;
        font-weight: 700;
      }

      .name-cell strong {
        color: #0f172a;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.78rem;
        font-weight: 700;
        background: #eef2ff;
        color: #3730a3;
      }

      .pill.ok {
        background: #dcfce7;
        color: #166534;
      }

      .pill.warn {
        background: #fef3c7;
        color: #92400e;
      }

      .pill.banned {
        background: #fee2e2;
        color: #b91c1c;
      }

      .actions-cell {
        min-width: 220px;
      }

      .verify-btn {
        margin-left: 10px;
        vertical-align: middle;
        height: 34px;
        line-height: 32px;
      }

      .ban-radio-group {
        display: inline-flex;
        gap: 10px;
        align-items: center;
      }
    `
  ]
})
export class AdminUsersComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns = ['name', 'email', 'role', 'verified', 'status', 'createdAt', 'actions'];
  users: AdminUser[] = [];
  loadingUserId: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  statusOf(user: AdminUser): string {
    if (user.isBanned) {
      return 'Banned';
    }
    return user.isActive ? 'Active' : 'Inactive';
  }

  verifyUser(user: AdminUser): void {
    this.loadingUserId = user.id;
    this.authService.verifyUser(user.id).subscribe({
      next: (res) => {
        this.loadingUserId = null;
        if (res.success) {
          this.snackBar.open(res.message || 'User verified successfully', 'Close', { duration: 3000 });
          user.isVerified = true;
        } else {
          this.snackBar.open(res.message || 'Failed to verify user', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loadingUserId = null;
        this.snackBar.open('Error: ' + (err.error?.message || 'Failed to verify user'), 'Close', { duration: 3000 });
      }
    });
  }

  setBanState(user: AdminUser, target: 'active' | 'banned'): void {
    const shouldBan = target === 'banned';

    if (user.isBanned === shouldBan) {
      return;
    }

    const action = shouldBan ? 'ban' : 'unban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    this.loadingUserId = user.id;
    const request = shouldBan ? this.authService.banUser(user.id) : this.authService.unbanUser(user.id);

    request.subscribe({
      next: (res) => {
        this.loadingUserId = null;
        if (res.success) {
          this.snackBar.open(res.message || `User ${action}ned successfully`, 'Close', { duration: 3000 });
          user.isBanned = shouldBan;
        } else {
          this.snackBar.open(res.message || `Failed to ${action} user`, 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loadingUserId = null;
        this.snackBar.open('Error: ' + (err.error?.message || `Failed to ${action} user`), 'Close', { duration: 3000 });
      }
    });
  }
}
