import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../models/hotel.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <section class="container">
      <header class="hero">
        <div>
          <p class="eyebrow">Hotel Manager Workspace</p>
          <h1>Manage your properties</h1>
          <p class="subtitle">Create hotel listings, add room inventory, and monitor approval status.</p>
        </div>
        <div class="hero-actions">
          <button mat-flat-button color="primary" routerLink="/manager/hotels/new">Add Hotel</button>
          <button mat-stroked-button routerLink="/manager/hotels">My Hotels</button>
        </div>
      </header>

      <div class="stats-grid">
        <mat-card>
          <h3>Total Hotels</h3>
          <p>{{ hotels.length }}</p>
        </mat-card>
        <mat-card>
          <h3>Pending Review</h3>
          <p>{{ pendingHotels }}</p>
        </mat-card>
        <mat-card>
          <h3>Approved</h3>
          <p>{{ approvedHotels }}</p>
        </mat-card>
      </div>

      <mat-card class="recent">
        <h2>My Properties</h2>
        <p *ngIf="!hotels.length">You have not added any hotels yet.</p>
        <div class="hotel-row" *ngFor="let hotel of hotels.slice(0, 4)">
          <div>
            <strong>{{ hotel.name }}</strong>
            <p>{{ hotel.city }}, {{ hotel.country }} - {{ hotel.status }}</p>
          </div>
          <div class="actions">
            <button mat-button [routerLink]="['/manager/hotels', hotel.id, 'edit']">Edit</button>
            <button mat-button color="primary" [routerLink]="['/manager/hotels', hotel.id, 'rooms']">Rooms</button>
          </div>
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
        background: linear-gradient(130deg, #0b3d2f, #1f7a62);
      }
      .eyebrow { margin: 0 0 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; color: #cff8eb; }
      h1 { margin: 0; font-size: 2rem; }
      .subtitle { margin: 8px 0 0; color: #dbf7ef; }
      .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
      .stats-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .stats-grid mat-card p { margin: 10px 0 0; font-size: 2rem; font-weight: 700; color: #146c55; }
      .recent { margin-top: 14px; }
      .hotel-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding: 12px 0; }
      .hotel-row p { margin: 4px 0 0; color: #64748b; }
      .actions { display: flex; gap: 8px; }
      @media (max-width: 768px) {
        .hero { align-items: start; flex-direction: column; }
        .hotel-row { align-items: start; flex-direction: column; gap: 8px; }
      }
    `
  ]
})
export class ManagerDashboardComponent implements OnInit {
  private readonly hotelService = inject(HotelService);

  hotels: Hotel[] = [];

  get pendingHotels(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase() === 'pendingreview').length;
  }

  get approvedHotels(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase() === 'approved').length;
  }

  ngOnInit(): void {
    this.hotelService.getMyHotels().subscribe((hotels) => {
      this.hotels = hotels;
    });
  }
}
