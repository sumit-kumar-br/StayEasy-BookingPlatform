import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { HotelService } from '../../core/services/hotel.service';
import { Booking } from '../../models/booking.model';
import { Hotel } from '../../models/hotel.model';
import { AdminUser, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <section class="container">
      <header class="hero" [ngClass]="heroClass()">
        <div>
          <p class="eyebrow">Unified Workspace</p>
          <h1>{{ title() }}</h1>
          <p class="subtitle">{{ subtitle() }}</p>
        </div>
      </header>

      <ng-container [ngSwitch]="role">
        <ng-container *ngSwitchCase="roleEnum.Traveler">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <div class="stat-icon">📚</div>
              <p class="label">Total Bookings</p>
              <p class="stat">{{ bookings.length }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">✈️</div>
              <p class="label">Upcoming Trips</p>
              <p class="stat">{{ upcomingTrips }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">⏳</div>
              <p class="label">Pending</p>
              <p class="stat">{{ pendingBookings }}</p>
            </mat-card>
          </div>

          <section class="roles-section" aria-label="Traveler responsibilities">
            <div class="roles-grid">
              <mat-card *ngFor="let roleCard of travelerRoleCards" class="role-card">
                <div class="role-header">
                  <span class="role-icon" aria-hidden="true">{{ roleCard.icon }}</span>
                  <span class="role-badge">{{ roleCard.badge }}</span>
                  <h4>{{ roleCard.name }}</h4>
                </div>
                <p class="role-summary">{{ roleCard.summary }}</p>
                <button mat-raised-button color="primary" [routerLink]="roleCard.route">
                  {{ roleCard.actionLabel }}
                </button>
              </mat-card>
            </div>
          </section>
        </ng-container>

        <ng-container *ngSwitchCase="roleEnum.HotelManager">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <div class="stat-icon">🏨</div>
              <p class="label">My Hotels</p>
              <p class="stat">{{ hotels.length }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">⏳</div>
              <p class="label">Pending Review</p>
              <p class="stat">{{ pendingHotels }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">✅</div>
              <p class="label">Approved Hotels</p>
              <p class="stat">{{ approvedHotels }}</p>
            </mat-card>
          </div>

          <section class="roles-section" aria-label="Recommended manager responsibilities">
            <h3 class="section-title">Recommended Manager Roles</h3>
            <p class="roles-subtitle">Focus on listings, guest operations, and booking response for smooth property management.</p>

            <div class="roles-grid">
              <mat-card *ngFor="let roleCard of managerRoleCards" class="role-card">
                <div class="role-header">
                  <span class="role-icon" aria-hidden="true">{{ roleCard.icon }}</span>
                  <span class="role-badge">{{ roleCard.badge }}</span>
                  <h4>{{ roleCard.name }}</h4>
                </div>
                <p class="role-summary">{{ roleCard.summary }}</p>
                <button mat-raised-button color="primary" [routerLink]="roleCard.route">
                  {{ roleCard.actionLabel }}
                </button>
              </mat-card>
            </div>
          </section>
        </ng-container>

        <ng-container *ngSwitchCase="roleEnum.Admin">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <div class="stat-icon">🏢</div>
              <p class="label">Total Hotels</p>
              <p class="stat">{{ allHotels.length }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">⏳</div>
              <p class="label">Pending Approval</p>
              <p class="stat">{{ adminPending }}</p>
            </mat-card>
            <mat-card class="stat-card">
              <div class="stat-icon">👥</div>
              <p class="label">Total Users</p>
              <p class="stat">{{ users.length }}</p>
            </mat-card>
          </div>

          <section class="roles-section" aria-label="Recommended admin responsibilities">
            <h3 class="section-title">Recommended Admin Roles</h3>
            <p class="roles-subtitle">Split responsibilities across focused admin tracks for optimal oversight.</p>

            <div class="roles-grid">
              <mat-card *ngFor="let roleCard of adminRoleCards" class="role-card">
                <div class="role-header">
                  <span class="role-icon" aria-hidden="true">{{ roleCard.icon }}</span>
                  <span class="role-badge">{{ roleCard.badge }}</span>
                  <h4>{{ roleCard.name }}</h4>
                </div>
                <p class="role-summary">{{ roleCard.summary }}</p>
                <button mat-raised-button color="primary" [routerLink]="roleCard.route">
                  {{ roleCard.actionLabel }}
                </button>
              </mat-card>
            </div>
          </section>
        </ng-container>
      </ng-container>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .hero {
        border-radius: 16px;
        padding: 64px 48px;
        color: white;
        margin: 28px 0 40px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
      }

      .hero.traveler {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .hero.manager {
        background: linear-gradient(135deg, #26a69a 0%, #26c6da 100%);
      }

      .hero.admin {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .eyebrow {
        margin: 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.85rem;
        font-weight: 600;
        opacity: 0.95;
      }

      h1 {
        margin: 0 0 16px;
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.05rem;
        line-height: 1.6;
        max-width: 600px;
      }

      .stats-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        margin-bottom: 32px;
      }

      .stat-card {
        padding: 28px 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(102, 126, 234, 0.12);
        border-color: #667eea;
      }

      .stat-icon {
        font-size: 3.2rem;
        margin-bottom: 12px;
      }

      .label {
        margin: 0 0 8px;
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat {
        margin: 0;
        font-size: 2.8rem;
        font-weight: 700;
        color: #667eea;
        line-height: 1;
      }

      .actions-row {
        margin: 32px 0 40px;
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .actions-row button {
        border-radius: 8px;
        font-weight: 600;
        padding: 12px 24px;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }

      .actions-row button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .icon {
        font-size: 1.2rem;
      }

      .section-title {
        margin: 0 0 16px;
        font-size: 1.4rem;
        font-weight: 700;
        color: #0f2742;
      }

      .roles-section {
        margin-top: 40px;
      }

      .roles-subtitle {
        margin: 8px 0 28px;
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
      }

      .roles-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }

      .role-card {
        padding: 32px 28px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(2, 6, 23, 0.06);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      }

      .role-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      .role-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 32px rgba(102, 126, 234, 0.15);
        border-color: #667eea;
      }

      .role-header {
        margin-bottom: 16px;
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 12px;
        row-gap: 10px;
        align-items: center;
      }

      .role-icon {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        background: linear-gradient(135deg, #667eea1f 0%, #764ba21f 100%);
        border: 1px solid #d4def9;
      }

      .role-badge {
        justify-self: end;
        border-radius: 999px;
        padding: 6px 12px;
        background: #eef2ff;
        color: #4c5ecb;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .role-header h4 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f2742;
        grid-column: 1 / -1;
      }

      .role-summary {
        margin: 0 0 24px;
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.6;
        flex-grow: 1;
      }

      .role-card button {
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: 600;
        transition: all 0.2s ease;
        align-self: flex-start;
        min-height: 42px;
      }

      .role-card button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      @media (max-width: 768px) {
        .container {
          padding: 0 12px;
        }

        .hero {
          padding: 48px 28px;
          margin: 20px 0 28px;
        }

        h1 {
          font-size: clamp(1.6rem, 5vw, 2rem);
        }

        .stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px 16px;
        }

        .stat {
          font-size: 2.2rem;
        }

        .stat-icon {
          font-size: 2.4rem;
        }

        .actions-row {
          margin: 24px 0 32px;
          gap: 12px;
        }

        .actions-row button {
          flex: 1;
          justify-content: center;
          padding: 10px 16px;
          font-size: 0.95rem;
        }

        .roles-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .role-card {
          padding: 24px 20px;
        }

        .role-header {
          row-gap: 8px;
        }

        .role-badge {
          font-size: 0.72rem;
          padding: 5px 10px;
        }

        .section-title {
          font-size: 1.2rem;
        }
      }
    `
  ]
})
export class WorkspaceComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly hotelService = inject(HotelService);

  readonly roleEnum = UserRole;

  role: UserRole | null = null;
  bookings: Booking[] = [];
  hotels: Hotel[] = [];
  allHotels: Hotel[] = [];
  users: AdminUser[] = [];

  readonly adminRoleCards = [
    {
      name: 'User Governance Admin',
      icon: '🛡️',
      badge: 'Trust & Safety',
      summary: 'Verify users, handle ban and unban actions, and keep account access compliant.',
      route: '/admin/users',
      actionLabel: 'Open User Controls'
    },
    {
      name: 'Hotel Moderation Admin',
      icon: '🏨',
      badge: 'Quality Control',
      summary: 'Approve or reject listings and maintain quality standards across hotels.',
      route: '/admin/hotels',
      actionLabel: 'Review Hotel Queue'
    },
    {
      name: 'Platform Operations Admin',
      icon: '📈',
      badge: 'Insights',
      summary: 'Track growth metrics, pending workload, and operational visibility.',
      route: '/admin/dashboard',
      actionLabel: 'View Control Center'
    }
  ];

  readonly travelerRoleCards = [
    {
      name: 'Discovery Traveler',
      icon: '🔍',
      badge: 'Explore',
      summary: 'Search hotels by destination, dates, and guest count to find the right stay quickly.',
      route: '/',
      actionLabel: 'Search Hotels'
    },
    {
      name: 'Booking Traveler',
      icon: '📖',
      badge: 'Trips',
      summary: 'Review your current and past reservations, payment status, and booking confirmations.',
      route: '/dashboard/bookings',
      actionLabel: 'My Bookings'
    },
    {
      name: 'Planning Traveler',
      icon: '✈️',
      badge: 'Upcoming',
      summary: 'Track your upcoming trips and prepare the next stay with a clear overview of bookings.',
      route: '/dashboard',
      actionLabel: 'Open Dashboard'
    }
  ];

  readonly managerRoleCards = [
    {
      name: 'Property Setup Manager',
      icon: '➕',
      badge: 'Onboarding',
      summary: 'Add new hotels and complete listings so properties are ready for review and approval.',
      route: '/manager/hotels/new',
      actionLabel: 'Add New Hotel'
    },
    {
      name: 'Inventory Manager',
      icon: '⚙️',
      badge: 'Operations',
      summary: 'Manage hotel details and room inventory to keep pricing and availability accurate.',
      route: '/manager/hotels',
      actionLabel: 'Manage Properties'
    },
    {
      name: 'Reservation Manager',
      icon: '📝',
      badge: 'Guest Flow',
      summary: 'Review incoming bookings and respond quickly to traveler reservations and requests.',
      route: '/manager/bookings',
      actionLabel: 'Handle Bookings'
    },
    {
      name: 'Revenue Manager',
      icon: '💰',
      badge: 'Collections',
      summary: 'Monitor collected revenue, pending booking value, and hotel-wise performance.',
      route: '/manager/revenue',
      actionLabel: 'View Revenue'
    }
  ];

  get upcomingTrips(): number {
    return this.bookings.filter((b) => new Date(b.checkIn).getTime() > Date.now()).length;
  }

  get pendingBookings(): number {
    return this.bookings.filter((b) => String(b.status).toLowerCase() === 'pending').length;
  }

  get pendingHotels(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase() === 'pendingreview').length;
  }

  get approvedHotels(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase() === 'approved').length;
  }

  get adminPending(): number {
    return this.allHotels.filter((h) => String(h.status).toLowerCase() === 'pendingreview').length;
  }

  ngOnInit(): void {
    this.role = this.authService.getRole();

    if (this.role === UserRole.Traveler) {
      this.bookingService.getMyBookings().subscribe((bookings) => {
        this.bookings = bookings;
      });
      return;
    }

    if (this.role === UserRole.HotelManager) {
      this.hotelService.getMyHotels().subscribe((hotels) => {
        this.hotels = hotels;
      });
      return;
    }

    if (this.role === UserRole.Admin) {
      this.hotelService.getAllHotels().subscribe((hotels) => {
        this.allHotels = hotels;
      });

      this.authService.getUsers().subscribe((users) => {
        this.users = users;
      });
    }
  }

  title(): string {
    if (this.role === UserRole.Traveler) {
      return 'Traveler Workspace';
    }

    if (this.role === UserRole.HotelManager) {
      return 'Hotel Manager Workspace';
    }

    return 'Admin Workspace';
  }

  subtitle(): string {
    if (this.role === UserRole.Traveler) {
      return 'Plan your trip, monitor your bookings, and continue your stay journey.';
    }

    if (this.role === UserRole.HotelManager) {
      return 'Manage your properties, room inventory, and booking operations.';
    }

    return 'Oversee hotels and users with complete platform visibility.';
  }

  heroClass(): string {
    if (this.role === UserRole.Traveler) {
      return 'traveler';
    }

    if (this.role === UserRole.HotelManager) {
      return 'manager';
    }

    return 'admin';
  }
}
