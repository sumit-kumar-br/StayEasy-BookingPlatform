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
      <div class="hero">
        <div class="hero-content">
          <h2 class="eyebrow">🎛️ Platform Control</h2>
          <h1>Admin Dashboard</h1>
          <p>Comprehensive platform oversight with real-time insights and management controls.</p>
          <div class="cta">
            <button mat-raised-button color="primary" routerLink="/admin/hotels">
              <span class="icon">📋</span> Review Hotels
            </button>
            <button mat-raised-button color="accent" routerLink="/admin/users">
              <span class="icon">👥</span> Manage Users
            </button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-icon">📊</div>
          <p class="label">Total Hotels</p>
          <p class="stat">{{ hotels.length }}</p>
          <p class="subtitle">Across all regions</p>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon">⏳</div>
          <p class="label">Pending Approvals</p>
          <p class="stat">{{ pendingCount }}</p>
          <p class="subtitle">Awaiting review</p>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon">✅</div>
          <p class="label">Approved Hotels</p>
          <p class="stat">{{ approvedCount }}</p>
          <p class="subtitle">Active listings</p>
        </mat-card>
      </div>
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 64px 48px;
        border-radius: 16px;
        margin: 28px 0 40px;
        color: white;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
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

      .hero h2 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        opacity: 0.95;
        letter-spacing: 0.5px;
      }

      .hero p {
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
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(102, 126, 234, 0.12);
        border-color: #667eea;
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
        color: #667eea;
        line-height: 1;
      }

      .subtitle {
        margin: 0;
        color: #94a3b8;
        font-size: 0.8rem;
      }

      @media (max-width: 768px) {
        .hero {
          padding: 48px 28px;
          border-radius: 14px;
          margin: 20px 0 32px;
        }

        .hero h1 {
          font-size: 2rem;
        }

        .hero p {
          font-size: 0.95rem;
          margin: 12px 0 20px;
        }

        .cta {
          gap: 12px;
        }

        .cta button {
          flex: 1;
          min-height: 44px;
        }

        .stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 0 0 24px;
        }

        .stat {
          font-size: 2.2rem;
        }

        .stat-icon {
          font-size: 2.4rem;
        }
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
