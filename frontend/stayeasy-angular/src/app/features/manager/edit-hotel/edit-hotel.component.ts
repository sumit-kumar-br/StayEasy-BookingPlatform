import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../../core/services/hotel.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-edit-hotel',
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
        <h2 class="title">✏️ Edit Hotel Details</h2>
        <p class="subtitle">Update your hotel information and manage photos</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Hotel Name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Country</mat-label>
            <input matInput formControlName="country" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-full">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" />
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
            <span class="icon">✓</span> Save Changes
          </button>
        </div>
      </form>

      <div class="photo-section">
        <h3 class="section-title">📷 Hotel Photos</h3>
        <p class="section-subtitle">Upload hotel photos to showcase your property</p>
        
        <div class="photo-upload">
          <input id="file-input" type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput />
          <label for="file-input" class="file-label">
            <span>📁 Choose Photo</span>
          </label>
          <button mat-raised-button color="primary" [disabled]="!selectedFile" (click)="uploadPhoto()" class="upload-btn">
            <span class="icon">⬆️</span> Upload Photo
          </button>
          <p class="file-info" *ngIf="selectedFile">Selected: {{ selectedFile.name }}</p>
        </div>
      </div>
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
        margin-bottom: 28px;
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
        display: flex;
        gap: 12px;
      }

      .submit-btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        flex: 1;
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

      .photo-section {
        padding: 24px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0f4fa 100%);
        border-radius: 10px;
        border: 1px solid #e2e8f0;
      }

      .section-title {
        margin: 0 0 6px;
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f2742;
      }

      .section-subtitle {
        margin: 0 0 16px;
        color: #64748b;
        font-size: 0.9rem;
      }

      .photo-upload {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      input[type="file"] {
        display: none;
      }

      .file-label {
        padding: 10px 16px;
        background: white;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.95rem;
      }

      .file-label:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .upload-btn {
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transition: all 0.3s ease;
      }

      .upload-btn:hover:not([disabled]) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .upload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .file-info {
        margin: 0;
        color: #667eea;
        font-size: 0.85rem;
        font-weight: 600;
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

        .photo-upload {
          flex-direction: column;
        }

        .file-label,
        .upload-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `
  ]
})
export class EditHotelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  hotelId = '';
  selectedFile: File | null = null;

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

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.hotelId) {
      this.router.navigate(['/manager/hotels']);
      return;
    }

    this.hotelService.getHotelById(this.hotelId).subscribe((hotel) => {
      this.form.patchValue({
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        address: hotel.address,
        country: hotel.country,
        starRating: hotel.starRating,
        latitude: hotel.latitude ?? 0,
        longitude: hotel.longitude ?? 0
      });
    });
  }

  submit(): void {
    if (this.form.invalid || !this.hotelId) {
      return;
    }

    const value = this.form.getRawValue();
    this.hotelService
      .updateHotel(this.hotelId, {
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.hotelId) {
      return;
    }

    this.hotelService.uploadPhoto(this.hotelId, this.selectedFile).subscribe(() => {
      this.notification.success('Photo uploaded successfully.');
      this.selectedFile = null;
    }, () => {
      this.notification.error('Photo upload failed. Please try again.');
    });
  }
}
