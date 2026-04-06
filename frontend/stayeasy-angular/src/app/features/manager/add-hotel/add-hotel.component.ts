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
      <h2>Add Hotel</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Address</mat-label><input matInput formControlName="address" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Country</mat-label><input matInput formControlName="country" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Star Rating (1-5)</mat-label><input matInput type="number" min="1" max="5" formControlName="starRating" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Latitude</mat-label><input matInput type="number" formControlName="latitude" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Longitude</mat-label><input matInput type="number" formControlName="longitude" /></mat-form-field>
        <button mat-flat-button color="primary" [disabled]="form.invalid">Save</button>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .card { max-width: 760px; margin: 24px auto; padding: 24px; }
      form { display: grid; gap: 12px; }
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
