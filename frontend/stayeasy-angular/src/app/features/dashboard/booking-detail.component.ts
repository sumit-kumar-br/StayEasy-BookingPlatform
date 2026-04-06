import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, StatusBadgeComponent],
  template: `
    <mat-card class="card" *ngIf="booking">
      <h1>{{ booking.bookingRef }}</h1>
      <app-status-badge [status]="booking.status"></app-status-badge>
      <p>{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
      <p>{{ booking.checkIn }} to {{ booking.checkOut }}</p>
      <p>Guest: {{ booking.guestName }} ({{ booking.guestEmail }})</p>
      <p>Total: {{ booking.totalAmount | currency }}</p>
      <p *ngIf="booking.specialRequests">Special requests: {{ booking.specialRequests }}</p>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 760px;
        margin: 24px auto;
        padding: 24px;
      }
    `
  ]
})
export class BookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);

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
}
