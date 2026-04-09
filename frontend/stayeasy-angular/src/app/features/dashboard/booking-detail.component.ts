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
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  template: `
    <section class="detail-page" *ngIf="booking">
      <mat-card class="card" appearance="outlined">
        <header class="card-header">
          <div>
            <p class="eyebrow">Booking Reference</p>
            <h1>{{ booking.bookingRef }}</h1>
            <p class="subtitle">{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
          </div>
          <app-status-badge [status]="booking.status"></app-status-badge>
        </header>

        <section class="detail-grid">
          <article class="detail-block">
            <h2>Stay Dates</h2>
            <div class="kv-list">
              <div>
                <span>Check-in</span>
                <strong>{{ booking.checkIn | date: 'EEE, MMM d, y' }}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{{ booking.checkOut | date: 'EEE, MMM d, y' }}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{{ getStayNights(booking) }} night{{ getStayNights(booking) > 1 ? 's' : '' }}</strong>
              </div>
            </div>
          </article>

          <article class="detail-block">
            <h2>Guest Information</h2>
            <div class="kv-list">
              <div>
                <span>Name</span>
                <strong>{{ booking.guestName }}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{{ booking.guestEmail }}</strong>
              </div>
            </div>
          </article>
        </section>

        <article class="total-section">
          <span>Total Amount</span>
          <strong>{{ booking.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</strong>
        </article>

        <article class="special-requests" *ngIf="booking.specialRequests">
          <h2>Special Requests</h2>
          <p>{{ booking.specialRequests }}</p>
        </article>

        <div class="actions">
          <button mat-stroked-button class="action-btn" routerLink="/dashboard/bookings">Back to Bookings</button>
          <button mat-stroked-button color="warn" class="action-btn" *ngIf="canCancel(booking)" (click)="cancelBooking()">Cancel Booking</button>
      </div>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .detail-page {
        min-height: calc(100vh - 120px);
        padding: 28px 16px 40px;
        background: linear-gradient(180deg, #eef3f9 0%, #e6edf6 100%);
      }

      .card {
        max-width: 1020px;
        margin: 0 auto;
        padding: 30px;
        border-radius: 16px;
        border-color: #d6e0ec;
        box-shadow: 0 12px 30px rgba(15, 34, 55, 0.08);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        flex-wrap: wrap;
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e5ebf2;
      }

      .eyebrow {
        margin: 0 0 6px;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7f95;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        color: #0f2742;
        font-size: clamp(1.8rem, 3vw, 2.5rem);
      }

      .subtitle {
        margin: 10px 0 0;
        color: #334e68;
        font-size: 1.05rem;
      }

      .detail-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }

      .detail-block {
        background: #f8fbff;
        border: 1px solid #dde7f2;
        border-radius: 14px;
        padding: 18px;
      }

      .detail-block h2 {
        margin: 0 0 12px;
        color: #0f355a;
        font-size: 1rem;
      }

      .kv-list {
        display: grid;
        gap: 12px;
      }

      .kv-list span {
        display: block;
        color: #60788f;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
        margin-bottom: 3px;
      }

      .kv-list strong {
        color: #15324f;
        font-size: 1rem;
        line-height: 1.35;
        word-break: break-word;
      }

      .total-section {
        margin-top: 16px;
        border-radius: 14px;
        background: linear-gradient(135deg, #4f74d9 0%, #7b4dc4 100%);
        color: #fff;
        padding: 18px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .total-section span {
        font-size: 0.95rem;
        font-weight: 600;
        opacity: 0.95;
      }

      .total-section strong {
        font-size: clamp(1.8rem, 3vw, 2.5rem);
        line-height: 1;
      }

      .special-requests {
        margin-top: 16px;
        border-radius: 12px;
        background: #fdf7ea;
        border: 1px solid #f4dfb3;
        padding: 14px 16px;
      }

      .special-requests h2 {
        margin: 0 0 6px;
        color: #7a4a0a;
        font-size: 0.95rem;
      }

      .special-requests p {
        margin: 0;
        color: #5b3b11;
        line-height: 1.5;
      }

      .actions {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .action-btn {
        min-height: 42px;
        border-radius: 10px;
        padding: 0 16px;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .detail-page {
          padding: 18px 12px 30px;
        }

        .card {
          padding: 18px;
        }

        .total-section {
          flex-direction: column;
          align-items: flex-start;
        }

        .action-btn {
          width: 100%;
        }
      }
    `
  ]
})
export class BookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly dialog = inject(MatDialog);

  booking: Booking | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.bookingService.getBookingById(id).subscribe((booking) => {
      this.booking = booking;
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

  cancelBooking(): void {
    if (!this.booking) {
      return;
    }

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

      this.bookingService.cancelBooking(this.booking!.id).subscribe(() => {
        this.router.navigate(['/dashboard/bookings']);
      });
    });
  }
}
