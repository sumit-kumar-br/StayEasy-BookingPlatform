import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../models/hotel.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-hotel-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatTabsModule, StatusBadgeComponent],
  template: `
    <section class="container">
      <div class="header">
        <div class="header-content">
          <h2 class="eyebrow">🏨 Hotel Moderation</h2>
          <h1>Hotel Management</h1>
          <p>Review and moderate all hotel listings across the platform with comprehensive controls.</p>
        </div>
      </div>

      <div class="page-nav">
        <a routerLink="/workspace">Workspace</a>
        <a routerLink="/admin/users">User Management</a>
        <a routerLink="/admin/dashboard">Admin Dashboard</a>
      </div>

      <mat-tab-group (selectedTabChange)="tabChanged($event.index)" class="tabs-container">
        <mat-tab label="📋 All"></mat-tab>
        <mat-tab label="⏳ Pending Review"></mat-tab>
        <mat-tab label="✅ Approved"></mat-tab>
        <mat-tab label="🚫 Suspended"></mat-tab>
      </mat-tab-group>

      <div class="list">
        <mat-card *ngFor="let hotel of filteredHotels" class="hotel-card">
          <div class="card-header">
            <div>
              <h3>{{ hotel.name }}</h3>
              <p class="location">📍 {{ hotel.city }}, {{ hotel.country }}</p>
            </div>
            <app-status-badge [status]="hotel.status"></app-status-badge>
          </div>
          <p class="description">{{ hotel.description }}</p>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="approve(hotel.id)">
              <span>✓</span> Approve
            </button>
            <button mat-stroked-button color="warn" (click)="reject(hotel.id)">
              <span>✕</span> Reject
            </button>
          </div>
        </mat-card>

        <div *ngIf="filteredHotels.length === 0" class="empty-state">
          <p class="emoji">🏢</p>
          <p class="title">No hotels to display</p>
          <p class="subtitle">There are no hotels in this category yet.</p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .container { 
        max-width: 1024px; 
        margin: 0 auto; 
        padding: 0 16px; 
      }

      .header {
        margin: 28px 0 32px;
      }

      .header-content {
        max-width: 700px;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #667eea;
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

      .page-nav {
        margin: 24px 0 28px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .page-nav a {
        text-decoration: none;
        color: #0f2742;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .page-nav a:hover {
        color: white;
        background: #667eea;
        border-color: #667eea;
      }

      .tabs-container {
        margin-bottom: 28px;
      }

      ::ng-deep .tabs-container .mat-mdc-tab-header {
        border-bottom: 2px solid #e2e8f0;
      }

      ::ng-deep .tabs-container .mat-mdc-tab-header-pagination-chevron {
        border-color: #667eea;
      }

      ::ng-deep .tabs-container .mat-mdc-tab {
        font-weight: 600;
        min-width: 140px;
      }

      ::ng-deep .tabs-container .mat-mdc-tab.mat-mdc-tab-active {
        color: #667eea;
      }

      ::ng-deep .tabs-container .mdc-tab__text-label {
        font-size: 0.95rem;
      }

      ::ng-deep .tabs-container .mdc-tab-indicator__content {
        border-color: #667eea;
      }

      .list {
        display: grid;
        gap: 16px;
        margin-bottom: 40px;
      }

      .hotel-card {
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
      }

      .hotel-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
        border-color: #667eea;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
      }

      .hotel-card h3 {
        margin: 0 0 4px;
        font-size: 1.3rem;
        font-weight: 700;
        color: #0f2742;
      }

      .location {
        margin: 0;
        color: #64748b;
        font-size: 0.95rem;
      }

      .description {
        margin: 0 0 20px;
        color: #475569;
        font-size: 0.98rem;
        line-height: 1.6;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .actions button {
        border-radius: 6px;
        font-weight: 600;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .actions button span {
        font-weight: bold;
      }

      .actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        border-radius: 12px;
        background: #f8fafc;
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
        .header {
          margin: 20px 0 24px;
        }

        .header h1 {
          font-size: 1.8rem;
        }

        .header p {
          font-size: 0.95rem;
        }

        .page-nav {
          gap: 8px;
        }

        .page-nav a {
          padding: 6px 12px;
          font-size: 0.85rem;
        }

        .card-header {
          flex-direction: column;
        }

        .hotel-card {
          padding: 16px;
        }

        .actions {
          flex-direction: column;
        }

        .actions button {
          width: 100%;
          justify-content: center;
        }
      }
    `
  ]
})
export class HotelManagementComponent implements OnInit {
  private readonly hotelService = inject(HotelService);

  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  statusFilter = 'all';

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().subscribe((hotels) => {
      this.hotels = hotels;
      this.applyFilter();
    });
  }

  tabChanged(index: number): void {
    this.statusFilter = ['all', 'pendingreview', 'approved', 'suspended'][index] ?? 'all';
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.statusFilter === 'all') {
      this.filteredHotels = this.hotels;
      return;
    }

    this.filteredHotels = this.hotels.filter((h) => String(h.status).toLowerCase() === this.statusFilter);
  }

  approve(id: string): void {
    this.hotelService.approveHotel(id).subscribe(() => this.loadHotels());
  }

  reject(id: string): void {
    this.hotelService.rejectHotel(id).subscribe(() => this.loadHotels());
  }
}
