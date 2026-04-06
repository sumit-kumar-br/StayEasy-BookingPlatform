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
        <h1>Hotel Management</h1>
        <p>Review and moderate all hotel listings across the platform.</p>
      </div>

      <div class="page-nav">
        <a routerLink="/workspace">Workspace</a>
        <a routerLink="/admin/users">User Management</a>
        <a routerLink="/admin/dashboard">Admin Dashboard</a>
      </div>

      <mat-tab-group (selectedTabChange)="tabChanged($event.index)">
        <mat-tab label="All"></mat-tab>
        <mat-tab label="PendingReview"></mat-tab>
        <mat-tab label="Approved"></mat-tab>
        <mat-tab label="Suspended"></mat-tab>
      </mat-tab-group>

      <div class="list">
        <mat-card *ngFor="let hotel of filteredHotels">
          <div class="top">
            <h3>{{ hotel.name }}</h3>
            <app-status-badge [status]="hotel.status"></app-status-badge>
          </div>
          <p>{{ hotel.city }}, {{ hotel.country }}</p>
          <p class="desc">{{ hotel.description }}</p>
          <div class="actions">
            <button mat-button color="primary" (click)="approve(hotel.id)">Approve</button>
            <button mat-button color="warn" (click)="reject(hotel.id)">Reject</button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container { max-width: 1024px; margin: 20px auto; padding: 0 16px; }
      .header { margin-bottom: 8px; }
      .header h1 { margin: 0; }
      .header p { margin: 6px 0 0; color: #64748b; }
      .page-nav { margin: 8px 0 14px; display: flex; flex-wrap: wrap; gap: 8px; }
      .page-nav a {
        text-decoration: none;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 5px 11px;
        font-weight: 600;
      }
      .page-nav a:hover { color: #1d4ed8; border-color: #1d4ed8; }
      .list { display: grid; gap: 12px; margin-top: 14px; }
      .top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .desc { color: #475569; }
      .actions { display: flex; gap: 8px; }
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
