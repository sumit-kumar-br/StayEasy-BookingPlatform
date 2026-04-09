import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <div class="page-header">
        <div class="header-content">
          <h1>My Bookings</h1>
          <p class="subtitle">View and manage all your hotel reservations</p>
          <div class="header-stats" *ngIf="bookings.length">
            <span class="stat-pill"><strong>{{ bookings.length }}</strong> total</span>
            <span class="stat-pill"><strong>{{ upcomingBookings }}</strong> upcoming</span>
          </div>
        </div>
      </div>

      <div class="bookings-content">
        <div class="empty-state" *ngIf="!bookings.length">
          <mat-card class="empty-card">
            <span class="empty-icon">🏨</span>
            <h3>No bookings yet</h3>
            <p>Start exploring and book your perfect stay</p>
            <button mat-raised-button color="primary" routerLink="/hotels/search">
              Search Hotels
            </button>
          </mat-card>
        </div>

        <div class="bookings-list" *ngIf="bookings.length">
          <mat-card class="booking-card" *ngFor="let booking of bookings">
            <div class="booking-header">
              <div class="booking-info">
                <h3 class="booking-ref">{{ booking.bookingRef }}</h3>
                <app-status-badge [status]="booking.status"></app-status-badge>
              </div>
              <div class="booking-amount">
                {{ booking.totalAmount | currency: 'INR':'symbol':'1.0-0' }}
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">Hotel</span>
                  <span class="value">{{ booking.hotelName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Room Type</span>
                  <span class="value">{{ booking.roomTypeName }}</span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-item">
                  <span class="item-icon" aria-hidden="true">📅</span>
                  <div class="date-range">
                    <span class="label">Check-in</span>
                    <span class="value">{{ booking.checkIn | date: 'MMM dd, yyyy' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="item-icon" aria-hidden="true">🗓</span>
                  <div class="date-range">
                    <span class="label">Check-out</span>
                    <span class="value">{{ booking.checkOut | date: 'MMM dd, yyyy' }}</span>
                  </div>
                </div>
              </div>

              <div class="booking-meta">
                <span>{{ getStayNights(booking) }} night{{ getStayNights(booking) > 1 ? 's' : '' }}</span>
                <span>Guest: {{ booking.guestName }}</span>
              </div>
            </div>

            <div class="booking-actions">
              <button mat-stroked-button color="primary" (click)="viewDetails(booking.id)">
                <span class="button-icon" aria-hidden="true">↗</span>
                View Details
              </button>
              <button 
                mat-stroked-button 
                color="warn" 
                *ngIf="canCancel(booking)" 
                (click)="cancelBooking(booking.id)">
                <span class="button-icon" aria-hidden="true">×</span>
                Cancel Booking
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 16px;
        margin-bottom: 32px;
      }

      .header-content {
        max-width: 1120px;
        margin: 0 auto;

        h1 {
          margin: 0 0 8px;
          font-size: 2.5rem;
          font-weight: 700;
        }
      }

      .subtitle {
        margin: 0;
        font-size: 1.1rem;
        opacity: 0.95;
        font-weight: 300;
      }

      .header-stats {
        margin-top: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .stat-pill {
        background: rgba(255, 255, 255, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 0.88rem;
      }

      .stat-pill strong {
        font-size: 0.95rem;
      }

      .bookings-content {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 16px 40px;
      }

      .empty-state {
        .empty-card {
          text-align: center;
          padding: 60px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          background: white;

          .empty-icon {
            font-size: 5rem;
            display: block;
            margin-bottom: 20px;
          }

          h3 {
            color: #0f2742;
            margin: 0 0 8px;
            font-size: 1.6rem;
            font-weight: 600;
          }

          p {
            color: #64748b;
            margin: 0 0 24px;
            font-size: 1rem;
          }

          button {
            min-height: 44px;
            padding: 0 24px;
          }
        }
      }

      .bookings-list {
        display: grid;
        gap: 20px;
      }

      .booking-card {
        border-radius: 16px;
        padding: 24px;
        background:
          radial-gradient(circle at top right, rgba(102, 126, 234, 0.08), transparent 36%),
          #ffffff;
        box-shadow: 0 8px 24px rgba(11, 28, 45, 0.1);
        transition: all 0.3s ease;
        border: 1px solid #d8e4f1;
        border-left: 5px solid #667eea;

        &:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
      }

      .booking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .booking-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .booking-ref {
        margin: 0;
        color: #0f2742;
        font-size: 1.2rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .booking-amount {
        font-size: 1.4rem;
        font-weight: 700;
        color: #667eea;
      }

      .booking-details {
        margin-bottom: 20px;
      }

      .detail-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .item-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          margin-top: 1px;
          flex-shrink: 0;
          width: 20px;
          font-size: 1rem;
          line-height: 1;
        }

        .label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .value {
          display: block;
          font-size: 1rem;
          color: #0f2742;
          font-weight: 500;
          margin-top: 4px;
        }
      }

      .date-range {
        flex-grow: 1;
      }

      .booking-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .booking-meta span {
        background: #eef4fb;
        color: #355372;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 0.82rem;
        font-weight: 600;
      }

      .booking-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;

        button {
          min-height: 40px;
          font-weight: 500;

          .button-icon {
            margin-right: 8px;
            line-height: 1;
            font-weight: 700;
          }
        }
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 30px 16px;
          margin-bottom: 24px;
        }

        .header-content h1 {
          font-size: 2rem;
        }

        .header-stats {
          margin-top: 12px;
        }

        .booking-card {
          padding: 16px;
        }

        .booking-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .booking-amount {
          align-self: flex-end;
        }

        .detail-row {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .booking-actions {
          flex-direction: column;
          align-items: stretch;

          button {
            width: 100%;
          }
        }
      }
    `
  ]
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  bookings: Booking[] = [];

  get upcomingBookings(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bookings.filter((booking) => {
      if (booking.status === 'Cancelled') {
        return false;
      }

      const checkOut = new Date(booking.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      return !Number.isNaN(checkOut.getTime()) && checkOut >= today;
    }).length;
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe((bookings) => {
      this.bookings = bookings.sort((a, b) => {
        const dateA = new Date(a.checkIn).getTime();
        const dateB = new Date(b.checkIn).getTime();
        return dateB - dateA; // Decreasing order (most recent first)
      });
    });
  }

  canCancel(booking: Booking): boolean {
    const cancellableStatus = booking.status === 'Pending' || booking.status === 'Confirmed';

    if (!cancellableStatus) {
      return false;
    }

    const checkIn = new Date(booking.checkIn);

    if (Number.isNaN(checkIn.getTime())) {
      return false;
    }

    checkIn.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return checkIn >= today;
  }

  getStayNights(booking: Booking): number {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return 1;
    }

    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkOut <= checkIn) {
      return 1;
    }

    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/dashboard/bookings', id]);
  }

  cancelBooking(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel booking',
        message: 'Are you sure you want to cancel this booking?',
        confirmText: 'Yes, cancel'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    });
  }
}
