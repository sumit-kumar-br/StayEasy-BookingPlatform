import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-traveler-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <section class="container">
      <header class="hero">
        <div>
          <p class="eyebrow">Traveler Workspace</p>
          <h1>Welcome back</h1>
          <p class="subtitle">Search stays, track bookings, and manage upcoming trips in one place.</p>
        </div>
        <div class="hero-actions">
          <button mat-flat-button color="primary" routerLink="/">Search Hotels</button>
          <button mat-stroked-button routerLink="/dashboard/bookings">My Bookings</button>
        </div>
      </header>

      <div class="stats-grid">
        <mat-card>
          <h3>Total Bookings</h3>
          <p>{{ bookings.length }}</p>
        </mat-card>
        <mat-card>
          <h3>Upcoming Trips</h3>
          <p>{{ upcomingTrips }}</p>
        </mat-card>
        <mat-card>
          <h3>Pending Payments</h3>
          <p>{{ pendingBookings }}</p>
        </mat-card>
      </div>

      <mat-card class="recent">
        <h2>Recent Bookings</h2>
        <p *ngIf="!bookings.length">No bookings yet. Start by searching hotels.</p>
        <div class="booking-row" *ngFor="let booking of bookings.slice(0, 3)">
          <div>
            <strong>{{ booking.hotelName }}</strong>
            <p>{{ booking.checkIn | date }} - {{ booking.checkOut | date }}</p>
          </div>
          <button mat-button color="primary" [routerLink]="['/dashboard/bookings', booking.id]">View</button>
        </div>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .container { max-width: 1120px; margin: 22px auto; padding: 0 16px; }
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 18px;
        margin-bottom: 16px;
        padding: 20px;
        border-radius: 16px;
        color: #f6fbff;
        background: linear-gradient(130deg, #0c2f55, #145b92);
      }
      .eyebrow { margin: 0 0 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; color: #cde5ff; }
      h1 { margin: 0; font-size: 2rem; }
      .subtitle { margin: 8px 0 0; color: #dbeaf9; }
      .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
      .stats-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .stats-grid mat-card p { margin: 10px 0 0; font-size: 2rem; font-weight: 700; color: #0f4c81; }
      .recent { margin-top: 14px; }
      .booking-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding: 12px 0; }
      .booking-row p { margin: 4px 0 0; color: #64748b; }
      @media (max-width: 768px) {
        .hero { align-items: start; flex-direction: column; }
        .booking-row { align-items: start; flex-direction: column; gap: 8px; }
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
