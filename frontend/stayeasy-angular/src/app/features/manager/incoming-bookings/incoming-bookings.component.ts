import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-incoming-bookings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <div class="header">
        <div class="header-content">
          <h2 class="eyebrow">📝 Booking Management</h2>
          <h1>Incoming Bookings</h1>
          <p>Monitor and manage all incoming guest reservations across your properties.</p>
        </div>
      </div>

      <div class="empty-state" *ngIf="!bookings.length">
        <p class="emoji">📭</p>
        <p class="title">No incoming bookings</p>
        <p class="subtitle">Your bookings will appear here when guests make reservations</p>
      </div>

      <div class="bookings-list" *ngIf="bookings.length">
        <mat-card *ngFor="let booking of bookings" class="booking-card">
          <div class="card-header">
            <div class="booking-ref">
              <h3>{{ booking.bookingRef }}</h3>
              <app-status-badge [status]="booking.status"></app-status-badge>
            </div>
            <div class="action-button" *ngIf="canCancel(booking)">
              <button mat-stroked-button color="warn" (click)="cancelAsManager(booking.id)">
                ✕ Cancel
              </button>
            </div>
          </div>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">🏨 Hotel</span>
              <span class="value">{{ booking.hotelName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">🛏️ Room</span>
              <span class="value">{{ booking.roomTypeName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">📅 Check-In</span>
              <span class="value">{{ booking.checkIn | date: 'mediumDate' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">📅 Check-Out</span>
              <span class="value">{{ booking.checkOut | date: 'mediumDate' }}</span>
            </div>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 980px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .header {
        margin: 28px 0 40px;
      }

      .header-content {
        max-width: 700px;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #26a69a;
        letter-spacing: 0.5px;
      }

      .header h1 {
        margin: 0 0 12px;
        font-size: 2.2rem;
        font-weight: 700;
        color: #0f2742;
      }

      .header p {
        margin: 0;
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
      }

      .empty-state {
        text-align: center;
        padding: 80px 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border: 2px dashed #cbd5e1;
        margin: 40px 0;
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

      .bookings-list {
        display: grid;
        gap: 16px;
        margin-bottom: 40px;
      }

      .booking-card {
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
      }

      .booking-card:hover {
        box-shadow: 0 8px 20px rgba(38, 166, 154, 0.1);
        border-color: #26a69a;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }

      .booking-ref {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .booking-ref h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f2742;
      }

      .action-button {
        display: flex;
        align-items: center;
      }

      .action-button button {
        border-radius: 6px;
        font-weight: 600;
        padding: 8px 16px;
        white-space: nowrap;
      }

      .booking-details {
        display: grid;
        gap: 12px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f4fa;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #64748b;
        font-size: 0.9rem;
      }

      .value {
        color: #0f2742;
        font-weight: 600;
        font-size: 0.95rem;
      }

      @media (max-width: 768px) {
        .header {
          margin: 20px 0 28px;
        }

        .header h1 {
          font-size: 1.8rem;
        }

        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
        }

        .action-button {
          width: 100%;
        }

        .action-button button {
          width: 100%;
          justify-content: center;
        }

        .detail-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `
  ]
})
export class IncomingBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  bookings: Booking[] = [];

  ngOnInit(): void {
    this.bookingService.getIncomingBookings().subscribe((bookings) => {
      this.bookings = bookings;
    });
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  cancelAsManager(id: string): void {
    this.bookingService.cancelBookingAsManager(id).subscribe(() => {
      this.bookingService.getIncomingBookings().subscribe((bookings) => {
        this.bookings = bookings;
      });
    });
  }
}
