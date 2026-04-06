import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <h1>My Bookings</h1>

      <mat-card *ngIf="!bookings.length">No bookings yet.</mat-card>

      <div class="list">
        <mat-card *ngFor="let booking of bookings">
          <div class="row">
            <h3>{{ booking.bookingRef }}</h3>
            <app-status-badge [status]="booking.status"></app-status-badge>
          </div>
          <p>{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
          <p>{{ booking.checkIn }} to {{ booking.checkOut }}</p>
          <p>{{ booking.totalAmount | currency }}</p>
          <div class="actions">
            <button mat-button color="primary" (click)="viewDetails(booking.id)">View Details</button>
            <button mat-button color="warn" *ngIf="canCancel(booking)" (click)="cancelBooking(booking.id)">Cancel</button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 940px;
        margin: 20px auto;
        padding: 0 16px;
      }

      .list {
        display: grid;
        gap: 12px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    `
  ]
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  bookings: Booking[] = [];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe((bookings) => {
      this.bookings = bookings;
    });
  }

  canCancel(booking: Booking): boolean {
    const statusAllowed = booking.status === 'Pending' || booking.status === 'Confirmed';
    const checkInDate = new Date(booking.checkIn).getTime();
    return statusAllowed && checkInDate > Date.now();
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
