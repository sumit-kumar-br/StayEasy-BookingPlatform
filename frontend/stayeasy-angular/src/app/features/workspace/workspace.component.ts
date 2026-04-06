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
            <mat-card>
              <h3>Total Bookings</h3>
              <p>{{ bookings.length }}</p>
            </mat-card>
            <mat-card>
              <h3>Upcoming Trips</h3>
              <p>{{ upcomingTrips }}</p>
            </mat-card>
            <mat-card>
              <h3>Pending</h3>
              <p>{{ pendingBookings }}</p>
            </mat-card>
          </div>

          <div class="actions-row">
            <button mat-flat-button color="primary" routerLink="/">Search Hotels</button>
            <button mat-stroked-button routerLink="/dashboard/bookings">My Bookings</button>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="roleEnum.HotelManager">
          <div class="stats-grid">
            <mat-card>
              <h3>My Hotels</h3>
              <p>{{ hotels.length }}</p>
            </mat-card>
            <mat-card>
              <h3>Pending Review</h3>
              <p>{{ pendingHotels }}</p>
            </mat-card>
            <mat-card>
              <h3>Approved Hotels</h3>
              <p>{{ approvedHotels }}</p>
            </mat-card>
          </div>

          <div class="actions-row">
            <button mat-flat-button color="primary" routerLink="/manager/hotels/new">Add Hotel</button>
            <button mat-stroked-button routerLink="/manager/hotels">Manage Hotels</button>
            <button mat-stroked-button routerLink="/manager/bookings">Incoming Bookings</button>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="roleEnum.Admin">
          <div class="stats-grid">
            <mat-card>
              <h3>Total Hotels</h3>
              <p>{{ allHotels.length }}</p>
            </mat-card>
            <mat-card>
              <h3>Pending Approval</h3>
              <p>{{ adminPending }}</p>
            </mat-card>
            <mat-card>
              <h3>Total Users</h3>
              <p>{{ users.length }}</p>
            </mat-card>
          </div>

          <div class="actions-row">
            <button mat-flat-button color="primary" routerLink="/admin/hotels">Review Hotels</button>
            <button mat-stroked-button routerLink="/admin/users">Manage Users</button>
            <button mat-stroked-button routerLink="/admin/dashboard">Admin Dashboard</button>
            <button mat-stroked-button routerLink="/">Go Home</button>
          </div>

          <section class="quick-nav" aria-label="Admin quick navigation">
            <h2>Quick Navigation</h2>
            <div class="quick-nav-links">
              <a routerLink="/admin/hotels">Hotel Approvals</a>
              <a routerLink="/admin/users">User Governance</a>
              <a routerLink="/admin/dashboard">Platform Dashboard</a>
              <a routerLink="/workspace">Workspace Home</a>
            </div>
          </section>

          <section class="roles-section" aria-label="Recommended admin responsibilities">
            <h2>Recommended Admin Roles</h2>
            <p class="roles-subtitle">Use these role tracks to split ownership and keep workflows clear.</p>

            <div class="roles-grid">
              <mat-card *ngFor="let roleCard of adminRoleCards">
                <h3>{{ roleCard.name }}</h3>
                <p>{{ roleCard.summary }}</p>
                <button mat-stroked-button color="primary" [routerLink]="roleCard.route">{{ roleCard.actionLabel }}</button>
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
        margin: 24px auto;
        padding: 0 16px;
      }

      .hero {
        border-radius: 16px;
        padding: 20px;
        color: #f8fafc;
        margin-bottom: 16px;
      }

      .hero.traveler {
        background: linear-gradient(125deg, #0b3b64, #145b92);
      }

      .hero.manager {
        background: linear-gradient(125deg, #0f4e3f, #1c7a65);
      }

      .hero.admin {
        background: linear-gradient(125deg, #2b3645, #4b6078);
      }

      .eyebrow {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: #dbeafe;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.7rem, 2.6vw, 2.4rem);
      }

      .subtitle {
        margin: 8px 0 0;
        color: #dbeafe;
      }

      .stats-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .stats-grid mat-card p {
        margin: 10px 0 0;
        font-size: 2rem;
        font-weight: 700;
        color: #1f3a56;
      }

      .actions-row {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .quick-nav,
      .roles-section {
        margin-top: 18px;
      }

      .quick-nav h2,
      .roles-section h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #1e293b;
      }

      .quick-nav-links {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .quick-nav-links a {
        text-decoration: none;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 6px 12px;
        color: #0f172a;
        background: #f8fafc;
        font-weight: 600;
      }

      .quick-nav-links a:hover {
        border-color: #1d4ed8;
        color: #1d4ed8;
      }

      .roles-subtitle {
        margin: 8px 0 0;
        color: #64748b;
      }

      .roles-grid {
        margin-top: 12px;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }

      .roles-grid mat-card {
        border-radius: 12px;
      }

      .roles-grid h3 {
        margin: 0;
        color: #0f172a;
      }

      .roles-grid p {
        margin: 8px 0 14px;
        color: #475569;
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
      summary: 'Verify users, handle ban and unban actions, and keep account access compliant.',
      route: '/admin/users',
      actionLabel: 'Open User Controls'
    },
    {
      name: 'Hotel Moderation Admin',
      summary: 'Approve or reject listings and maintain quality standards across hotels.',
      route: '/admin/hotels',
      actionLabel: 'Review Hotel Queue'
    },
    {
      name: 'Platform Operations Admin',
      summary: 'Track growth metrics, pending workload, and operational visibility.',
      route: '/admin/dashboard',
      actionLabel: 'View Control Center'
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
