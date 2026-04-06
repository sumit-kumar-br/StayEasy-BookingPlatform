import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  template: `
    <mat-card class="card" *ngIf="booking">
      <h1>{{ booking.bookingRef }}</h1>
      <app-status-badge [status]="booking.status"></app-status-badge>
      <p>{{ booking.hotelName }} - {{ booking.roomTypeName }}</p>
      <p>{{ booking.checkIn }} to {{ booking.checkOut }}</p>
      <p>Guest: {{ booking.guestName }} ({{ booking.guestEmail }})</p>
      <p>Total: {{ booking.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</p>
      <p *ngIf="booking.specialRequests">Special requests: {{ booking.specialRequests }}</p>
      <div class="actions" *ngIf="canCancel(booking)">
        <button mat-stroked-button color="warn" (click)="cancelBooking()">Cancel Booking</button>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 760px;
        margin: 24px auto;
        padding: 24px;
      }

      .actions {
        margin-top: 16px;
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
    return booking.status === 'Pending' || booking.status === 'Confirmed';
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
