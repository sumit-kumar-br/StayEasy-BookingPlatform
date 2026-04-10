import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BookingService } from '../../../core/services/booking.service';
import { HotelService } from '../../../core/services/hotel.service';
import { Booking } from '../../../models/booking.model';

interface RevenueByHotel {
  hotelName: string;
  confirmedBookings: number;
  grossRevenue: number;
}

@Component({
  selector: 'app-revenue-collection',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="container">
      <header class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Revenue Operations</p>
          <h1>Revenue Collection</h1>
          <p>Track confirmed booking collections and monitor pending revenue in one view.</p>
        </div>
        <button mat-stroked-button (click)="refresh()">Refresh</button>
      </header>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <p class="label">Collected Revenue</p>
          <p class="stat amount">{{ collectedRevenue | currency: 'INR':'symbol':'1.0-0' }}</p>
          <p class="hint">From confirmed bookings</p>
        </mat-card>

        <mat-card class="stat-card">
          <p class="label">Pending Revenue</p>
          <p class="stat amount">{{ pendingRevenue | currency: 'INR':'symbol':'1.0-0' }}</p>
          <p class="hint">Awaiting confirmation</p>
        </mat-card>

        <mat-card class="stat-card">
          <p class="label">Confirmed Bookings</p>
          <p class="stat">{{ confirmedBookings.length }}</p>
          <p class="hint">Revenue recognized</p>
        </mat-card>

        <mat-card class="stat-card">
          <p class="label">Avg Collection</p>
          <p class="stat amount">{{ averageCollection | currency: 'INR':'symbol':'1.0-0' }}</p>
          <p class="hint">Per confirmed booking</p>
        </mat-card>
      </div>

      <mat-card class="section-card">
        <div class="section-header">
          <h2>Revenue by Property</h2>
          <button mat-button routerLink="/manager/bookings">Open Incoming Bookings</button>
        </div>

        <div class="empty" *ngIf="!revenueByHotel.length">
          No confirmed bookings yet. Revenue will appear after confirmations.
        </div>

        <div class="table" *ngIf="revenueByHotel.length">
          <div class="row head">
            <span>Hotel</span>
            <span>Confirmed</span>
            <span>Collected</span>
          </div>
          <div class="row" *ngFor="let item of revenueByHotel">
            <span>{{ item.hotelName }}</span>
            <span>{{ item.confirmedBookings }}</span>
            <span>{{ item.grossRevenue | currency: 'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="section-card">
        <div class="section-header">
          <h2>Recent Collections</h2>
        </div>

        <div class="empty" *ngIf="!confirmedBookings.length">
          No recent collections available.
        </div>

        <div class="table" *ngIf="confirmedBookings.length">
          <div class="row head">
            <span>Booking Ref</span>
            <span>Hotel</span>
            <span>Check-In</span>
            <span>Amount</span>
          </div>
          <div class="row" *ngFor="let booking of recentCollections">
            <span>{{ booking.bookingRef }}</span>
            <span>{{ booking.hotelName }}</span>
            <span>{{ booking.checkIn | date: 'mediumDate' }}</span>
            <span>{{ booking.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 16px 32px;
      }

      .hero {
        margin: 28px 0 24px;
        padding: 28px;
        border-radius: 14px;
        border: 1px solid #dbeafe;
        background: linear-gradient(140deg, #eff6ff 0%, #dbeafe 45%, #f0fdf4 100%);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .hero-copy h1 {
        margin: 4px 0 8px;
        color: #0f2742;
        font-size: 2rem;
      }

      .hero-copy p {
        margin: 0;
        color: #334155;
      }

      .eyebrow {
        margin: 0;
        color: #0284c7;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .stat-card {
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 10px rgba(15, 39, 66, 0.05);
      }

      .label {
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .stat {
        margin: 0;
        color: #0f2742;
        font-size: 1.8rem;
        font-weight: 700;
      }

      .stat.amount {
        color: #047857;
      }

      .hint {
        margin: 8px 0 0;
        color: #64748b;
        font-size: 0.85rem;
      }

      .section-card {
        margin-bottom: 16px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 20px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
      }

      .section-header h2 {
        margin: 0;
        color: #0f2742;
        font-size: 1.1rem;
      }

      .table {
        display: grid;
        gap: 8px;
      }

      .row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
        background: #ffffff;
      }

      .row.head {
        background: #f8fafc;
        font-weight: 700;
        color: #475569;
      }

      .section-card:last-child .row {
        grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
      }

      .empty {
        padding: 14px;
        border-radius: 8px;
        background: #f8fafc;
        color: #64748b;
      }

      @media (max-width: 900px) {
        .hero {
          flex-direction: column;
        }

        .row,
        .section-card:last-child .row {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class RevenueCollectionComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly hotelService = inject(HotelService);

  bookings: Booking[] = [];

  get confirmedBookings(): Booking[] {
    return this.bookings.filter((b) => String(b.status).toLowerCase() === 'confirmed');
  }

  get pendingBookings(): Booking[] {
    return this.bookings.filter((b) => String(b.status).toLowerCase() === 'pending');
  }

  get collectedRevenue(): number {
    return this.confirmedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  }

  get pendingRevenue(): number {
    return this.pendingBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  }

  get averageCollection(): number {
    if (!this.confirmedBookings.length) {
      return 0;
    }

    return this.collectedRevenue / this.confirmedBookings.length;
  }

  get recentCollections(): Booking[] {
    return [...this.confirmedBookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }

  get revenueByHotel(): RevenueByHotel[] {
    const map = new Map<string, RevenueByHotel>();

    for (const booking of this.confirmedBookings) {
      const key = booking.hotelName;
      const existing = map.get(key);

      if (existing) {
        existing.confirmedBookings += 1;
        existing.grossRevenue += booking.totalAmount;
      } else {
        map.set(key, {
          hotelName: booking.hotelName,
          confirmedBookings: 1,
          grossRevenue: booking.totalAmount
        });
      }
    }

    return [...map.values()].sort((a, b) => b.grossRevenue - a.grossRevenue);
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.hotelService.getMyHotels().subscribe((hotels) => {
      const managerHotelIds = new Set(hotels.map((hotel) => hotel.id));

      this.bookingService.getIncomingBookings().subscribe((bookings) => {
        this.bookings = bookings.filter((booking) => managerHotelIds.has(booking.hotelId));
      });
    });
  }
}
