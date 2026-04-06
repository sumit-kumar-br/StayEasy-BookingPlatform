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
        <div class="header-content">
          <h2 class="eyebrow">👥 User Moderation</h2>
          <h1>User Management</h1>
          <p class="subtitle">Verify identities, manage account status, and control platform access with role-safe actions.</p>
        </div>
      </header>

      <div class="page-nav">
        <a routerLink="/workspace">Workspace</a>
        <a routerLink="/admin/hotels">Hotel Approvals</a>
        <a routerLink="/admin/dashboard">Admin Dashboard</a>
      </div>

      <div class="table-wrapper" *ngIf="users.length; else empty">
        <table mat-table [dataSource]="users" class="full">
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
            <td mat-cell *matCellDef="let user">
              <span class="role-badge">{{ user.role }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="verified">
            <th mat-header-cell *matHeaderCellDef>Verified</th>
            <td mat-cell *matCellDef="let user">
              <span class="pill" [class.ok]="user.isVerified" [class.warn]="!user.isVerified">
                {{ user.isVerified ? '✓ Verified' : '○ Not verified' }}
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
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <p class="emoji">👤</p>
          <p class="title">No users available</p>
          <p class="subtitle">There are no users to manage at this time.</p>
        </div>
      </ng-template>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 1280px;
        margin: 28px auto;
        padding: 32px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 12px rgba(2, 6, 23, 0.08);
      }

      .header {
        margin-bottom: 28px;
        padding-bottom: 28px;
        border-bottom: 1px solid #e2e8f0;
      }

      .header-content {}

      .eyebrow {
        margin: 0 0 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #667eea;
        letter-spacing: 0.5px;
      }

      .header h1 {
        margin: 0 0 12px;
        font-size: 2rem;
        font-weight: 700;
        color: #0f2742;
      }

      .subtitle {
        margin: 0;
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
      }

      .page-nav {
        margin-bottom: 28px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .page-nav a {
        text-decoration: none;
        color: #0f2742;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .page-nav a:hover {
        color: white;
        background: #667eea;
        border-color: #667eea;
      }

      .table-wrapper {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .full {
        width: 100%;
        border-collapse: collapse;
      }

      .full th {
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 16px;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
      }

      .full td {
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 0.95rem;
      }

      .full tbody tr {
        transition: all 0.2s ease;
      }

      .full tbody tr:hover {
        background: #f8fafc;
      }

      .full tbody tr:last-child td {
        border-bottom: none;
      }

      .name-cell strong {
        color: #0f2742;
        font-weight: 700;
      }

      .role-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 0.8rem;
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
        min-width: 280px;
      }

      .verify-btn {
        margin-left: 12px;
        vertical-align: middle;
        height: 36px;
        line-height: 32px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .verify-btn:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .ban-radio-group {
        display: inline-flex;
        gap: 12px;
        align-items: center;
      }

      .empty-state {
        text-align: center;
        padding: 80px 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border: 2px dashed #cbd5e1;
        margin: 20px;
      }

      .empty-state .emoji {
        font-size: 4rem;
        margin: 0 0 16px;
      }

      .empty-state .title {
        margin: 0 0 8px;
        font-size: 1.3rem;
        font-weight: 700;
        color: #0f2742;
      }

      .empty-state .subtitle {
        margin: 0;
        color: #64748b;
        font-size: 0.95rem;
      }

      @media (max-width: 1024px) {
        .card {
          padding: 24px;
        }

        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .full th,
        .full td {
          padding: 12px;
          font-size: 0.9rem;
        }

        .verify-btn {
          margin-left: 8px;
          padding: 6px 12px;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 768px) {
        .card {
          margin: 16px;
          padding: 16px;
        }

        .header {
          margin-bottom: 20px;
          padding-bottom: 20px;
        }

        .header h1 {
          font-size: 1.6rem;
        }

        .page-nav {
          gap: 8px;
          margin-bottom: 20px;
        }

        .page-nav a {
          padding: 6px 12px;
          font-size: 0.85rem;
        }

        .full th,
        .full td {
          padding: 10px;
          font-size: 0.85rem;
        }

        .actions-cell {
          min-width: 240px;
        }

        .ban-radio-group {
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .verify-btn {
          margin-left: 0;
          margin-top: 8px;
          width: 100%;
        }

        .empty-state {
          padding: 60px 20px;
        }

        .empty-state .emoji {
          font-size: 3rem;
        }

        .empty-state .title {
          font-size: 1.1rem;
        }
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
