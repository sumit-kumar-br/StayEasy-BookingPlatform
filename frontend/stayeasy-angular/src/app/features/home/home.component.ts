import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HotelCardComponent } from '../../shared/components/hotel-card/hotel-card.component';
import { SearchService } from '../../core/services/search.service';
import { Hotel } from '../../models/hotel.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    HotelCardComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <section class="hero">
      <div class="overlay">
        <h1>Find your perfect stay</h1>
        <p class="subtitle">Luxury hotels, effortless booking, unforgettable trips.</p>

        <div class="search-panel">
          <form [formGroup]="form" (ngSubmit)="search()" class="search-grid">
            <mat-form-field appearance="outline">
              <mat-label>Destination</mat-label>
              <input matInput formControlName="city" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Check-in</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkIn" />
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Check-out</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOut" />
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Guests</mat-label>
              <input matInput type="number" min="1" formControlName="guests" />
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit">Search Hotels</button>
          </form>
        </div>
      </div>
    </section>

    <section class="content">
      <h2>Featured Hotels</h2>
      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <div class="grid" *ngIf="!isLoading">
        <app-hotel-card *ngFor="let hotel of featuredHotels" [hotel]="hotel"></app-hotel-card>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        min-height: 520px;
        position: relative;
        background: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop')
          center/cover;
      }

      .hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(102deg, rgba(8, 30, 58, 0.88), rgba(17, 74, 124, 0.7));
      }

      .overlay {
        position: relative;
        z-index: 1;
        max-width: 1120px;
        margin: 0 auto;
        padding: 68px 16px;
        color: #f3f8ff;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.2rem);
        letter-spacing: 0.2px;
      }

      .subtitle {
        margin: 12px 0 24px;
        color: #d9e9fb;
        font-size: 1.06rem;
      }

      .search-panel {
        background: rgba(7, 29, 54, 0.46);
        border: 1px solid rgba(186, 220, 255, 0.25);
        border-radius: 16px;
        padding: 14px;
        backdrop-filter: blur(8px);
      }

      .search-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .search-grid button {
        min-height: 56px;
        border-radius: 10px;
        font-weight: 600;
      }

      .search-panel ::ng-deep .mat-mdc-text-field-wrapper {
        background: rgba(247, 251, 255, 0.94);
      }

      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
        border-color: rgba(17, 74, 124, 0.35) !important;
      }

      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing {
        border-color: #1994c7 !important;
      }

      .content {
        max-width: 1120px;
        margin: 34px auto;
        padding: 0 16px;
      }

      h2 {
        color: #0f2742;
      }

      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      @media (max-width: 768px) {
        .overlay {
          padding-top: 44px;
        }

        .search-panel {
          padding: 10px;
          border-radius: 12px;
        }
      }
    `
  ]
})
export class HomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);

  featuredHotels: Hotel[] = [];
  isLoading = false;

  form = this.fb.group({
    city: ['', Validators.required],
    checkIn: [new Date(), Validators.required],
    checkOut: [new Date(Date.now() + 86_400_000), Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.isLoading = true;
    this.searchService.searchHotels({}).subscribe({
      next: (hotels) => {
        this.featuredHotels = hotels.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  search(): void {
    const value = this.form.getRawValue();
    this.router.navigate(['/hotels/search'], {
      queryParams: {
        city: value.city,
        checkIn: this.toIsoDate(value.checkIn),
        checkOut: this.toIsoDate(value.checkOut),
        guests: value.guests
      }
    });
  }

  private toIsoDate(date: Date | null): string {
    return date ? date.toISOString().split('T')[0] : '';
  }
}
