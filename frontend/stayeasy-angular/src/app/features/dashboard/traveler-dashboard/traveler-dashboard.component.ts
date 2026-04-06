import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-traveler-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  template: `
    <section class="dashboard-container">
      <header class="hero-section">
        <div class="hero-content">
          <p class="eyebrow">Welcome back to StayEasy</p>
          <h1>Your Travel Dashboard</h1>
          <p class="subtitle">Search stays, track bookings, and manage your upcoming trips</p>
        </div>
        <div class="hero-actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>search</mat-icon>
            Search Hotels
          </button>
          <button mat-stroked-button color="primary" routerLink="/dashboard/bookings">
            <mat-icon>list_alt</mat-icon>
            View All Bookings
          </button>
        </div>
      </header>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-icon">📚</div>
          <h3>Total Bookings</h3>
          <p class="stat-value">{{ bookings.length }}</p>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon">✈️</div>
          <h3>Upcoming Trips</h3>
          <p class="stat-value">{{ upcomingTrips }}</p>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon">⏳</div>
          <h3>Pending Payments</h3>
          <p class="stat-value">{{ pendingBookings }}</p>
        </mat-card>
      </div>

      <mat-card class="recent-bookings">
        <div class="section-header">
          <h2>Recent Bookings</h2>
          <button mat-icon-button routerLink="/dashboard/bookings">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div class="empty-state" *ngIf="!bookings.length">
          <span class="empty-icon">🏨</span>
          <p>No bookings yet. Start your journey by searching for hotels!</p>
          <button mat-raised-button color="primary" routerLink="/">Search Hotels Now</button>
        </div>

        <div class="booking-list" *ngIf="bookings.length">
          <div class="booking-item" *ngFor="let booking of bookings.slice(0, 3)">
            <div class="booking-info">
              <h4>{{ booking.hotelName }}</h4>
              <p class="booking-dates">
                <mat-icon>calendar_today</mat-icon>
                {{ booking.checkIn | date: 'MMM dd' }} - {{ booking.checkOut | date: 'MMM dd, yyyy' }}
              </p>
              <p class="booking-room">{{ booking.roomTypeName }}</p>
            </div>
            <div class="booking-status-section">
              <app-status-badge [status]="booking.status"></app-status-badge>
              <button mat-icon-button color="primary" [routerLink]="['/dashboard/bookings', booking.id]" title="View booking details">
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .dashboard-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        padding: 32px 16px;
      }

      .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        padding: 48px 32px;
        margin-bottom: 40px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 32px;
      }

      .hero-content {
        flex: 1;
      }

      .eyebrow {
        margin: 0 0 8px;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 600;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 2.8rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.15rem;
        font-weight: 300;
      }

      .hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        button {
          min-height: 44px;
          padding: 0 24px;
          font-weight: 500;

          mat-icon {
            margin-right: 8px;
          }
        }
      }

      .stats-grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        margin-bottom: 40px;
        max-width: 1120px;
        margin-left: auto;
        margin-right: auto;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 28px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border-top: 4px solid #667eea;

        &:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }

        h3 {
          margin: 0 0 16px;
          color: #0f2742;
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          margin: 0;
          font-size: 3rem;
          font-weight: 700;
          color: #667eea;
          line-height: 1;
        }
      }

      .recent-bookings {
        background: white;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        max-width: 1120px;
        margin: 0 auto;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f0f0;

        h2 {
          margin: 0;
          color: #0f2742;
          font-size: 1.4rem;
          font-weight: 700;
        }
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 16px;
        }

        p {
          color: #64748b;
          margin: 0 0 24px;
          font-size: 1.05rem;
        }
      }

      .booking-list {
        display: grid;
        gap: 16px;
      }

      .booking-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        transition: all 0.2s ease;

        &:hover {
          background: #f0f4ff;
        }
      }

      .booking-info {
        flex: 1;

        h4 {
          margin: 0 0 8px;
          color: #0f2742;
          font-size: 1.1rem;
          font-weight: 600;
        }

        p {
          margin: 6px 0;
          color: #64748b;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #667eea;
          }
        }
      }

      .booking-dates {
        font-weight: 500;
        color: #0f2742 !important;
      }

      .booking-room {
        font-size: 0.9rem;
      }

      .booking-status-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      @media (max-width: 1024px) {
        .hero-section {
          flex-direction: column;
          align-items: flex-start;
        }

        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 20px 16px;
        }

        .hero-section {
          padding: 32px 20px;
          margin-bottom: 28px;
        }

        h1 {
          font-size: 2rem;
        }

        .stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          padding: 20px;

          .stat-value {
            font-size: 2.4rem;
          }
        }

        .recent-bookings {
          padding: 20px;
        }

        .booking-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;

          .booking-status-section {
            align-self: flex-end;
          }
        }

        .hero-actions {
          width: 100%;

          button {
            flex: 1;
          }
        }
      }
    `
  ]
})
export class TravelerDashboardComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  bookings: Booking[] = [];

  get upcomingTrips(): number {
    return this.bookings.filter((b) => new Date(b.checkIn).getTime() > Date.now()).length;
  }

  get pendingBookings(): number {
    return this.bookings.filter((b) => String(b.status).toLowerCase() === 'pending').length;
  }

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe((bookings) => {
      this.bookings = bookings;
    });
  }
}
