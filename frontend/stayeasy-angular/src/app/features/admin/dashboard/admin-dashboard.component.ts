import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../models/hotel.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <section class="container">
      <header class="hero">
        <div>
          <p class="eyebrow">Admin Workspace</p>
          <h1>Platform Control Center</h1>
          <p>Approve hotel submissions, monitor inventory growth, and oversee user activity.</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/admin/hotels">Review Hotels</button>
          <button mat-stroked-button routerLink="/admin/users">Manage Users</button>
        </div>
      </header>

      <div class="grid">
        <mat-card>
          <h3>Total Hotels</h3>
          <p>{{ hotels.length }}</p>
        </mat-card>
        <mat-card>
          <h3>Pending Approvals</h3>
          <p>{{ pendingCount }}</p>
        </mat-card>
        <mat-card>
          <h3>Approved Hotels</h3>
          <p>{{ approvedCount }}</p>
        </mat-card>
      </div>
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
        background: linear-gradient(135deg, #2b2f3a, #455164);
      }
      .eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: #d5deeb; }
      h1 { margin: 0 0 8px; }
      .hero p { margin: 0; color: #e3edf9; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; }
      .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }
      .grid mat-card p { font-size: 2rem; font-weight: 700; color: #2b425f; margin: 10px 0 0; }
      @media (max-width: 768px) {
        .hero { flex-direction: column; align-items: start; }
      }
    `
  ]
})
export class AdminDashboardComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  hotels: Hotel[] = [];

  get pendingCount(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase().includes('pending')).length;
  }

  get approvedCount(): number {
    return this.hotels.filter((h) => String(h.status).toLowerCase() === 'approved').length;
  }

  ngOnInit(): void {
    this.hotelService.getAllHotels().subscribe((hotels) => {
      this.hotels = hotels;
    });
  }
}
