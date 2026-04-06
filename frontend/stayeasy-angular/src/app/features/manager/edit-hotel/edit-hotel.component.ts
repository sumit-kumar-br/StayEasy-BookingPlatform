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
      <h2>Edit Hotel</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Address</mat-label><input matInput formControlName="address" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Country</mat-label><input matInput formControlName="country" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Star Rating</mat-label><input matInput type="number" min="1" max="5" formControlName="starRating" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Latitude</mat-label><input matInput type="number" formControlName="latitude" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Longitude</mat-label><input matInput type="number" formControlName="longitude" /></mat-form-field>
        <button mat-flat-button color="primary" [disabled]="form.invalid">Update</button>
      </form>

      <hr />
      <h3>Upload Photo</h3>
      <input type="file" accept="image/*" (change)="onFileSelected($event)" />
      <button mat-stroked-button color="primary" [disabled]="!selectedFile" (click)="uploadPhoto()">
        Upload Photo
      </button>
    </mat-card>
  `,
  styles: [`.card { max-width: 760px; margin: 24px auto; padding: 24px; } form { display: grid; gap: 12px; }`]
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
    });
  }
}
