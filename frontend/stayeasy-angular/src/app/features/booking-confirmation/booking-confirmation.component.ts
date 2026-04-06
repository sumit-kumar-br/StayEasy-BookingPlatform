import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  template: `
    <mat-card class="card" *ngIf="booking">
      <mat-icon class="success">check_circle</mat-icon>
      <h2>Booking Confirmed</h2>
      <h1>{{ booking.bookingRef }}</h1>
      <p>{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
      <p>{{ booking.checkIn }} to {{ booking.checkOut }}</p>
      <p>Guest: {{ booking.guestName }}</p>
      <p>Total: {{ booking.totalAmount | currency }}</p>
      <app-status-badge [status]="booking.status"></app-status-badge>
      <div>
        <button mat-flat-button color="primary" routerLink="/dashboard/bookings">View My Bookings</button>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 680px;
        margin: 24px auto;
        text-align: center;
        padding: 24px;
      }

      .success {
        color: #16a34a;
        font-size: 54px;
        width: 54px;
        height: 54px;
      }

      h1 {
        margin: 6px 0 14px;
      }
    `
  ]
})
export class BookingConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);

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
}
