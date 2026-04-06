import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomType } from '../../../models/room-type.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <section class="container">
      <div class="header">
        <div class="header-content">
          <h2 class="eyebrow">🛏️ Room Inventory</h2>
          <h1>Manage Rooms</h1>
          <p>Configure room types, pricing, and availability for your property.</p>
        </div>
      </div>

      <mat-card class="form-card">
        <div class="form-header">
          <h3>➕ Add New Room Type</h3>
          <p>Create a new room configuration and pricing option</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="addRoom()" class="form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="col-2">
              <mat-label>Room Type Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g., Deluxe Suite" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="col-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Describe this room type..." rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Occupancy</mat-label>
              <input matInput type="number" min="1" formControlName="maxOccupancy" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price per Night</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="pricePerNight" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Total Rooms</mat-label>
              <input matInput type="number" min="1" formControlName="totalRooms" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Bed Configuration</mat-label>
              <input matInput formControlName="bedConfiguration" placeholder="e.g., 1 Queen, 2 Twin" />
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" [disabled]="form.invalid" class="form-submit">
            <span class="icon">✓</span> Add Room Type
          </button>
        </form>
      </mat-card>

      <section class="rooms-section" *ngIf="rooms.length">
        <h3 class="section-title">📋 Room Types ({{ rooms.length }})</h3>
        <div class="room-grid">
          <mat-card *ngFor="let room of rooms" class="room-card">
            <div class="room-header">
              <h4>{{ room.name }}</h4>
              <button mat-icon-button matTooltip="Delete this room type" (click)="deleteRoom(room)" class="delete-btn">
                🗑️
              </button>
            </div>
            <p class="room-desc">{{ room.description }}</p>
            <div class="room-stats">
              <div class="stat">
                <span class="label">Occupancy</span>
                <span class="value">{{ room.maxOccupancy }} guests</span>
              </div>
              <div class="stat">
                <span class="label">Price</span>
                <span class="value">{{ room.pricePerNight | currency: 'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="label">Available</span>
                <span class="value">{{ room.totalRooms }} rooms</span>
              </div>
            </div>
            <p class="bed-config">🛏️ {{ room.bedConfiguration }}</p>
            <button mat-stroked-button color="warn" (click)="deleteRoom(room)" class="delete-btn-full">
              Delete Room Type
            </button>
          </mat-card>
        </div>
      </section>

      <div class="empty-state" *ngIf="!rooms.length">
        <p class="emoji">🛏️</p>
        <p class="title">No room types yet</p>
        <p class="subtitle">Add your first room type using the form above</p>
      </div>
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .header {
        margin: 28px 0 40px;
      }

      .header-content {
        max-width: 700px;
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

      .form-card {
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(2, 6, 23, 0.06);
        margin-bottom: 40px;
      }

      .form-header {
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }

      .form-header h3 {
        margin: 0 0 6px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f2742;
      }

      .form-header p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
      }

      .form {
        display: grid;
        gap: 16px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .form-grid .col-2 {
        grid-column: span 2;
      }

      .form-grid .col-full {
        grid-column: 1 / -1;
      }

      .form-submit {
        width: 100%;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
      }

      .form-submit:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        font-size: 1.2rem;
      }

      .rooms-section {
        margin-bottom: 40px;
      }

      .section-title {
        margin: 0 0 24px;
        font-size: 1.3rem;
        font-weight: 700;
        color: #0f2742;
      }

      .room-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .room-card {
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.05);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .room-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #26a69a 0%, #26c6da 100%);
      }

      .room-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(38, 166, 154, 0.1);
        border-color: #26a69a;
      }

      .room-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .room-header h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f2742;
        flex: 1;
      }

      .delete-btn {
        cursor: pointer;
        font-size: 1.2rem;
        padding: 4px;
        transition: all 0.2s ease;
      }

      .delete-btn:hover {
        opacity: 0.7;
        transform: scale(1.1);
      }

      .room-desc {
        margin: 0 0 16px;
        color: #475569;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .room-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
      }

      .stat {
        text-align: center;
      }

      .stat .label {
        display: block;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .stat .value {
        display: block;
        color: #26a69a;
        font-size: 1rem;
        font-weight: 700;
      }

      .bed-config {
        margin: 0 0 16px;
        color: #64748b;
        font-size: 0.9rem;
        padding: 8px;
        background: #f0f4fa;
        border-radius: 6px;
        text-align: center;
      }

      .delete-btn-full {
        width: 100%;
        border-radius: 6px;
        font-weight: 600;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border: 2px dashed #cbd5e1;
        margin-top: 40px;
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
          margin: 20px 0 28px;
        }

        .header h1 {
          font-size: 1.8rem;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .form-grid .col-2 {
          grid-column: 1;
        }

        .room-grid {
          grid-template-columns: 1fr;
        }

        .room-stats {
          grid-template-columns: 1fr;
        }

        .form-card {
          padding: 20px;
        }
      }
    `
  ]
})
export class ManageRoomsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  hotelId = '';
  rooms: RoomType[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    maxOccupancy: [2, Validators.required],
    pricePerNight: [100, Validators.required],
    totalRooms: [1, Validators.required],
    bedConfiguration: ['1 Queen', Validators.required]
  });

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadRooms();
  }

  loadRooms(): void {
    if (!this.hotelId) {
      return;
    }

    this.hotelService.getRoomTypes(this.hotelId).subscribe((rooms) => {
      this.rooms = rooms;
    });
  }

  addRoom(): void {
    if (this.form.invalid || !this.hotelId) {
      return;
    }

    const value = this.form.getRawValue();
    this.hotelService
      .createRoomType(this.hotelId, {
        name: value.name ?? '',
        description: value.description ?? '',
        maxOccupancy: value.maxOccupancy ?? 2,
        pricePerNight: value.pricePerNight ?? 100,
        totalRooms: value.totalRooms ?? 1,
        bedConfiguration: value.bedConfiguration ?? '1 Queen'
      })
      .subscribe(() => {
        this.form.reset({
          maxOccupancy: 2,
          pricePerNight: 100,
          totalRooms: 1,
          bedConfiguration: '1 Queen'
        });
        this.loadRooms();
      });
  }

  deleteRoom(room: RoomType): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete room type',
        message: `Delete ${room.name}?`,
        confirmText: 'Delete'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !this.hotelId) {
        return;
      }

      this.hotelService.deleteRoomType(this.hotelId, room.id).subscribe(() => this.loadRooms());
    });
  }
}
