import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../models/hotel.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <div class="hero">
        <div class="hero-content">
          <h2 class="eyebrow">🏨 Property Management</h2>
          <h1>Manage Your Properties</h1>
          <p class="subtitle">Create quality listings, manage inventory, and monitor approval status in real-time.</p>
          <div class="cta">
            <button mat-raised-button color="primary" routerLink="/manager/hotels/new">
              <span class="icon">➕</span> Add NEW Hotel
            </button>
            <button mat-raised-button routerLink="/manager/hotels">
              <span class="icon">🏨</span> View All Hotels
            </button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-icon">📊</div>
          <p class="label">Total Hotels</p>
          <p class="stat">{{ hotels.length }}</p>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon">⏳</div>
          <p class="label">Pending Review</p>
          <p class="stat">{{ pendingHotels }}</p>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon">✅</div>
          <p class="label">Approved</p>
          <p class="stat">{{ approvedHotels }}</p>
        </mat-card>
      </div>

      <mat-card class="recent-section">
        <div class="section-header">
          <h3>📍 My Properties</h3>
        </div>
        <div *ngIf="!hotels.length" class="empty-state">
          <p class="emoji">🏢</p>
          <p class="title">No hotels yet</p>
          <p class="subtitle">Create your first hotel listing to get started</p>
        </div>
        <div class="hotel-list" *ngIf="hotels.length">
          <div class="hotel-item" *ngFor="let hotel of hotels.slice(0, 4)">
            <div class="hotel-info">
              <h4>{{ hotel.name }}</h4>
              <p class="location">📍 {{ hotel.city }}, {{ hotel.country }}</p>
              <app-status-badge [status]="hotel.status"></app-status-badge>
            </div>
            <div class="hotel-actions">
              <button mat-stroked-button [routerLink]="['/manager/hotels', hotel.id, 'edit']">
                ✏️ Edit
              </button>
              <button mat-raised-button color="primary" [routerLink]="['/manager/hotels', hotel.id, 'rooms']">
                🛏️ Rooms
              </button>
            </div>
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
        padding: 0 16px;
      }

      .hero {
        background: linear-gradient(135deg, #26a69a 0%, #26c6da 100%);
        padding: 64px 48px;
        border-radius: 16px;
        margin: 28px 0 40px;
        color: white;
        box-shadow: 0 20px 40px rgba(38, 166, 154, 0.15);
      }

      .hero-content {
        max-width: 600px;
      }

      .hero h1 {
        margin: 16px 0 0;
        font-size: 2.6rem;
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .eyebrow {
        margin: 0 0 12px;
        font-size: 0.95rem;
        font-weight: 600;
        opacity: 0.95;
        letter-spacing: 0.5px;
      }

      .subtitle {
        margin: 16px 0 28px;
        opacity: 0.95;
        font-size: 1.05rem;
        line-height: 1.6;
        max-width: 580px;
      }

      .cta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .cta button {
        font-size: 1rem;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }

      .cta button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .icon {
        font-size: 1.2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin: 0 0 40px;
      }

      .stat-card {
        padding: 28px 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #26a69a 0%, #26c6da 100%);
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(38, 166, 154, 0.12);
        border-color: #26a69a;
      }

      .stat-icon {
        font-size: 3.2rem;
        margin-bottom: 12px;
        opacity: 0.95;
      }

      .label {
        margin: 0 0 8px;
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat {
        margin: 0 0 4px;
        font-size: 2.8rem;
        font-weight: 700;
        color: #26a69a;
        line-height: 1;
      }

      .recent-section {
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(2, 6, 23, 0.06);
      }

      .section-header {
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }

      .section-header h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
        color: #0f2742;
      }

      .hotel-list {
        display: grid;
        gap: 16px;
      }

      .hotel-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 10px;
        transition: all 0.2s ease;
        border: 1px solid #e2e8f0;
      }

      .hotel-item:hover {
        background: white;
        border-color: #26a69a;
        box-shadow: 0 4px 12px rgba(38, 166, 154, 0.1);
      }

      .hotel-info h4 {
        margin: 0 0 6px;
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f2742;
      }

      .location {
        margin: 0 0 8px;
        color: #64748b;
        font-size: 0.9rem;
      }

      .hotel-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .hotel-actions button {
        border-radius: 6px;
        font-weight: 600;
        white-space: nowrap;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border: 2px dashed #cbd5e1;
      }

      .empty-state .emoji {
        font-size: 3.5rem;
        margin: 0 0 12px;
      }

      .empty-state .title {
        margin: 0 0 6px;
        font-size: 1.2rem;
        font-weight: 600;
        color: #0f2742;
      }

      .empty-state .subtitle {
        margin: 0;
        color: #64748b;
      }

      @media (max-width: 768px) {
        .hero {
          padding: 48px 28px;
          margin: 20px 0 28px;
        }

        .hero h1 {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 0.95rem;
          margin: 12px 0 20px;
        }

        .cta {
          gap: 12px;
        }

        .cta button {
          flex: 1;
          justify-content: center;
        }

        .stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .stat {
          font-size: 2.2rem;
        }

        .stat-icon {
          font-size: 2.4rem;
        }

        .hotel-item {
          flex-direction: column;
          align-items: stretch;
        }

        .hotel-actions {
          width: 100%;
        }

        .hotel-actions button {
          flex: 1;
        }
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
