import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../models/hotel.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-hotels',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <div class="header">
        <div class="header-content">
          <h2 class="eyebrow">🏨 Hotel Inventory</h2>
          <h1>My Hotels</h1>
          <p>Manage, edit, and configure all your hotel properties and room inventory.</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/manager/hotels/new">
          <span class="icon">➕</span> Add New Hotel
        </button>
      </div>

      <div class="empty-state" *ngIf="!hotels.length">
        <p class="emoji">🏢</p>
        <p class="title">No hotels yet</p>
        <p class="subtitle">Create your first hotel listing to start managing properties</p>
        <button mat-raised-button color="primary" routerLink="/manager/hotels/new" class="cta-btn">
          Add Your First Hotel
        </button>
      </div>

      <div class="grid" *ngIf="hotels.length">
        <mat-card class="hotel-card" *ngFor="let hotel of hotels">
          <div class="card-header">
            <h3>{{ hotel.name }}</h3>
            <app-status-badge [status]="hotel.status"></app-status-badge>
          </div>
          <p class="location">📍 {{ hotel.city }}, {{ hotel.country }}</p>
          <p class="description" *ngIf="hotel.description">{{ hotel.description | slice:0:100 }}{{ hotel.description.length > 100 ? '...' : '' }}</p>
          <div class="actions">
            <button mat-stroked-button (click)="edit(hotel.id)">
              <span class="icon">✏️</span> Edit
            </button>
            <button mat-raised-button color="primary" (click)="rooms(hotel.id)">
              <span class="icon">🛏️</span> Manage Rooms
            </button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 1020px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 32px;
        margin: 28px 0 40px;
      }

      .header-content {
        flex: 1;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #26a69a;
        letter-spacing: 0.5px;
      }

      .header h1 {
        margin: 0 0 12px;
        font-size: 2.2rem;
        font-weight: 700;
        color: #0f2742;
      }

      .header p {
        margin: 0;
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
      }

      .header button {
        white-space: nowrap;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }

      .header button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .icon {
        font-size: 1.2rem;
      }

      .empty-state {
        text-align: center;
        padding: 80px 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border: 2px dashed #cbd5e1;
        margin: 40px 0;
      }

      .empty-state .emoji {
        font-size: 4rem;
        margin: 0 0 16px;
      }

      .empty-state .title {
        margin: 0 0 8px;
        font-size: 1.3rem;
        font-weight: 700;
        color: #0f2742;
      }

      .empty-state .subtitle {
        margin: 0 0 24px;
        color: #64748b;
        font-size: 0.95rem;
      }

      .empty-state .cta-btn {
        padding: 12px 32px;
        border-radius: 8px;
        font-weight: 600;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 40px;
      }

      .hotel-card {
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }

      .hotel-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #26a69a 0%, #26c6da 100%);
      }

      .hotel-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(38, 166, 154, 0.12);
        border-color: #26a69a;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .hotel-card h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f2742;
        flex: 1;
      }

      .location {
        margin: 0 0 8px;
        color: #64748b;
        font-size: 0.9rem;
      }

      .description {
        margin: 0 0 20px;
        color: #475569;
        font-size: 0.95rem;
        line-height: 1.5;
        flex-grow: 1;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .actions button {
        border-radius: 6px;
        font-weight: 600;
        padding: 8px 16px;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .header {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
          margin: 20px 0 28px;
        }

        .header h1 {
          font-size: 1.8rem;
        }

        .header button {
          width: 100%;
          justify-content: center;
        }

        .grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .hotel-card {
          padding: 16px;
        }
      }
    `
  ]
})
export class MyHotelsComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);

  hotels: Hotel[] = [];

  ngOnInit(): void {
    this.hotelService.getMyHotels().subscribe((hotels) => {
      this.hotels = hotels;
    });
  }

  edit(id: string): void {
    this.router.navigate(['/manager/hotels', id, 'edit']);
  }

  rooms(id: string): void {
    this.router.navigate(['/manager/hotels', id, 'rooms']);
  }
}
