import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';

@Component({
  selector: 'app-add-hotel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="card">
      <div class="card-header">
        <h2 class="title">🏨 Add New Hotel</h2>
        <p class="subtitle">Create a new hotel listing to start managing properties on the platform</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Hotel Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., Grand Plaza Hotel" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Describe your hotel, amenities, and unique features..." rows="4"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="e.g., New York" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Country</mat-label>
            <input matInput formControlName="country" placeholder="e.g., United States" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" placeholder="Street address" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Star Rating (1-5)</mat-label>
            <input matInput type="number" min="1" max="5" formControlName="starRating" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Latitude</mat-label>
            <input matInput type="number" step="0.0001" formControlName="latitude" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Longitude</mat-label>
            <input matInput type="number" step="0.0001" formControlName="longitude" />
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" [disabled]="form.invalid" class="submit-btn">
            <span class="icon">✓</span> Create Hotel
          </button>
          <p class="help-text">All fields are required. You'll be able to add rooms after creation.</p>
        </div>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 760px;
        margin: 28px auto;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 12px rgba(2, 6, 23, 0.08);
      }

      .card-header {
        margin-bottom: 28px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;
      }

      .title {
        margin: 0 0 8px;
        font-size: 1.8rem;
        font-weight: 700;
        color: #0f2742;
      }

      .subtitle {
        margin: 0;
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.6;
      }

      form {
        display: grid;
        gap: 16px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .form-grid .col-full {
        grid-column: 1 / -1;
      }

      mat-form-field {
        width: 100%;
      }

      .form-actions {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
      }

      .submit-btn {
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
        margin-bottom: 16px;
      }

      .submit-btn:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        font-size: 1.2rem;
      }

      .help-text {
        margin: 0;
        color: #64748b;
        font-size: 0.85rem;
        text-align: center;
      }

      @media (max-width: 768px) {
        .card {
          margin: 16px;
          padding: 20px;
        }

        .title {
          font-size: 1.5rem;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AddHotelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    country: ['', Validators.required],
    starRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.hotelService
      .createHotel({
        name: value.name ?? '',
        description: value.description ?? '',
        city: value.city ?? '',
        address: value.address ?? '',
        country: value.country ?? '',
        starRating: value.starRating ?? 3,
        latitude: value.latitude ?? 0,
        longitude: value.longitude ?? 0
      })
      .subscribe(() => {
      this.router.navigate(['/manager/hotels']);
    });
  }
}
