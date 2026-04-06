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
        <h1>My Hotels</h1>
        <button mat-flat-button color="primary" routerLink="/manager/hotels/new">Add New Hotel</button>
      </div>

      <mat-card *ngIf="!hotels.length">No hotels yet.</mat-card>

      <div class="grid">
        <mat-card *ngFor="let hotel of hotels">
          <h3>{{ hotel.name }}</h3>
          <p>{{ hotel.city }}, {{ hotel.country }}</p>
          <app-status-badge [status]="hotel.status"></app-status-badge>
          <div class="actions">
            <button mat-button (click)="edit(hotel.id)">Edit</button>
            <button mat-button (click)="rooms(hotel.id)">Manage Rooms</button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 960px;
        margin: 20px auto;
        padding: 0 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .grid {
        display: grid;
        gap: 12px;
        margin-top: 14px;
      }

      .actions {
        display: flex;
        gap: 8px;
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
