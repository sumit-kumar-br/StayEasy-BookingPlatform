import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  template: `
    <section class="confirmation-container" *ngIf="booking">
      <div class="success-section">
        <span class="success-icon" aria-hidden="true">✔</span>
        <h1 class="success-title">Booking Confirmed!</h1>
        <p class="success-message">Your reservation has been successfully booked</p>
      </div>

      <div class="confirmation-content">
        <mat-card class="confirmation-card">
          <div class="booking-reference">
            <label>Booking Reference</label>
            <h2>{{ booking.bookingRef }}</h2>
          </div>

          <div class="confirmation-details">
            <div class="detail-section">
              <h3>Hotel & Room Details</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Hotel</span>
                  <span class="value">{{ booking.hotelName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Room Type</span>
                  <span class="value">{{ booking.roomTypeName }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Stay Dates</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="icon-glyph" aria-hidden="true">📅</span>
                  <div>
                    <span class="label">Check-in</span>
                    <span class="value">{{ booking.checkIn | date: 'MMMM dd, yyyy' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="icon-glyph" aria-hidden="true">🗓</span>
                  <div>
                    <span class="label">Check-out</span>
                    <span class="value">{{ booking.checkOut | date: 'MMMM dd, yyyy' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Guest Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Guest Name</span>
                  <span class="value">{{ booking.guestName }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section total-section">
              <div class="total-grid">
                <span class="label">Total Amount</span>
                <span class="total-amount">{{ booking.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <div class="status-section">
              <span class="label">Status</span>
              <app-status-badge [status]="booking.status"></app-status-badge>
            </div>
          </div>
        </mat-card>

        <div class="actions">
          <button 
            mat-stroked-button 
            color="warn" 
            *ngIf="canCancel(booking)" 
            (click)="cancelBooking()"
            class="action-btn">
            <span class="button-icon" aria-hidden="true">×</span>
            Cancel Booking
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            routerLink="/dashboard/bookings"
            class="action-btn">
            <span class="button-icon" aria-hidden="true">☰</span>
            View My Bookings
          </button>
        </div>

        <div class="info-box">
          <span class="info-icon" aria-hidden="true">i</span>
          <div>
            <strong>What's Next?</strong>
            <p>You'll receive a confirmation email shortly. You can view and manage all your bookings from your dashboard.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .confirmation-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 16px;
      }

      .success-section {
        text-align: center;
        color: white;
        margin-bottom: 40px;
      }

      .success-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #10b981;
        line-height: 1;
        animation: scaleIn 0.6s ease;
      }

      @keyframes scaleIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .success-title {
        margin: 20px 0 8px;
        font-size: 2.5rem;
        font-weight: 700;
      }

      .success-message {
        margin: 0;
        font-size: 1.1rem;
        opacity: 0.95;
        font-weight: 300;
      }

      .confirmation-content {
        max-width: 700px;
        margin: 0 auto;
      }

      .confirmation-card {
        background: white;
        border-radius: 12px;
        padding: 32px;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      }

      .booking-reference {
        text-align: center;
        padding-bottom: 24px;
        margin-bottom: 24px;
        border-bottom: 2px solid #f0f0f0;

        label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        h2 {
          margin: 0;
          font-size: 2rem;
          color: #667eea;
          font-weight: 700;
          word-break: break-all;
        }
      }

      .confirmation-details {
        display: grid;
        gap: 24px;
      }

      .detail-section {
        h3 {
          margin: 0 0 16px;
          font-size: 0.95rem;
          color: #0f2742;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 12px;
        }
      }

      .detail-grid {
        display: grid;
        gap: 16px;
      }

      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .icon-glyph {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          flex-shrink: 0;
          margin-top: 1px;
          width: 22px;
          font-size: 1.1rem;
          line-height: 1;
        }

        .label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .value {
          display: block;
          font-size: 1rem;
          color: #0f2742;
          font-weight: 500;
        }
      }

      .total-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;

        .total-grid {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .label {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
          }

          .total-amount {
            font-size: 2rem;
            font-weight: 700;
            color: white;
          }
        }
      }

      .status-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;

        .label {
          font-weight: 600;
          color: #0f2742;
        }
      }

      .actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-bottom: 24px;

        .action-btn {
          min-height: 44px;
          padding: 0 24px;
          font-weight: 500;

          .button-icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 1rem;
            line-height: 1;
            font-weight: 700;
          }
        }
      }

      .info-box {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 20px;
        display: flex;
        gap: 16px;
        color: white;

        .info-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
          font-weight: 700;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        strong {
          display: block;
          margin-bottom: 8px;
          font-size: 1rem;
        }

        p {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.95;
        }
      }

      @media (max-width: 768px) {
        .confirmation-container {
          padding: 24px 16px;
        }

        .success-icon {
          font-size: 60px;
          width: 60px;
          height: 60px;
        }

        .success-title {
          font-size: 1.8rem;
        }

        .confirmation-card {
          padding: 20px;
        }

        .booking-reference h2 {
          font-size: 1.5rem;
        }

        .actions {
          flex-direction: column;

          .action-btn {
            width: 100%;
          }
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }

        .info-box {
          flex-direction: column;

          .info-icon {
            margin-bottom: 8px;
          }
        }
      }
    `
  ]
})
export class BookingConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  booking: Booking | null = null;

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (!bookingId) {
      return;
    }

    this.bookingService.getBookingById(bookingId).subscribe((booking) => {
      this.booking = booking;
    });
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  cancelBooking(): void {
    if (!this.booking) {
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel booking',
        message: 'Do you want to cancel this booking?',
        confirmText: 'Yes, cancel'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.bookingService.cancelBooking(this.booking!.id).subscribe(() => {
        this.router.navigate(['/dashboard/bookings']);
      });
    });
  }
}
