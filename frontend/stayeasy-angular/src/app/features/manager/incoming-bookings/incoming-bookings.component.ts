import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-incoming-bookings',
  standalone: true,
  imports: [CommonModule, MatCardModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <h1>Incoming Bookings</h1>
      <mat-card *ngIf="!bookings.length">No incoming bookings.</mat-card>
      <mat-card *ngFor="let booking of bookings" class="item">
        <h3>{{ booking.bookingRef }}</h3>
        <p>{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
        <p>{{ booking.checkIn }} to {{ booking.checkOut }}</p>
        <app-status-badge [status]="booking.status"></app-status-badge>
      </mat-card>
    </section>
  `,
  styles: [`.container{max-width:900px;margin:20px auto;padding:0 16px}.item{margin-top:12px}`]
})
export class IncomingBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  bookings: Booking[] = [];

  ngOnInit(): void {
    this.bookingService.getIncomingBookings().subscribe((bookings) => {
      this.bookings = bookings;
    });
  }
}
